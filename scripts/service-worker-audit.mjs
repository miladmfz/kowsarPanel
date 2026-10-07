import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const browserRoot = resolve(process.argv[2] ?? 'dist/.bundle-audit/browser');
const ngswPath = join(browserRoot, 'ngsw.json');
const manifestPath = join(browserRoot, 'manifest.webmanifest');
const errors = [];

if (!existsSync(ngswPath)) errors.push(`missing generated service-worker manifest: ${ngswPath}`);
if (!existsSync(manifestPath)) errors.push(`missing web manifest: ${manifestPath}`);

if (errors.length === 0) {
  const ngsw = JSON.parse(readFileSync(ngswPath, 'utf8'));
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const cachedPaths = Object.keys(ngsw.hashTable ?? {});

  if (ngsw.navigationRequestStrategy !== 'freshness') {
    errors.push('navigationRequestStrategy must be freshness so deployments prefer the current shell');
  }
  if (cachedPaths.some(path => /(?:^|\/)assets\/(?:config\.json|configs\/)/i.test(path))) {
    errors.push('runtime configuration must not be included in the service-worker hash table');
  }

  for (const group of ngsw.dataGroups ?? []) {
    if ((group.patterns ?? []).some(pattern => /api|auth|token|login|factor|report/i.test(pattern))) {
      errors.push(`sensitive API pattern must not be cached by data group "${group.name}"`);
    }
  }

  for (const icon of manifest.icons ?? []) {
    const iconPath = resolve(dirname(manifestPath), icon.src);
    if (!existsSync(iconPath)) errors.push(`manifest icon is missing: ${icon.src}`);
  }

  console.log(`Service worker groups: ${(ngsw.assetGroups ?? []).map(group => group.name).join(', ')}`);
  console.log(`Service worker hash entries: ${cachedPaths.length}`);
  console.log(`Manifest icons verified: ${(manifest.icons ?? []).length}`);
}

if (errors.length > 0) {
  console.error('Service worker audit failed:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Service worker audit passed.');
