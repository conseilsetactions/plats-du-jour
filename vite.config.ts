import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Ajouts à la page selon les réglages (.env.production) :
 * - mode démo : le site n'est pas référencé par les moteurs de recherche ;
 * - Umami (mesure d'audience sans cookie) : script ajouté si VITE_UMAMI_WEBSITE_ID est renseigné.
 */
const htmlSettings = (demo: boolean, umamiId: string | undefined): Plugin => ({
  name: 'pdj-html-settings',
  transformIndexHtml: (html) => {
    const tags = [
      demo ? '<meta name="robots" content="noindex, nofollow" />' : '',
      umamiId ? `<script defer src="https://cloud.umami.is/script.js" data-website-id="${umamiId}"></script>` : '',
    ].filter(Boolean)
    return tags.length ? html.replace('</head>', `  ${tags.join('\n    ')}\n  </head>`) : html
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [
      react(),
      htmlSettings(mode !== 'production' || env.VITE_DEMO_MODE === 'true', env.VITE_UMAMI_WEBSITE_ID || undefined),
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
  }
})
