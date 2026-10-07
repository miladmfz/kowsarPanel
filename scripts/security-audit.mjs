import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const scanRoots = ['src/app', 'docs'];
const explicitFiles = [
  'src/assets/config.json',
  'src/assets/config_bak.json',
  'src/assets/configs/local.json',
  'src/assets/configs/itmali.json',
  'src/assets/configs/itmaliIp.json',
  'src/assets/configs/qoqnooscoffee.json',
  'build.profiles.json',
  'build.js',
  'build-all.js',
];
const textExtensions = new Set(['.ts', '.html', '.html', '.json', '.md', '.js', '.mjs']);
const findings = [];

const secretPatterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g],
  ['OpenAI-style secret', /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g],
  ['connection-string password', /(?:^|;)\s*(?:Password|Pwd)\s*=\s*[^;\s<>{}\[\]]+/gim],
  ['assigned secret', /["'](?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token)["']\s*[:=]\s*["'][^"'<>]{8,}["']/gi],
];

function collectFiles(path) {
  const absolute = resolve(projectRoot, path);
  const entries = readdirSync(absolute);
  const files = [];

  for (const entry of entries) {
    const child = join(absolute, entry);
    const metadata = statSync(child);
    if (metadata.isDirectory()) {
      files.push(...collectFiles(relative(projectRoot, child)));
    } else if (textExtensions.has(extname(child).toLowerCase())) {
      files.push(child);
    }
  }

  return files;
}

const files = [
  ...scanRoots.flatMap(collectFiles),
  ...explicitFiles.map(path => resolve(projectRoot, path)),
];

for (const file of new Set(files)) {
  const content = readFileSync(file, 'utf8');
  for (const [label, pattern] of secretPatterns) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) {
      const line = content.slice(0, match.index).split(/\r?\n/).length;
      findings.push(`${relative(projectRoot, file)}:${line} (${label})`);
    }
  }
}

if (findings.length > 0) {
  console.error('Potential secrets detected:');
  findings.forEach(finding => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(`Security audit passed (${new Set(files).size} files scanned).`);
