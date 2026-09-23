import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { flue } from '@flue/vite';
import tailwindcss from '@tailwindcss/vite';

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    configureServer(server: any) {
      return () => {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          if (req.url && req.url.startsWith('/api')) {
            return next();
          }

          if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
            try {
              let html = fs.readFileSync(path.resolve('index.html'), 'utf-8');
              html = await server.transformIndexHtml(req.url, html);
              res.setHeader('Content-Type', 'text/html');
              res.end(html);
              return;
            } catch (e) {
              return next(e);
            }
          }
          next();
        });
      };
    }
  };
}

export default defineConfig({
  plugins: [spaFallbackPlugin(), tailwindcss(), react(), ...flue()]
});
