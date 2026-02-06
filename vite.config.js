import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Pixel Tennis',
        short_name: 'Tennis',
        description: '나만의 테니스 성장 기록',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f3be.png', // 임시 아이콘 (테니스 라켓)
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f3be.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})