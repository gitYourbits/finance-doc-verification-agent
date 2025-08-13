import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(join(__dirname, 'dist'), {
  etag: true,
  lastModified: true,
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  },
}));

// API proxy (if needed)
if (process.env.VITE_API_BASE_URL) {
  app.use('/api', createProxyMiddleware({
    target: process.env.VITE_API_BASE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  }));
}

// Handle SPA routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
