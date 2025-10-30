import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.jsx'],
      refresh: true,
      buildDirectory: 'build', // ✅ hasil build ke /public/build
    }),
    react(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js'),
    },
  },

  build: {
    outDir: 'public/build', // ✅ tempat hasil build (penting untuk deploy)
    emptyOutDir: true,      // hapus file lama sebelum build baru
    manifest: true,         // Laravel butuh file manifest.json
    sourcemap: false,
  },

  server: {
    host: '127.0.0.1', // ✅ aman di local dev
    port: 5173,
    strictPort: true,
  },
})
