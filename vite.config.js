import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/gw-api': {
        target: 'https://api.greenwaypolska.pl',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gw-api/, '/api'),
        headers: {
          Origin: 'https://map.greenwaypolska.pl',
          Referer: 'https://map.greenwaypolska.pl/',
        },
      },
      '/bot-api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bot-api/, ''),
      },
    },
  },
})
