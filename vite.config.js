import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    outDir: '../server/public',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,

    // Minification
    minify: 'esbuild',
    target: 'es2020',

    // Source maps only in dev
    sourcemap: false,

    rollupOptions: {
      output: {
        // Cache-busting hashes in filenames
        entryFileNames:  'assets/[name]-[hash].js',
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash][extname]',

        manualChunks(id) {
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('@tanstack') || id.includes('axios')) {
            return 'query-vendor';
          }
          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }
          if (id.includes('recharts') || id.includes('react-is')) {
            return 'chart-vendor';
          }
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n-vendor';
          }
          if (id.includes('socket.io-client')) {
            return 'socket-vendor';
          }
        },
      },
    },
  },

  server: {
    port: 5173,
    allowedHosts: true, // Moved directly out here under server!
    proxy: {
      '/api':       { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', changeOrigin: true, ws: true },
      '/uploads':   { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
