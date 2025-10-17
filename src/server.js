// src/server.js - frontend static server + proxy only
const path = require('node:path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env'), override: true });

const express = require('express');
const fs = require('node:fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// Serve frontend static files from React build if available, otherwise public
const webRootBuild = path.resolve(process.cwd(), 'frontend', 'build');
const webRootPublic = path.resolve(process.cwd(), 'frontend', 'public');
const webRoot = fs.existsSync(webRootBuild) ? webRootBuild : webRootPublic;
app.use(express.static(webRoot));

// Proxy API calls to the dedicated backend in /backend
const backendTarget = process.env.BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT || 4000}`;
app.use('/api', createProxyMiddleware({ target: backendTarget, changeOrigin: true, logLevel: 'warn' }));

// Health for the web server
app.get('/health', (_req, res) => res.json({ ok: true }));

// SPA fallback without wildcard pattern (Express 5 safe)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const accept = String(req.headers.accept || '');
  const hasExt = path.extname(req.path) !== '';
  // Only serve index.html for SPA route navigations (no extension)
  if (req.path.startsWith('/api') || !accept.includes('text/html') || hasExt) return next();
  res.sendFile(path.join(webRoot, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend served on http://localhost:${PORT} (proxy -> ${backendTarget})`);
});

