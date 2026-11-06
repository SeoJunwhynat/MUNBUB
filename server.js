/**
 * Render/Node HTTP adapter for the original Vercel-style API handlers.
 * No Express dependency required. Do not expose private files from the repository.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const routes = new Set([
  'account', 'duel', 'health', 'leaderboard', 'public-rooms', 'ranked', 'score'
]);

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.mp3', 'audio/mpeg'],
  ['.wav', 'audio/wav'],
  ['.ogg', 'audio/ogg'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2']
]);
const apiModules = new Map();
const MAX_BODY = 256 * 1024;

function publicFile(urlPath) {
  // Allow only the game's known client-side roots; never serve .env, JSON
  // databases, answer hashes, test code, ZIPs or server-side JavaScript.
  const safe =
    (urlPath === '/index.html' || urlPath === '/moved.html') ||
    /^\/(?:munbub_[\w.-]+\.(?:css|js)|hardcore_image_assets\.js)$/.test(urlPath) ||
    /^\/ui-assets\/(?:[\w.-]+\/)*[\w.-]+\.(?:png|webp|gif|jpe?g|svg|woff2?)$/i.test(urlPath) ||
    /^\/assets\/bgm\/[\w.-]+\.(?:mp3|wav|ogg)$/i.test(urlPath);
  if (!safe) return null;
  const absolute = resolve(root, '.' + urlPath);
  if (!absolute.startsWith(root)) return null;
  return absolute;
}

function json(res, statusCode, body) {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function bodyFor(req) {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') return {};
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) {
      const error = new Error('Payload too large');
      error.httpStatus = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return {};
  try {
    const contentType = String(req.headers['content-type'] || '').split(';')[0].trim();
    if (contentType === 'application/x-www-form-urlencoded') {
      return Object.fromEntries(new URLSearchParams(text));
    }
    return JSON.parse(text);
  } catch {
    const error = new Error('Invalid JSON body');
    error.httpStatus = 400;
    throw error;
  }
}

async function serveFile(req, res, urlPath) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return json(res, 405, { error: '허용되지 않은 요청 방식이야.' });
  }
  const file = publicFile(urlPath);
  if (!file) return json(res, 404, { error: '파일을 찾지 못했어.' });
  try {
    const info = await stat(file);
    if (!info.isFile()) return json(res, 404, { error: '파일을 찾지 못했어.' });
    res.statusCode = 200;
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Type', contentTypes.get(extname(file).toLowerCase()) || 'application/octet-stream');
    res.setHeader('Content-Length', info.size);
    res.setHeader('Cache-Control', urlPath === '/index.html' ? 'no-cache' : 'public, max-age=3600');
    if (req.method === 'HEAD') return res.end();
    const stream = createReadStream(file);
    stream.on('error', () => {
      if (!res.headersSent) json(res, 500, { error: '파일을 읽을 수 없어.' });
      else res.destroy();
    });
    stream.pipe(res);
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return json(res, 404, { error: '파일을 찾지 못했어.' });
    throw error;
  }
}

export function createAppServer() {
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); }
      catch { return json(res, 400, { error: '올바르지 않은 주소야.' }); }
      if (pathname === '/healthz' && req.method === 'GET') {
        return json(res, 200, { status: 'up', service: 'munbub' });
      }
      const match = /^\/api\/([a-z-]+)\/?$/.exec(pathname);
      if (match) {
        const route = match[1];
        if (!routes.has(route)) return json(res, 404, { error: 'API를 찾지 못했어.' });
        if (!apiModules.has(route)) apiModules.set(route, import('./api/' + route + '.js'));
        const handler = (await apiModules.get(route)).default;
        req.query = Object.fromEntries(url.searchParams);
        try { req.body = await bodyFor(req); }
        catch (error) { return json(res, error.httpStatus || 400, { error: error.message }); }
        res.status = code => { res.statusCode = code; return res; };
        res.json = value => { json(res, res.statusCode || 200, value); return res; };
        await handler(req, res);
        if (!res.writableEnded) json(res, 500, { error: 'API 응답을 완료하지 못했어.' });
        return;
      }
      if (pathname.startsWith('/api/')) return json(res, 404, { error: 'API를 찾지 못했어.' });
      return serveFile(req, res, pathname === '/' ? '/index.html' : pathname === '/moved' ? '/moved.html' : pathname);
    } catch (error) {
      console.error('Web request failure:', error?.name || 'UnknownError');
      return json(res, 500, { error: '서버 내부 오류야.' });
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 10000);
  const server = createAppServer();
  server.listen(port, '0.0.0.0', () => {
    console.log('MUNBUB server listening on port', port);
  });
  process.on('SIGTERM', () => server.close());
}
