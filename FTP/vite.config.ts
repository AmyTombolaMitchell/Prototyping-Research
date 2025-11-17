import { defineConfig } from 'vite';

// For GitHub Pages: use repository name as base path
export default defineConfig({
  base: '/Prototyping-Research/',
  publicDir: 'public',
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext'
  }
});
