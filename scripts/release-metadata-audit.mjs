import { readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const packageJson = readJson('package.json');
const profiles = readJson('build.profiles.json');
const changelog = readFileSync(resolve(projectRoot, 'CHANGELOG.md'), 'utf8');
const errors = [];
const versions = new Map();
const outputs = new Set();

if (packageJson.name !== 'kowsar-panel') {
  errors.push('package.json name must be "kowsar-panel".');
}

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(packageJson.version)) {
  errors.push('package.json version must be a valid three-part SemVer value.');
}

for (const [profileName, profile] of Object.entries(profiles)) {
  if (!profile || typeof profile !== 'object') {
    errors.push(`Profile "${profileName}" must be an object.`);
    continue;
  }

  const configPath = `src/assets/configs/${profile.config}`;
  let config;
  try {
    config = readJson(configPath);
  } catch (error) {
    errors.push(`${profileName}: ${error.message}`);
    continue;
  }

  if (!/^\d+\.\d+\.\d+$/.test(config.appVersion ?? '')) {
    errors.push(`${profileName}: appVersion must contain exactly three numeric segments.`);
  } else {
    versions.set(profileName, config.appVersion);
  }

  const outputPath = resolve(projectRoot, profile.output ?? '');
  const relativeOutput = relative(resolve(projectRoot, 'dist'), outputPath);
  if (!relativeOutput || relativeOutput.startsWith(`..${sep}`) || isAbsolute(relativeOutput)) {
    errors.push(`${profileName}: output must be a child of dist/.`);
  }

  const normalizedOutput = outputPath.toLowerCase();
  if (outputs.has(normalizedOutput)) {
    errors.push(`${profileName}: output path is shared with another profile.`);
  }
  outputs.add(normalizedOutput);
}

const distinctVersions = new Set(versions.values());
if (distinctVersions.size > 1) {
  errors.push(`Runtime profiles disagree on appVersion: ${[...distinctVersions].join(', ')}.`);
}

const [displayVersion] = distinctVersions;
if (displayVersion) {
  const normalizedVersion = displayVersion
    .split('.')
    .map(segment => String(Number.parseInt(segment, 10)))
    .join('.');

  if (normalizedVersion !== packageJson.version) {
    errors.push(
      `package.json version ${packageJson.version} does not match normalized appVersion ${normalizedVersion}.`,
    );
  }

  if (!changelog.includes(`## [${displayVersion}]`)) {
    errors.push(`CHANGELOG.md has no release entry for ${displayVersion}.`);
  }
}

if (errors.length > 0) {
  console.error('Release metadata audit failed:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Release metadata audit passed (${Object.keys(profiles).length} profiles, appVersion ${displayVersion}, package ${packageJson.version}).`,
);

function readJson(relativePath) {
  return JSON.parse(readFileSync(resolve(projectRoot, relativePath), 'utf8'));
}
