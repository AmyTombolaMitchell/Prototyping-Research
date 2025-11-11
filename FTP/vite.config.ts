import { defineConfig } from 'vite';

// For GitHub Pages: ensure relative asset paths by setting base to './'
export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'es2020'
  }
});
