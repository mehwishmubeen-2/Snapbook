/**
 * SnapBook — Frontend Dev Server
 *
 * Serves static files from ./public on port 3000 and proxies all
 * /api/* requests to the Express backend on port 5055.
 *
 * Usage:  node dev-server.js
 * Or via: npm run dev  (see package.json)
 *
 * Zero extra dependencies — uses only Node.js built-ins.
 */

const http  = require("http");
const https = require("https");
const fs    = require("fs");
const path  = require("path");
const url   = require("url");

const PORT        = 3000;
const API_TARGET  = "http://localhost:5055";
const PUBLIC_DIR  = path.join(__dirname, "public");

/* ── MIME types ── */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".map":  "application/json",
};

/* ── Proxy a request to the backend ── */
function proxyToBackend(req, res) {
  const target = new URL(API_TARGET);
  const opts = {
    hostname: target.hostname,
    port:     target.port || 5055,
    path:     req.url,
    method:   req.method,
    headers:  { ...req.headers, host: `${target.hostname}:${target.port || 5055}` },
  };

  const proxy = http.request(opts, (backRes) => {
    res.writeHead(backRes.statusCode, backRes.headers);
    backRes.pipe(res, { end: true });
  });

  proxy.on("error", (err) => {
    console.error(`[proxy error] ${req.url} →`, err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        success: false,
        message: "Backend not reachable. Is the Express server running on port 5055?",
      }));
    }
  });

  req.pipe(proxy, { end: true });
}

/* ── Serve a static file ── */
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type":  mime,
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

/* ── Main request handler ── */
const server = http.createServer((req, res) => {
  const parsed   = url.parse(req.url);
  const pathname = parsed.pathname;

  /* 1. Proxy all API + socket.io + SSR page traffic to the backend */
  if (pathname.startsWith("/api") || pathname.startsWith("/socket.io") || pathname.startsWith("/photographer/")) {
    return proxyToBackend(req, res);
  }

  /* 2. Resolve the file path */
  let filePath = path.join(PUBLIC_DIR, pathname);

  /* 3. Try exact file, then with .html, then index.html fallback */
  const tryPaths = [
    filePath,
    filePath + ".html",
    path.join(PUBLIC_DIR, "index.html"),
  ];

  /* 4. Walk the candidate paths */
  const tryNext = (paths) => {
    if (paths.length === 0) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const candidate = paths[0];
    fs.stat(candidate, (err, stat) => {
      if (!err && stat.isFile()) {
        return serveFile(candidate, res);
      }
      tryNext(paths.slice(1));
    });
  };

  tryNext(tryPaths);
});

server.listen(PORT, () => {
  console.log("");
  console.log("  ┌────────────────────────────────────────────┐");
  console.log("  │  SnapBook Dev Server                       │");
  console.log(`  │  Static  →  http://localhost:${PORT}          │`);
  console.log(`  │  API     →  proxied to port 5055           │`);
  console.log("  │                                            │");
  console.log("  │  Make sure the backend is running:        │");
  console.log("  │    cd ../backend && npm run dev            │");
  console.log("  └────────────────────────────────────────────┘");
  console.log("");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other server first.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
