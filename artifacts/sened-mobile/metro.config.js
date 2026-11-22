const http = require('http');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Phone can reach Metro on 8081. Windows blocks other devices from port 3000,
// so payment routes are forwarded to the local Chapa server. Every other
// request, including the Expo manifest and bundle, is left untouched.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    const path = (req.url || '').split('?')[0];
    const payment = path === '/api/healthz' || path.startsWith('/api/payments/');
    if (!payment) {
      middleware(req, res, next);
      return;
    }

    const headers = { ...req.headers, host: '127.0.0.1:3000' };
    delete headers['content-length'];
    const upstream = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path: req.url,
        method: req.method,
        headers,
      },
      (response) => {
        if (res.headersSent) return;
        res.writeHead(response.statusCode || 502, response.headers);
        response.pipe(res);
      },
    );
    upstream.on('error', () => {
      if (res.headersSent) return;
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'The payment server is not running.' }));
    });
    req.pipe(upstream);
  };
};

module.exports = config;
