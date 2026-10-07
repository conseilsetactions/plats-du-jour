# Plats du Jour - MVP

Une Progressive Web App (PWA) pour découvrir les plats du jour à proximité à Marseille.

## 🎯 Vue d'ensemble

Plats du Jour MVP est une application mobile-first conçue pour permettre aux utilisateurs de :
- Localiser les restaurants à proximité via GPS ou sélection manuelle de quartier
- Voir les plats du jour disponibles avec filtres par prix
- Accéder aux détails des plats et restaurants
- Opter pour les rappels par SMS
- Installer l'app directement depuis le navigateur mobile

### Stack technique

- **Frontend**: React 19 + TypeScript
- **Routing**: TanStack Router v1
- **State Management**: TanStack Query v5
- **Styling**: Tailwind CSS v4 + Custom theme
- **Build**: Vite v8
- **PWA**: vite-plugin-pwa avec Workbox
- **Icons**: Lucide React

## 📋 Epic 1 - Implémentation complète

### US 1.1: Géolocalisation
- ✅ GPS avec consentement CNIL explicite
- ✅ Fallback: sélecteur manuel de quartier (6 quartiers Marseille)
- ✅ Persistance en localStorage
- ✅ Précision affichée (<500m)

### US 1.2: Liste des plats
- ✅ Affichage: nom, description, prix, distance, restaurant
- ✅ Filtres par prix: <8€, 8-12€, >12€
- ✅ Badge "Bientôt" avant 11h45
- ✅ Tri par distance
- ✅ Recherche en temps réel
- ✅ Performance <3s (mock data)

### US 1.3: Détail plat
- ✅ Nom, description, prix, disponibilité
- ✅ Info restaurant: adresse, phone, distance
- ✅ Bouton "Voir sur Maps" (Google Maps)
- ✅ Appel direct via tel:
- ✅ Opt-in SMS reminder avec saisie numéro
- ✅ Évaluation & nombre d'avis

## 🚀 Démarrage rapide

### Installation locale

```bash
cd plats-du-jour
npm install

# Développement
npm run dev
# → http://localhost:5173

# Build production
npm run build

# Aperçu build
npm run preview
```

### Données de test

L'app inclut **25 restaurants fictifs** avec mock data généré procéduralement :
- Noms réalistes 
- Adresses Marseille réelles
- 2-4 plats chacun (~50 plats total)
- Prix réalistes (6€-17€)
- Distance calculée (Haversine)
- Ratings 3.8-4.7 ★

**Quartiers disponibles**:
- Vieux Port, Castellane, Canebière, Endoume, La Plaine, Estaque

## 📱 PWA Features

### Installation
- Manifest.json complet avec icônes maskable
- Prompt d'installation natif
- Support standalone mode
- Screenshots pour app stores

### Service Worker
- Cache-first pour assets
- Network-first pour API (5min cache)
- Offline fallback ready

### Performance
- Bundle JS: ~110KB gzip
- CSS: ~1.68KB gzip
- <3s liste load
- <1s détail load

## 🌍 Déploiement Vercel

```bash
# 1. Push sur GitHub
git push origin main

# 2. Importer dans Vercel
# Dashboard → Import Git Repository
# Select: plats-du-jour
# Deploy!

# Automatique:
# - Build: npm run build
# - Output: dist/
# - Framework: Vite
```

URL sera: `https://plats-du-jour-xxx.vercel.app`

## 🔒 CNIL & Privacy

✅ Pas de tracking externe
✅ Geolocalisation optionnelle
✅ LocalStorage client-side only
✅ SMS opt-in avec consentement
✅ Pas de données serveur (MVP)

## 🚧 Phase 2 (Déféré)

- [ ] Backend API
- [ ] Database restaurants réels
- [ ] SMS provider
- [ ] Auth utilisateur
- [ ] Notifications push
- [ ] Analytics

## 📊 Structure du code

```
src/
├── pages/              # Routes (Home, PlatsDetail, Layout)
├── components/         # Réusables (Header, Cards, Filters)
├── hooks/              # useGeolocation, usePWAInstall
├── utils/              # mockData, storage, format
├── lib/                # queryClient, router
└── types/              # TypeScript definitions
```

## 🐛 Troubleshooting

### Dev server ne démarre pas
```bash
rm -rf node_modules dist
npm install
npm run dev
```

### Geolocation ne fonctionne pas
- HTTPS/localhost requis
- Vérifier permission navigateur
- Ou utiliser sélecteur quartier

### PWA ne s'installe pas
- Chrome/Firefox: prompt automatique
- Safari iOS: Share → Add to Home Screen

## 🔗 Stack

- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Vite](https://vitejs.dev)
- [Lucide React](https://lucide.dev)

---

**Status**: MVP production-ready | **Deploy**: Vercel free tier | **Version**: 1.0.0
