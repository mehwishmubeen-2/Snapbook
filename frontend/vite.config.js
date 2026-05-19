import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite is used only as a BUILD TOOL here.
// The Express backend (server.js) serves the output from frontend/public/.
// Running `npm run build` compiles src/main.jsx → public/dist/react-app.js
// (a self-contained IIFE bundle — no CDN React/Babel needed at runtime).

export default defineConfig({
  plugins: [react()],
  // Replace Node.js globals so the browser bundle works without a polyfill
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.jsx'),
      name: 'SnapBook',
      formats: ['iife'],
      fileName: () => 'react-app.js',
    },
    outDir: 'public/dist',
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      output: {
        // Inline any dynamic imports so the output is a single file
        inlineDynamicImports: true,
      },
    },
  },
});
