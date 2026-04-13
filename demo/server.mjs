import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function safePath(urlPathname) {
  const pathname = decodeURIComponent((urlPathname || '/').split('?')[0]);
  const relative = pathname === '/' ? 'demo/index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(rootDir, relative));

  if (!filePath.startsWith(rootDir)) return null;
  return filePath;
}

const server = http.createServer((req, res) => {
  const target = safePath(req.url);
  if (!target) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(target, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });

    fs.createReadStream(target).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`favicon-extract demo running at http://localhost:${port}/`);
});