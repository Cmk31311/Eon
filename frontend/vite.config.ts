import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ 
  plugins: [react()], 
  server: { 
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', 'react-globe.gl']
        }
      }
    }
  },
  base: process.env.NODE_ENV === 'production' ? '/' : '/'
})
