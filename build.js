const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2];

if (!target) {
    console.log('❌ No build target provided');
    process.exit(1);
}

// ---------------- LOAD PROFILES ----------------

const profiles = JSON.parse(
    fs.readFileSync('build.profiles.json', 'utf8')
);

const profile = profiles[target];

if (!profile) {
    console.log(`❌ Profile not found: ${target}`);
    process.exit(1);
}

console.log(`🚀 Building profile: ${target}`);


// ---------------- CONFIG ----------------

const sourceConfig = `src/assets/configs/${profile.config}`;
const destinationConfig = `src/assets/config.json`;

if (!fs.existsSync(sourceConfig)) {
    console.log(`❌ Config not found: ${sourceConfig}`);
    process.exit(1);
}

fs.copyFileSync(sourceConfig, destinationConfig);

console.log('✅ config.json updated');


// ---------------- INDEX HTML ----------------

const indexPath = 'src/index.html';

const originalIndex = fs.readFileSync(indexPath, 'utf8');

let indexContent = originalIndex;

// set base href
indexContent = indexContent.replace(
    /<base[^>]*href="[^"]*"[^>]*>/i,
    `<base href="${profile.baseHref}" />`
);

fs.writeFileSync(indexPath, indexContent, 'utf8');

console.log('✅ base href updated');


// ---------------- BUILD ----------------

console.log('🚀 Running Angular build...');

execSync(
    `ng build --configuration production`,
    { stdio: 'inherit' }
);


// ---------------- FIND OUTPUT (SAFE + FIXED) ----------------

function findAngularOutput() {
    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) return null;

    const folders = fs.readdirSync(distPath);

    for (const folder of folders) {
        const fullPath = path.join(distPath, folder);

        if (!fs.statSync(fullPath).isDirectory()) continue;

        // case 1: direct build
        if (fs.existsSync(path.join(fullPath, 'index.html'))) {
            return fullPath;
        }

        // case 2: browser folder
        const browserPath = path.join(fullPath, 'browser');
        if (fs.existsSync(path.join(browserPath, 'index.html'))) {
            return browserPath;
        }
    }

    return null;
}

const builtPath = findAngularOutput();

if (!builtPath) {
    console.log('❌ Build output not found');
    process.exit(1);
}

const finalOut = path.join('dist', profile.output.replace('dist/', ''));


// ---------------- SAFE MOVE (NO rename -> FIX EPERM) ----------------

function copyFolder(src, dest) {
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
    }

    fs.cpSync(src, dest, { recursive: true });
}

copyFolder(builtPath, finalOut);

console.log(`📦 Copied: ${builtPath} → ${finalOut}`);


// ---------------- HTACCESS GENERATION ----------------

const htaccessContent = `
RewriteEngine On
RewriteBase ${profile.baseHref}

RewriteRule ^index\\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . ${profile.baseHref}index.html [L]
`.trim();

fs.writeFileSync(path.join(finalOut, '.htaccess'), htaccessContent, 'utf8');

console.log('✅ .htaccess generated');


// ---------------- RESTORE INDEX ----------------

fs.writeFileSync(indexPath, originalIndex, 'utf8');

console.log('✅ index.html restored');

console.log('🎉 Build completed successfully');