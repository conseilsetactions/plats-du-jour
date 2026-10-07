# PRD - Plats du Jour

**Document de Spécifications Produit**

| Version | Date | Statut |
|---|---|---|
| **2.0** (actuelle) | 2026-10-07 | MVP en démonstration |

---

## Historique des versions

*Règle : on change le 1er chiffre (2.0 → 3.0) pour un changement de fond (modèle économique, parcours principal), le 2e (2.0 → 2.1) pour un ajout ou une précision. Chaque version liste ce qui a changé*

### v2.0 — 2026-10-07
- Modèle économique : formules 5 / 7 / 9 € HT/mois (Plat du jour, Menu, Menu + IA), 6 mois gratuits, sans commission ; abandon du freemium avec publicité
- Ajout de l'espace pro complet : inscription en 5 étapes, vérification SIRET, publication de la semaine, jours d'ouverture, équipe, abonnement Stripe, factures, résiliation
- Côté clients : choix de la zone en phrase, mode GPS « autour de moi », distances seulement avec GPS, filtre Note Google, fiche plat, présentation grand public
- Version ordinateur et A/B tests (liste A / C, page pro A / B)
- Messages automatiques (SMS limités, e-mails), interface d'administration
- Pages Qui sommes-nous, Mentions légales, Confidentialité, CGV
- Quartiers pilotes : Joliette et Vieux Port ; horaires 11h-14h

### v1.0 — 2026-10-03
- Version initiale : annuaire client (géolocalisation ou quartier, recherche, filtre prix, tri par distance), modèle freemium 7,90 € / 9,90 € HT/mois

---

## 1. Vue d'ensemble

**Nom du produit :** Plats du Jour  
**Objectif :** Réunir en un seul endroit les plats du jour des restaurants, traiteurs et boulangeries d'un quartier  
**Format :** MVP web mobile-first (390 px), avec une version ordinateur  
**Public cible :**
- Clients : actifs et habitants qui cherchent où déjeuner à proximité, sans compte
- Établissements : restaurants, traiteurs, boulangeries (toutes activités acceptées) qui publient leur plat du jour

**Localisation :** Marseille d'abord (quartiers Joliette et Vieux Port), puis d'autres quartiers et villes  
**Origine :** idée venue d'Estonie, où ce service existe déjà, portée par Christine et Grégor (frère et sœur)

---

## 2. Problématique

- Les plats du jour sont peu visibles : l'ardoise n'est vue que par ceux qui passent devant
- Les clients ont peu de temps le midi et doivent faire le tour du quartier pour savoir ce qui est servi
- Les restaurateurs n'ont pas le temps de publier chaque jour sur les réseaux sociaux
- Les plateformes de livraison prennent 15 à 25 % de commission
- Pas de plateforme centralisée en France

---

## 3. Objectifs

1. **Court terme :** MVP fonctionnel côté clients et côté établissements (espace pro)
2. **Moyen terme :** adoption par les établissements des quartiers pilotes (régularité de publication)
3. **Long terme :** abonnement mensuel des établissements, sans commission

---

## 4. Modèle économique

- **Clients :** gratuit, sans compte, sans application à télécharger
- **Établissements :** abonnement mensuel, **6 mois gratuits**, sans engagement, sans commission

| Formule | Prix | Contenu |
|---|---|---|
| Plat du jour | 5 € HT/mois | 1 plat par jour |
| Menu | 7 € HT/mois | Suggestions du jour (entrée, plat, dessert, formule), lignes illimitées |
| Menu + IA | 9 € HT/mois | Menu rempli à partir d'une photo de l'ardoise, modifiable avant publication |

- Affichage : « Gratuit pendant 6 mois, puis X € HT/mois »
- Carte bancaire enregistrée à l'inscription (Stripe), 1er prélèvement à la fin des 6 mois
- Formule modifiable à tout moment, résiliation sans frais

*Remplace le modèle freemium d'origine (7,90 € / 9,90 € HT, publicité côté clients)*

---

## 5. Fonctionnalités — côté clients

### 5.1 Liste des plats du jour (`/`)

**Horaires d'affichage**
- Plats visibles du lundi au vendredi, de 11h à 14h (heure de Marseille)
- Messages dédiés : avant 11h, après 14h, le week-end (dès le vendredi 14h)
- Jours fériés : non gérés pour l'instant

**Choix de la zone (sous forme de phrase)**
- « Aujourd'hui, [jour] — Voir les plats du jour de [ville ▾] dans le quartier [quartier ▾] ou [utiliser ma position GPS] »
- Avec le GPS : « Les plats du jour autour de moi », ville et quartier les plus proches détectés et affichés
- Hors zone couverte (plus de 15 km) : message « pas encore disponible près de vous »
- Le quartier choisi est mémorisé sur l'appareil

**Distances**
- Distance (en mètres) et temps de marche **uniquement avec le GPS**
- Sans GPS : ni distance, ni temps de marche, ni filtre « À pied » (liste et fiche)

**Recherche et filtres**
- Recherche : nom du plat ou de l'établissement
- Filtres : Prix (Tous / < 8 € / 8-12 € / > 12 €), Note Google (Toutes / 4 et + / 4,5 et +), « À pied » (GPS)
- Filtres remis à « Tous » à chaque visite

**Affichage d'un plat dans la liste**
- Nom, catégorie (formules Menu), prix, établissement, note Google, distance et temps de marche (GPS)
- Tri : les plus proches d'abord

**Rien à afficher** (horaires, pas de zone, aucun résultat) : présentation grand public
- Comment ça marche (3 étapes), avantages (gratuit, sans compte, à jour), quartiers disponibles cliquables, FAQ, encart « Vous tenez un restaurant ? »

**Mention :** Plats du Jour affiche uniquement les plats saisis par les établissements participants et ne garantit pas les quantités disponibles

### 5.2 Version ordinateur et A/B test

- Barre de zone et de filtres en haut, toute la largeur pour les plats
- **A/B test en cours :**
  - A « Ardoise » : tableau Plat · Établissement · À pied · Note Google · Prix
  - C « Liste et plan » : liste à gauche, plan OpenStreetMap à droite (un repère par établissement avec son prix, « Vous êtes ici », bulle avec les plats)
- Seuls les visiteurs avec GPS participent ; sans GPS, toujours la version C
- Mesures : vues et plats ouverts par version (admin) ; forçage `?liste=a` / `?liste=c`

### 5.3 Fiche plat (`/plats/:id`)
- Nom, prix, catégorie, établissement, note Google, adresse, distance (GPS)
- Bouton « Voir sur Google Maps » (recherche nom + adresse)

### 5.4 Pages institutionnelles
- Qui sommes-nous (`/qui-sommes-nous`)
- Mentions légales, Politique de confidentialité, CGV (`/legal/:doc`) — pas de CGU (pas de compte client ; règles d'usage pro dans les CGV)
- Pied de page commun : ces liens + « Retrouvez-nous sur Facebook, Instagram et LinkedIn »

### 5.5 Pages futures (inchangées)
- Favoris, historique, avis — non prioritaires

---

## 6. Fonctionnalités — espace pro (établissements)

### 6.1 Acquisition
- **Page de présentation `/pro`, A/B test :** A = présentation du service, B = problèmes et arguments (réseaux sociaux ciblés par quartier, QR code pour les habitués, zéro commission) ; forçage `?version=a|b`
- Réassurance : 6 mois offerts, sans commission, sans engagement
- Pages d'accompagnement : « Bien démarrer » (1re connexion après l'inscription), « Pourquoi continuer » (lien de l'e-mail du vendredi), FAQ pro

### 6.2 Inscription en 5 étapes (barre « Étape x sur 5 »)
1. **Formule**
2. **Portable** + acceptation des CGV et de la politique de confidentialité + code de vérification par SMS
3. **Mot de passe** : 4 chiffres
4. **Établissement** : SIRET vérifié (API publique Recherche d'entreprises : établissement actif, ville couverte, SIRET unique), nom et adresse pré-remplis, ville (Marseille par défaut), quartier, jours d'ouverture, certification « propriétaire ou représentant légal »
5. **Paiement** : carte enregistrée chez Stripe, 0 € aujourd'hui, frise des dates, informations de facturation

Pas de validation manuelle des établissements

### 6.3 Connexion
- Portable + mot de passe à 4 chiffres
- Blocage 15 minutes après 5 essais ratés
- Mot de passe oublié : code par SMS

### 6.4 Publication (« Mes plats du jour de la semaine »)
- Saisie de toute la semaine en une fois, bouton « Valider »
- Formule Plat du jour : 1 plat par jour ; formules Menu : lignes catégorie + nom + prix
- Menu + IA : photo de l'ardoise, lignes remplies puis vérifiées
- Publication du jour même jusqu'à 14h ; dès le vendredi 14h et le week-end, semaine suivante
- Suggestions des plats déjà servis
- Jours d'ouverture (lundi à vendredi) : jour fermé grisé, sans saisie ni rappel ; lien « Modifier » avec retour automatique sur la saisie

### 6.5 Rôles
| | Propriétaire | Membre de l'équipe |
|---|---|---|
| Plats du jour | ✓ | ✓ |
| Jours d'ouverture | ✓ | ✓ |
| Établissement (nom, ville, quartier) | ✓ | — |
| Abonnement, factures, équipe | ✓ | — |

### 6.6 Équipe
- Le propriétaire ajoute des portables : invitation par SMS (lien court `/i/:code`), le membre choisit son mot de passe
- À partir de la 2e connexion du propriétaire : « Vous n'êtes pas seul en cuisine ? » (2 « Plus tard » maximum)
- Un seul numéro reçoit le SMS de rappel quotidien, choisi parmi propriétaire et membres (notification tant qu'il n'est pas choisi)

### 6.7 Abonnement, factures, résiliation
- **Mon abonnement :** formule (changement immédiat), carte (portail Stripe), facturation
- **Mes factures :** liste et facture détaillée ; envoi mensuel par e-mail par Stripe
- **Résiliation (page dédiée `/pro/resiliation`) :** 1. pourquoi (raison facultative, alternative proposée) 2. comment ça se passe 3. confirmation
  - Aucun prélèvement ; publication et visibilité jusqu'à la veille de l'échéance incluse ; compte et factures conservés ; réactivation en un clic
  - E-mail de confirmation au propriétaire + alerte à l'administrateur

---

## 7. Messages automatiques

**Principe :** minimiser les SMS (coût), privilégier les e-mails. Chaque SMS tient en un seul message (160 caractères, sans accents interdits).

| Canal | Message | Déclencheur |
|---|---|---|
| SMS | Code d'inscription | Étape 2 de l'inscription |
| SMS | Code « mot de passe oublié » | Demande de l'utilisateur |
| SMS | Invitation d'un membre | Ajout par le propriétaire |
| SMS | Rappel quotidien (ton selon la régularité) | Jours d'ouverture à 10h30, seulement si le plat n'est pas publié |
| E-mail | Félicitations | Vendredi 15h, meilleurs publiants |
| E-mail | Fin de la période gratuite | 7 jours avant le 1er prélèvement |
| E-mail | Facture mensuelle | Après chaque prélèvement (Stripe) |
| E-mail | Confirmation de résiliation | Résiliation |
| E-mail admin | Alerte résiliation (raison, contact) | Résiliation |

---

## 8. Administration (`/admin`)

- Ordinateur : chiffres clés, suivi des publications sur 4 semaines (meilleurs / réguliers / à relancer / nouveaux), relances, A/B test de la page pro, A/B test de la liste, alertes, résiliations, liste des établissements avec coordonnées
- Téléphone : 4 chiffres clés, établissements à relancer (bouton Appeler), liste avec recherche
- « Voir en tant que » : consulter l'espace d'un établissement (bandeau « Vue admin »)

---

## 9. Design & UX

**Plateforme :** mobile-first (390 px), version ordinateur à partir de 1024 px  
**Style :** minimaliste, épuré, lisible  
**Palette :**
- Accent : Clay (#d97757), foncé #b85a3f, clair #fbefea
- Fond : #f8f8f8 · Texte : #1a1a1a · Bordures : #e0e0e0
- Ouvert : vert #2e7d32 · Fermé : rouge #c62828

**Rédaction :**
- Vouvoiement
- Langage simple, sans jargon
- Pas de point en fin de paragraphe ou de ligne
- On dit « Espace pro » et « établissement »

---

## 10. Données (modèle actuel, simulé)

- **Établissement :** SIRET, nom, adresse, ville, quartier, position, jours d'ouverture, date de certification, formule, propriétaire, membres, invitations, numéro de rappel, abonnement
- **Abonnement :** statut (essai / résilié), date de fin d'essai, carte enregistrée, résiliation (date, raison, commentaire), coordonnées de facturation
- **Compte pro :** portable, empreinte du mot de passe, essais ratés, blocage, nombre de connexions, acceptation des conditions
- **Plat publié :** établissement, date, catégorie, nom, prix
- **Mesures :** événements des deux A/B tests ; historique des relances ; alertes admin
- **Clients :** aucun compte ; quartier et position GPS conservés sur leur appareil

---

## 11. Tech Stack

- **Frontend :** React 19 + TypeScript, Vite, Tailwind CSS 4
- **Routing :** TanStack Router · **Formulaires :** React Hook Form + Zod
- **Carte :** Leaflet + tuiles OpenStreetMap
- **PWA :** installable sur l'écran d'accueil
- **Hébergement prévu :** Vercel
- **Backend :** simulé dans le navigateur pour la démo ; Supabase envisagé
- **Services externes :**
  - API Recherche d'entreprises (SIRET, gratuite)
  - Stripe (abonnement, essai 6 mois, factures, portail client)
  - Prestataire SMS et prestataire e-mail (à choisir)
  - IA de lecture de photo (à choisir)
  - Google Maps (lien de recherche) ; Google Places reporté

**Outils de démo (en local uniquement) :** heure simulée, GPS simulé (Joliette, Vieux-Port, hors zone), SIRET de test, établissements fictifs, remise à zéro

---

## 12. Phase MVP - Contenu

**Quartiers inclus :** Joliette, Vieux Port (Marseille)  
**Ajout d'une ville ou d'un quartier :** simple configuration  
**Données de démo :** restaurants et plats fictifs autour des deux quartiers

---

## 13. Métriques de succès

- Chargement < 3 secondes ; trouver un plat en < 30 secondes
- Adoption : nombre d'établissements actifs et **régularité de publication** (suivi sur 4 semaines dans l'admin)
- Conversion de la page pro (A/B test A / B)
- Plats ouverts par vue de la liste (A/B test A / C)
- Taux de résiliation et raisons

---

## 14. Roadmap

**Avant la mise en ligne**
- Vrai backend (Supabase) ; vérification des mots de passe et limitation des essais côté serveur
- Stripe en réel (abonnement avec essai de 6 mois, factures conformes, e-mails automatiques)
- Prestataires SMS et e-mail
- Protection de l'admin et journalisation de « Voir en tant que »
- Textes juridiques complétés et relus par un juriste ; émetteur des factures ; adresse e-mail admin
- Adresses des réseaux sociaux
- Outil de mesure réel pour les A/B tests
- Mise en ligne (Vercel)

**Ensuite**
- QR code pour les habitués (promis sur la page pro B)
- Publications ciblées par quartier sur les réseaux sociaux (promises sur la page pro B)
- Google Places (vraie note Google, autocomplétion d'adresse)
- Fournisseur de cartes si le trafic augmente (MapTiler, Stadia Maps)
- Nouveaux quartiers et nouvelles villes
- Jours fériés

**Points à trancher :** durée de connexion des pros (proposition : 90 jours d'inactivité) ; résultat des A/B tests

---

## 15. Risques & Hypothèses

**Hypothèse 1 :** les clients cherchent leur plat du jour sur leur téléphone le midi — *le service existe déjà en Estonie*  
**Hypothèse 2 :** les établissements publieront régulièrement — *mitigation : 6 mois offerts, saisie de la semaine en une fois, rappel quotidien, équipe, e-mails de félicitations*  
**Hypothèse 3 :** un abonnement sans commission convaincra — *mitigation : A/B test des arguments, résiliation sans frais*  
**Risque :** liste vide au lancement — *mitigation : présentation grand public quand rien n'est publié, quartiers pilotes*

---

## 16. Notes importantes

- Démo : SMS, e-mails, paiement et IA sont simulés ; aucune donnée n'est envoyée
- Géolocalisation : uniquement si le client l'active, conservée sur son appareil (RGPD)
- Notes Google affichées avec la mention Google

---

**Version :** 2.0  
**Dernière mise à jour :** 2026-10-07  
**Propriétaire :** Christine - C&A Conseils et Actions  
**Statut :** MVP en démonstration — mise en ligne à préparer
