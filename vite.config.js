import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Essencial para publicação CrazyGames e links relativos
  server: {
    port: 3006,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild'
  }
});
