import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/policy-hub\/policies/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'policy-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 }
            }
          },
          {
            urlPattern: /\.(js|css|wasm)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxAgeSeconds: 2592000 }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 30300,
    proxy: {
      '/api': {
        target: 'http://localhost:30310',
        changeOrigin: true,
      }
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true
  }
})
