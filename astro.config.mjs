import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: 'https://jhoelrn.github.io',
  base: '/datapro-automation',
  vite: {
    resolve: {
      alias: {
        'astro/entrypoints/prerender': fileURLToPath(new URL('./node_modules/astro/dist/entrypoints/prerender.js', import.meta.url))
      }
    }
  }
});
