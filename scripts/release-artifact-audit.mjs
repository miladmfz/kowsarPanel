import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const artifactRoot = resolve(projectRoot, process.argv[2] ?? '');
const privateMapsRoot = process.argv[3] ? resolve(projectRoot, process.argv[3]) : undefined;
const errors = [];

if (!process.argv[2]) {
  console.error('Usage: node scripts/release-artifact-audit.mjs <artifact-directory> [private-source-map-directory]');
  process.exit(2);
}

for (const required of ['index.html', 'assets/config.json', '.htaccess', 'release.json']) {
  if (!existsSync(join(artifactRoot, required))) {
    errors.push(`Missing release file: ${required}`);
  }
}

const publicFiles = existsSync(artifactRoot) ? walkFiles(artifactRoot) : [];
const publicMaps = publicFiles.filter(file => file.endsWith('.map'));
if (publicMaps.length > 0) {
  errors.push(`Public artifact contains ${publicMaps.length} source map file(s).`);
}

for (const file of publicFiles.filter(file => /\.(?:js|css)$/i.test(file))) {
  if (/sourceMappingURL\s*=/.test(readFileSync(file, 'utf8'))) {
    errors.push(`Public bundle exposes a sourceMappingURL: ${relative(artifactRoot, file)}`);
  }
}

const ngswPath = join(artifactRoot, 'ngsw.json');
if (existsSync(ngswPath) && /\.map(?:"|')/.test(readFileSync(ngswPath, 'utf8'))) {
  errors.push('ngsw.json references a source map.');
}

const forbiddenNames = new Set(['config_bak.json', 'appsettings.runtime.json']);
for (const file of publicFiles) {
  const normalizedName = relative(artifactRoot, file).replaceAll('\\', '/').toLowerCase();
  if (forbiddenNames.has(normalizedName.split('/').at(-1))) {
    errors.push(`Forbidden deployment file found: ${normalizedName}`);
  }
  if (normalizedName.startsWith('assets/configs/')) {
    errors.push(`Non-selected runtime profile leaked into the artifact: ${normalizedName}`);
  }
}

let release;
try {
  release = JSON.parse(readFileSync(join(artifactRoot, 'release.json'), 'utf8'));
} catch (error) {
  errors.push(`release.json is invalid: ${error.message}`);
}

if (release) {
  let config;
  try {
    config = JSON.parse(readFileSync(join(artifactRoot, 'assets/config.json'), 'utf8'));
  } catch (error) {
    errors.push(`assets/config.json is invalid: ${error.message}`);
  }

  if (config && release.appVersion !== config.appVersion) {
    errors.push('release.json and assets/config.json have different appVersion values.');
  }

  if (!Array.isArray(release.files) || release.files.length === 0) {
    errors.push('release.json contains no file checksums.');
  } else {
    const expectedFiles = publicFiles
      .map(file => relative(artifactRoot, file).replaceAll('\\', '/'))
      .filter(file => file !== 'release.json')
      .sort();
    const declaredFiles = release.files.map(item => item.path).sort();

    if (JSON.stringify(expectedFiles) !== JSON.stringify(declaredFiles)) {
      errors.push('release.json file inventory does not match the public artifact.');
    }

    for (const item of release.files) {
      const file = resolve(artifactRoot, item.path);
      if (!file.startsWith(`${artifactRoot}\\`) && !file.startsWith(`${artifactRoot}/`)) {
        errors.push(`Manifest path escapes artifact root: ${item.path}`);
        continue;
      }
      if (!existsSync(file)) continue;
      const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
      if (actual !== item.sha256) {
        errors.push(`Checksum mismatch: ${item.path}`);
      }
    }
  }
}

if (privateMapsRoot) {
  const privateMaps = existsSync(privateMapsRoot)
    ? walkFiles(privateMapsRoot).filter(file => file.endsWith('.map'))
    : [];
  if (privateMaps.length === 0) {
    errors.push('No private source maps were archived.');
  }
}

if (errors.length > 0) {
  console.error('Release artifact audit failed:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Release artifact audit passed (${publicFiles.length} public files, ${privateMapsRoot ? 'private maps verified' : 'source-map archive not requested'}).`,
);

function walkFiles(root) {
  const result = [];
  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry);
    if (statSync(fullPath).isDirectory()) result.push(...walkFiles(fullPath));
    else result.push(fullPath);
  }
  return result;
}
