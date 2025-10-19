// src/server.js — static web + proxy
const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env'), override: true });

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// App setup
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(morgan('dev'));

// Resolve backend target
const backendPort = Number(process.env.BACKEND_PORT) || 4000;
const rawBackendUrl = String(process.env.BACKEND_URL || '').trim();
let backendTarget = rawBackendUrl || `http://localhost:${backendPort}`;
if (!/^https?:\/\//i.test(backendTarget)) backendTarget = `http://${backendTarget}`;

// Install proxy BEFORE body parsers
let proxyInstalled = false;
try {
  // Express 5 + HPM v3: mount path and re-prefix '/api' for backend
  app.use('/api', createProxyMiddleware({
    target: backendTarget,
    changeOrigin: true,
    logLevel: 'warn',
    proxyTimeout: 20000,
    ws: true,
    pathRewrite: (p) => '/api' + p,
  }));

  // Convenience alias: '/auth' -> backend '/api/auth'
  app.use('/auth', createProxyMiddleware({
    target: backendTarget,
    changeOrigin: true,
    logLevel: 'warn',
    proxyTimeout: 20000,
    pathRewrite: { '^/auth': '/api/auth' },
  }));
  proxyInstalled = true;
} catch (e) {
  console.warn(`[web] Proxy disabled: ${e.message}. Frontend will serve static only.`);
}

// Generic middleware
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// Static assets root
const webRootBuild = path.resolve(process.cwd(), 'frontend', 'build');
const webRootPublic = path.resolve(process.cwd(), 'frontend', 'public');
const hasBuild = fs.existsSync(webRootBuild);
const hasPublic = fs.existsSync(webRootPublic);
const webRoot = hasBuild ? webRootBuild : (hasPublic ? webRootPublic : null);
if (webRoot) {
  app.use(express.static(webRoot));
} else {
  console.warn('[web] No frontend/build or frontend/public found. Serving API only.');
}

// Health for the web server
app.get('/health', (_req, res) => res.json({ ok: true }));

// If proxy missing, provide lightweight /api/health passthrough
if (!proxyInstalled) {
  const http = require('node:http');
  const https = require('node:https');
  app.get('/api/health', (_req, res) => {
    try {
      const u = new URL('/api/health', backendTarget);
      const h = u.protocol === 'https:' ? https : http;
      const r = h.request(u, (p) => { res.status(p.statusCode || 502); p.pipe(res); });
      r.on('error', () => res.status(502).json({ ok: false }));
      r.end();
    } catch { res.status(502).json({ ok: false }); }
  });
}

// SPA fallback (only for non-file GETs that accept HTML)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (!webRoot) return next();
  const accept = String(req.headers.accept || '');
  const hasExt = path.extname(req.path) !== '';
  if (req.path.startsWith('/api') || !accept.includes('text/html') || hasExt) return next();
  res.sendFile(path.join(webRoot, 'index.html'));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Web: http://localhost:${PORT}\n -> proxy target: ${backendTarget}\n -> static root: ${webRoot || 'none'}`);
});

