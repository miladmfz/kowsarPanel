import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const configDirectory = resolve(projectRoot, 'src/assets/configs');
const requestedFiles = process.argv.slice(2);
const configFiles = requestedFiles.length > 0
  ? requestedFiles.map(file => resolve(projectRoot, file))
  : [
      resolve(projectRoot, 'src/assets/config.json'),
      ...readdirSync(configDirectory)
        .filter(name => name.endsWith('.json'))
        .map(name => join(configDirectory, name)),
    ];
const endpointKeys = new Set([
  'apiUrl',
  'localapiUrl',
  'localMenuapiUrl',
  'MenuapiUrl',
  'ProductapiUrl',
  'ProductapiUrl1',
  'santralUrl',
  'wsUrl',
  'testUrl',
  'hubUrl',
]);
const errors = [];
const warnings = [];

function isPrivateHost(hostname) {
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
}

function visitEndpoints(value, path = '') {
  if (!value || typeof value !== 'object') return [];
  const endpoints = [];

  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (endpointKeys.has(key) && typeof child === 'string' && child.trim()) {
      endpoints.push({ path: childPath, key, rawUrl: child });
    } else if (child && typeof child === 'object') {
      endpoints.push(...visitEndpoints(child, childPath));
    }
  }

  return endpoints;
}

for (const file of configFiles) {
  const displayName = relative(projectRoot, file);
  let config;
  try {
    config = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${displayName}: invalid JSON (${error.message})`);
    continue;
  }

  for (const field of ['appVersion', 'apiUrl', 'baseHref']) {
    if (typeof config[field] !== 'string' || config[field].trim() === '') {
      errors.push(`${displayName}: required field "${field}" is missing`);
    }
  }

  if (typeof config.production !== 'boolean') {
    errors.push(`${displayName}: required boolean "production" is missing`);
  }

  for (const { path: endpointPath, key, rawUrl } of visitEndpoints(config)) {
    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      errors.push(`${displayName}: ${endpointPath} is not an absolute URL`);
      continue;
    }

    if (url.username || url.password) {
      errors.push(`${displayName}: ${endpointPath} must not contain embedded credentials`);
      continue;
    }

    const websocketEndpoint = key === 'wsUrl' || key === 'testUrl';
    const allowedProtocols = websocketEndpoint
      ? new Set(['ws:', 'wss:'])
      : new Set(['http:', 'https:']);
    if (!allowedProtocols.has(url.protocol)) {
      errors.push(`${displayName}: ${endpointPath} uses an invalid protocol (${url.protocol})`);
      continue;
    }

    const isSecure = url.protocol === 'https:' || url.protocol === 'wss:';
    if (!config.production || isSecure) continue;

    const finding = `${displayName}: ${endpointPath} uses ${url.protocol}//${url.host}`;
    if (isPrivateHost(url.hostname)) {
      warnings.push(`${finding} (private/loopback production endpoint)`);
    } else {
      errors.push(`${finding} (public production endpoint must use HTTPS/WSS)`);
    }
  }
}

if (warnings.length > 0) {
  console.warn('Runtime configuration warnings:');
  warnings.forEach(warning => console.warn(`- ${warning}`));
}

if (errors.length > 0) {
  console.error('Runtime configuration errors:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Runtime configuration audit passed (${configFiles.length} profiles checked).`);
