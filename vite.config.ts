// thesis-app/vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode: _mode }) => { // Prefixed 'mode' as it's unused
  return {
    plugins: [
      tailwindcss(),
      react()
    ],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, _options) => { // _options is unused
            proxy.on('error', (err, _req, _res) => { // _req, _res are unused
              console.error('Vite Proxy Error:', err); // Assuming console is now recognized
            });
            proxy.on('proxyReq', (proxyReq, _req, _res) => { // _req, _res are unused
              console.log(`[Vite Proxy] Sending request to Flask: ${proxyReq.method} ${proxyReq.path}`);
            });
            // Example if you were to use _req or _res in proxyRes:
            // proxy.on('proxyRes', (proxyRes, req, res) => {
            //   console.log(`[Vite Proxy] Received response from Flask: ${proxyRes.statusCode} ${req.url}`);
            // });
          }
        },
      },
    },
  };
});