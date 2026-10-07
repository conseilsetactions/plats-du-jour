import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Mode démo en ligne : le site n'est pas référencé par les moteurs de recherche. */
const noIndexInDemo = (demo: boolean): Plugin => ({
  name: 'pdj-noindex-demo',
  transformIndexHtml: (html) =>
    demo ? html.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n  </head>') : html,
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    noIndexInDemo(mode !== 'production' || loadEnv(mode, process.cwd(), 'VITE_').VITE_DEMO_MODE === 'true'),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Plats du Jour',
        short_name: 'Plats du Jour',
        description: 'Les plats du jour de votre quartier, de 11h à 14h',
        lang: 'fr',
        id: '/',
        scope: '/',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        // Icônes générées par « npx pwa-assets-generator » (pwa-assets.config.ts)
        icons: [
          { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-maps-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
}))
