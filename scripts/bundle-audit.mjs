import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const statsPath = resolve(process.argv[2] ?? 'dist/.bundle-audit/stats.json');
const maxInitialBytes = 850_000;
const maxLazyChunkBytes = 2_150_000;
const maxPublishedAssetBytes = 25_000_000;

if (!existsSync(statsPath)) {
  console.error(`Bundle stats not found: ${statsPath}`);
  process.exit(1);
}

const stats = JSON.parse(readFileSync(statsPath, 'utf8'));
const outputs = stats.outputs ?? {};
const outputRoot = dirname(statsPath);
const browserRoot = existsSync(join(outputRoot, 'browser'))
  ? join(outputRoot, 'browser')
  : outputRoot;

const initialRoots = Object.entries(outputs)
  .filter(([, value]) => {
    const entryPoint = value.entryPoint ?? '';
    return entryPoint === 'src/main.ts'
      || entryPoint === 'angular:styles/global:styles'
      || entryPoint === 'angular:script/global:scripts.js';
  })
  .map(([name]) => name);

const initialOutputs = new Set();
const pending = [...initialRoots];
while (pending.length > 0) {
  const outputName = pending.pop();
  if (!outputName || initialOutputs.has(outputName)) continue;
  initialOutputs.add(outputName);

  for (const imported of outputs[outputName]?.imports ?? []) {
    if (imported.kind === 'import-statement' && outputs[imported.path]) {
      pending.push(imported.path);
    }
  }
}

const codeOutput = name => name.endsWith('.js') || name.endsWith('.css');
const initialBytes = [...initialOutputs]
  .filter(codeOutput)
  .reduce((total, name) => total + (outputs[name]?.bytes ?? 0), 0);

const heavyPackages = [
  ['ag-grid', /node_modules[\\/](?:ag-grid-angular|ag-grid-community|ag-grid-enterprise)[\\/]/i],
  ['d3', /node_modules[\\/](?:d3|d3-[^\\/]+)[\\/]/i],
  ['leaflet', /node_modules[\\/](?:leaflet|leaflet\.|ngx-leaflet)[\\/]/i],
  ['jssip', /node_modules[\\/]jssip[\\/]/i],
];

const heavyPackageLocations = {};
const initialHeavyJavaScript = [];
for (const [packageName, matcher] of heavyPackages) {
  const locations = [];
  for (const [outputName, output] of Object.entries(outputs)) {
    if (!outputName.endsWith('.js')) continue;
    const bytes = Object.entries(output.inputs ?? {})
      .filter(([inputName]) => matcher.test(inputName))
      .reduce((total, [, input]) => total + (input.bytesInOutput ?? 0), 0);
    if (bytes === 0) continue;
    locations.push({ output: outputName, bytes, initial: initialOutputs.has(outputName) });
    if (initialOutputs.has(outputName)) {
      initialHeavyJavaScript.push(`${packageName}: ${outputName} (${bytes} bytes)`);
    }
  }
  heavyPackageLocations[packageName] = locations.sort((a, b) => b.bytes - a.bytes);
}

const lazyChunks = Object.entries(outputs)
  .filter(([name]) => name.endsWith('.js') && !initialOutputs.has(name))
  .map(([name, output]) => ({ name, bytes: output.bytes ?? 0, entryPoint: output.entryPoint ?? null }))
  .sort((a, b) => b.bytes - a.bytes);

function directorySize(path) {
  if (!existsSync(path)) return 0;
  return readdirSync(path, { withFileTypes: true }).reduce((total, entry) => {
    const entryPath = join(path, entry.name);
    return total + (entry.isDirectory() ? directorySize(entryPath) : statSync(entryPath).size);
  }, 0);
}

const assetRoot = join(browserRoot, 'assets');
const publishedAssetBytes = directorySize(assetRoot);
const forbiddenPublishedPaths = [
  'assets/configs',
  'assets/js',
  'assets/config_bak.json',
].filter(path => existsSync(join(browserRoot, path)));

const publishedLibrariesRoot = join(assetRoot, 'libs');
const unexpectedPublishedLibraries = existsSync(publishedLibrariesRoot)
  ? readdirSync(publishedLibrariesRoot, { withFileTypes: true })
      .filter(entry => entry.name !== 'apexcharts')
      .map(entry => `assets/libs/${entry.name}`)
  : [];

const report = {
  initialBytes,
  initialLimitBytes: maxInitialBytes,
  publishedAssetBytes,
  publishedAssetLimitBytes: maxPublishedAssetBytes,
  largestLazyChunks: lazyChunks.slice(0, 10),
  heavyPackageLocations,
};
writeFileSync(join(outputRoot, 'bundle-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Initial JS/CSS: ${initialBytes} bytes (limit ${maxInitialBytes})`);
console.log(`Published assets: ${publishedAssetBytes} bytes (limit ${maxPublishedAssetBytes})`);
console.log('Largest lazy chunks:');
for (const chunk of lazyChunks.slice(0, 5)) {
  console.log(`- ${chunk.name}: ${chunk.bytes} bytes${chunk.entryPoint ? ` (${chunk.entryPoint})` : ''}`);
}

const errors = [];
if (initialBytes > maxInitialBytes) errors.push(`initial bundle exceeds ${maxInitialBytes} bytes`);
if (lazyChunks[0]?.bytes > maxLazyChunkBytes) {
  errors.push(`largest lazy chunk exceeds ${maxLazyChunkBytes} bytes`);
}
if (publishedAssetBytes > maxPublishedAssetBytes) {
  errors.push(`published assets exceed ${maxPublishedAssetBytes} bytes`);
}
if (initialHeavyJavaScript.length > 0) {
  errors.push(`heavy libraries leaked into initial JavaScript: ${initialHeavyJavaScript.join(', ')}`);
}
if (forbiddenPublishedPaths.length > 0) {
  errors.push(`non-runtime asset paths were published: ${forbiddenPublishedPaths.join(', ')}`);
}
if (unexpectedPublishedLibraries.length > 0) {
  errors.push(`unused legacy libraries were published: ${unexpectedPublishedLibraries.join(', ')}`);
}

if (errors.length > 0) {
  console.error('Bundle audit failed:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Bundle audit passed.');
