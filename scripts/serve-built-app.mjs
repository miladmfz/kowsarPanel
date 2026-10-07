import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist/.bundle-audit/browser');
const port = Number(process.argv[3] ?? 41735);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid preview port.');
if (!existsSync(join(root, 'index.html'))) throw new Error(`Built application not found: ${root}`);

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  const requestedPath = resolve(root, `.${normalize(pathname)}`);
  const safePath = requestedPath === root || requestedPath.startsWith(`${root}\\`) || requestedPath.startsWith(`${root}/`);
  let filePath = safePath && existsSync(requestedPath) && statSync(requestedPath).isFile()
    ? requestedPath
    : join(root, 'index.html');

  response.setHeader('Content-Type', mimeTypes[extname(filePath)] ?? 'application/octet-stream');
  response.setHeader('Cache-Control', filePath.endsWith('assets\\config.json') || filePath.endsWith('assets/config.json')
    ? 'no-store'
    : 'no-cache');
  createReadStream(filePath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Preview server listening on http://127.0.0.1:${port}`);
});
