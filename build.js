const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const projectRoot = __dirname;
const distRoot = path.resolve(projectRoot, 'dist');
const profilesPath = path.resolve(projectRoot, 'build.profiles.json');
const angularCliPath = path.resolve(projectRoot, 'node_modules/@angular/cli/bin/ng.js');
const configAuditPath = path.resolve(projectRoot, 'scripts/runtime-config-audit.mjs');
const releaseMetadataAuditPath = path.resolve(projectRoot, 'scripts/release-metadata-audit.mjs');
const releaseArtifactAuditPath = path.resolve(projectRoot, 'scripts/release-artifact-audit.mjs');
const target = process.argv[2];

if (!target) {
    console.error('❌ No build target provided');
    process.exit(1);
}

const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
const profile = profiles[target];

if (!profile) {
    console.error(`❌ Profile not found: ${target}`);
    process.exit(1);
}

function resolveDistChild(relativePath, label) {
    const absolutePath = path.resolve(projectRoot, relativePath);
    const isInsideDist = absolutePath.startsWith(`${distRoot}${path.sep}`);

    if (!isInsideDist) {
        throw new Error(`${label} must be inside the dist directory.`);
    }

    return absolutePath;
}

function findBuildOutput(stagingPath) {
    const directIndex = path.join(stagingPath, 'index.html');
    if (fs.existsSync(directIndex)) {
        return stagingPath;
    }

    const browserPath = path.join(stagingPath, 'browser');
    if (fs.existsSync(path.join(browserPath, 'index.html'))) {
        return browserPath;
    }

    return null;
}

function walkFiles(rootPath) {
    const files = [];
    for (const entry of fs.readdirSync(rootPath)) {
        const fullPath = path.join(rootPath, entry);
        if (fs.statSync(fullPath).isDirectory()) files.push(...walkFiles(fullPath));
        else files.push(fullPath);
    }
    return files;
}

function archiveSourceMaps(publicPath, archivePath) {
    const sourceMaps = walkFiles(publicPath).filter(file => file.endsWith('.map'));
    fs.rmSync(archivePath, { recursive: true, force: true });

    for (const sourceMap of sourceMaps) {
        const relativePath = path.relative(publicPath, sourceMap);
        const destination = path.join(archivePath, relativePath);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.copyFileSync(sourceMap, destination);
        fs.rmSync(sourceMap);
    }

    return sourceMaps.length;
}

function stripSourceMapReferences(publicPath) {
    let changedFiles = 0;
    for (const file of walkFiles(publicPath).filter(file => /\.(?:js|css)$/i.test(file))) {
        const source = fs.readFileSync(file, 'utf8');
        const sanitized = source
            .replace(/\/\*[#@]\s*sourceMappingURL=[^*]*\*\//g, '')
            .replace(/\/\/[#@]\s*sourceMappingURL=.*$/gm, '');
        if (sanitized !== source) {
            fs.writeFileSync(file, sanitized, 'utf8');
            changedFiles += 1;
        }
    }
    return changedFiles;
}

function createReleaseManifest(publicPath, profileName, appVersion) {
    const files = walkFiles(publicPath)
        .map(file => ({
            path: path.relative(publicPath, file).split(path.sep).join('/'),
            sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
        }))
        .filter(file => file.path !== 'release.json')
        .sort((left, right) => left.path.localeCompare(right.path));

    let sourceRevision = 'unavailable';
    let sourceDirty = true;
    try {
        sourceRevision = execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
            cwd: projectRoot,
            encoding: 'utf8',
        }).trim();
        sourceDirty = execFileSync('git', ['status', '--porcelain'], {
            cwd: projectRoot,
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024,
        }).trim().length > 0;
    } catch {
        // A source archive can be built without Git; the manifest records that fact.
    }

    const manifest = {
        schemaVersion: 1,
        application: 'KowsarPanel',
        appVersion,
        profile: profileName,
        builtAtUtc: new Date().toISOString(),
        sourceRevision,
        sourceDirty,
        files,
    };
    fs.writeFileSync(
        path.join(publicPath, 'release.json'),
        `${JSON.stringify(manifest, null, 2)}\n`,
        'utf8',
    );
}

const sourceConfig = path.resolve(projectRoot, 'src/assets/configs', profile.config);
const finalOutput = resolveDistChild(profile.output, 'Profile output');
const stagingOutput = resolveDistChild(`dist/.profile-build-${target}`, 'Staging output');
const sourceMapStaging = resolveDistChild(`dist/.source-map-build-${target}`, 'Source-map staging output');

if (!fs.existsSync(sourceConfig)) {
    console.error(`❌ Config not found: ${sourceConfig}`);
    process.exit(1);
}

if (!fs.existsSync(angularCliPath)) {
    console.error('❌ Angular CLI is not installed. Run npm install first.');
    process.exit(1);
}

console.log(`🚀 Building profile: ${target}`);

try {
    fs.rmSync(stagingOutput, { recursive: true, force: true });
    fs.rmSync(sourceMapStaging, { recursive: true, force: true });

    try {
        execFileSync(
            process.execPath,
            [configAuditPath, sourceConfig],
            { cwd: projectRoot, stdio: 'inherit' },
        );
    } catch {
        throw new Error(`Runtime config audit failed for profile "${target}".`);
    }

    execFileSync(
        process.execPath,
        [releaseMetadataAuditPath],
        { cwd: projectRoot, stdio: 'inherit' },
    );

    execFileSync(
        process.execPath,
        [
            angularCliPath,
            'build',
            '--configuration',
            'production',
            '--output-path',
            stagingOutput,
            '--base-href',
            profile.baseHref,
        ],
        { cwd: projectRoot, stdio: 'inherit' },
    );

    const builtPath = findBuildOutput(stagingOutput);
    if (!builtPath) {
        throw new Error(`Build output not found in ${stagingOutput}`);
    }

    const runtimeConfig = JSON.parse(fs.readFileSync(sourceConfig, 'utf8'));
    if (!/^[0-9A-Za-z._-]+$/.test(runtimeConfig.appVersion ?? '')) {
        throw new Error('Runtime appVersion cannot be used as a release directory name.');
    }

    fs.copyFileSync(sourceConfig, path.join(builtPath, 'assets/config.json'));

    const htaccessContent = [
        'RewriteEngine On',
        `RewriteBase ${profile.baseHref}`,
        '',
        'RewriteRule ^index\\.html$ - [L]',
        'RewriteCond %{REQUEST_FILENAME} !-f',
        'RewriteCond %{REQUEST_FILENAME} !-d',
        `RewriteRule . ${profile.baseHref}index.html [L]`,
    ].join('\n');

    fs.writeFileSync(path.join(builtPath, '.htaccess'), htaccessContent, 'utf8');

    const sourceMapCount = archiveSourceMaps(builtPath, sourceMapStaging);
    if (sourceMapCount === 0) {
        throw new Error('Production build did not generate private source maps.');
    }
    const sanitizedBundleCount = stripSourceMapReferences(builtPath);

    createReleaseManifest(builtPath, target, runtimeConfig.appVersion);
    execFileSync(
        process.execPath,
        [releaseArtifactAuditPath, builtPath, sourceMapStaging],
        { cwd: projectRoot, stdio: 'inherit' },
    );

    const finalSourceMaps = resolveDistChild(
        `dist/.source-maps/${target}/${runtimeConfig.appVersion}`,
        'Private source-map output',
    );
    fs.rmSync(finalOutput, { recursive: true, force: true });
    fs.cpSync(builtPath, finalOutput, { recursive: true });
    fs.rmSync(finalSourceMaps, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(finalSourceMaps), { recursive: true });
    fs.cpSync(sourceMapStaging, finalSourceMaps, { recursive: true });

    console.log(`📦 Build output: ${finalOutput}`);
    console.log(`🔒 Private source maps: ${finalSourceMaps} (${sourceMapCount} files)`);
    console.log(`🧹 Source-map references removed from ${sanitizedBundleCount} public files`);
    console.log('🎉 Build completed successfully');
} catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
} finally {
    fs.rmSync(stagingOutput, { recursive: true, force: true });
    fs.rmSync(sourceMapStaging, { recursive: true, force: true });
    console.log('✅ Build staging cleaned');
}
