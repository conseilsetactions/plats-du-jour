# PRD - Plats du Jour

**Document de Spécifications Produit**

---

## 1. Vue d'ensemble

**Nom du produit :** Plats du Jour  
**Objectif :** Annuaire de plats du jour à Marseille  
**Format :** MVP (Minimum Viable Product) - Web mobile-first  
**Public cible :** Clients cherchant des plats du jour à proximité  
**Localisation :** Marseille, France

---

## 2. Problématique

- Les restaurateurs proposent des plats du jour attractifs mais peu visibles
- Les clients ne savent pas facilement où trouver un bon plat du jour près de chez eux
- Pas de plateforme centralisée pour cette recherche à Marseille

---

## 3. Objectifs

1. **Court terme** : Créer un MVP fonctionnel permettant aux clients de découvrir les plats du jour à proximité
2. **Moyen terme** : Atteindre une adoption suffisante (restaurateurs + clients)
3. **Long terme** : Monétiser via abonnement restaurateurs (€7.90/€9.90 HT/mois)

---

## 4. Modèle économique

**Phase 1 (Gratuit) :** 6 mois gratuits pour tous  
**Phase 2 (Freemium) :**
- Clients : gratuit (avec pub)
- Restaurateurs : €7.90 HT/mois (sans pub)
- Restaurateurs Premium : €9.90 HT/mois (positionnement prioritaire)

---

## 5. Fonctionnalités MVP

### 5.1 Page d'accueil

**Localisation de l'utilisateur**
- Option 1 : Géolocalisation GPS
- Option 2 : Sélection manuelle d'un quartier Marseille

**Barre de recherche**
- Chercher par : nom de plat, restaurant

**Filtres**
- Prix : Tous / < 8€ / 8-12€ / > 12€

**Affichage des plats**
- Par plat : Titre, Prix, Restaurant, Distance
- Tri : Par distance (proche en premier)
- État : Message si aucun résultat

### 5.2 Page détail plat (future)
- Descriptif complet
- Horaires disponibilité
- Avis utilisateurs
- Localisation sur carte

### 5.3 Pages futures
- Favoris
- Historique recherches
- Profil utilisateur
- Système d'avis/notation

---

## 6. Design & UX

**Plateforme :** Mobile-first (390px de base)  
**Style :** Minimaliste, épuré, lisible  
**Palette :** 
- Accent : Clay (#d97757)
- Background : Gris clair (#f8f8f8)
- Text : Gris foncé (#1a1a1a)

**Principes :**
- Scanabilité : infos essentielles en priorité
- Clarté : pas de jargon, langage simple
- Performance : chargement rapide

---

## 7. Tech Stack

- **Frontend :** React 19 + TypeScript
- **Build :** Vite
- **Styling :** Tailwind CSS
- **Forms :** React Hook Form
- **Routing :** TanStack Router
- **Data :** TanStack Query (React Query)
- **Validation :** Zod
- **Deploy :** PWA (Progressive Web App)

---

## 8. Phase MVP - Contenu

**Quartiers Marseille inclus :**
- Vieux Port
- Canebière
- La Plaine
- Castellane
- Endoume
- Estaque
- (+ autres à ajouter)

**Données test :**
- ~50 restaurants
- ~150 plats du jour (5 par restaurant en moyenne)
- Disponibilités : 11h30-14h30 (midi)

---

## 9. Métriques de succès MVP

- **Chargement :** < 3 secondes
- **Utilisabilité :** Trouver un plat en < 30 secondes
- **Satisfaction :** Score testé avec utilisateurs réels
- **Adoption :** 50+ restaurants participants en 3 mois

---

## 10. Roadmap post-MVP

**V1.1 (Mois 1-2)**
- Pages détail plats
- Système d'avis
- Favoris utilisateur

**V1.2 (Mois 3-4)**
- Dashboard restaurateur (gérer ses plats)
- Notifications utilisateur
- Intégration réseaux sociaux

**V2.0 (Mois 6+)**
- App native iOS/Android
- Système de réservation
- Partenariats restaurants

---

## 11. Risques & Hypothèses

**Hypothèse 1 :** Les clients cherchent activement des plats du jour  
**Risque mitigation :** Études utilisateur précoces

**Hypothèse 2 :** Les restaurateurs voudront participer  
**Risque mitigation :** Proposition de valeur claire, onboarding simple

**Hypothèse 3 :** Le modèle freemium fonctionnera  
**Risque mitigation :** Test A/B prix, feedback client

---

## 12. Notes importantes

- MVP excite intentionnellement les horaires, descriptions détaillées, images (v1.1)
- Données actuellement mockées (fixtures) - intégration API backend future
- Géolocalisation : respecter RGPD/CNIL
- PWA : installez sur écran d'accueil comme app native

---

**Dernière mise à jour :** 2026-10-03  
**Propriétaire :** Christine - C&A Conseils et Actions  
**Statut :** Approuvé pour développement MVP
