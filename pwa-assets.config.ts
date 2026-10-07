// Génère les icônes de l'application (écran d'accueil Android / iPhone) à partir de public/app-icon.svg
// Commande : npx pwa-assets-generator
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    // Fond clay plein cadre : pas de marge blanche autour de l'icône
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: '#d97757' } },
    apple: { ...minimal2023Preset.apple, padding: 0, resizeOptions: { background: '#d97757' } },
  },
  images: ['public/app-icon.svg'],
});
