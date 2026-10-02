import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
        manifest: {
          name: 'Dónde ver',
          short_name: 'Dónde ver',
          description: 'Encontrá en qué plataforma ver una película o serie.',
          lang: 'es',
          start_url: '/',
          display: 'standalone',
          theme_color: '#2563eb',
          background_color: '#0f172a',
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
          // Never serve index.html for API requests.
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // Posters and logos: cache them for faster loading.
              urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'tmdb-images',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // API data: try the network first, fall back to the cache.
              urlPattern: /^\/api\/tmdb\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'tmdb-api',
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/api/tmdb': {
          target: 'https://api.themoviedb.org',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/tmdb/, '/3'),
          headers: { Authorization: `Bearer ${env.TMDB_TOKEN}` },
        },
      },
    },
  };
});