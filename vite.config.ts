import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // The '' prefix loads ALL variables from .env files, not only VITE_ ones.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
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