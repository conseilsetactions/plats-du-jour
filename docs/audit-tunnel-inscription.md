# Audit du tunnel d'inscription pro — Plats du Jour

**Date :** 2026-10-07 · **Demande :** `PROMPT-CLAUDE-CODE-TUNNEL-AUDIT.md` (Christine)
**Objectif :** moins de 15 % d'abandon au paiement, avant la campagne de recrutement Joliette (semaine du 14 octobre)

---

## 1. Résumé

| Constat | Détail |
|---|---|
| La page de paiement rassurait déjà sur la carte | « 0 € aujourd'hui », « Rien à payer pendant 6 mois », e-mail de rappel, annulable, Stripe, frise des dates, « Pourquoi me demande-t-on ma carte ? » |
| **Mais rien n'expliquait « pourquoi 6 mois » ni « quand les résultats arrivent »** avant la carte | Ces explications étaient seulement sur « Bien démarrer », affichée **après** l'inscription |
| **L'abandon n'était pas mesuré** | Le chiffre « abandon élevé » n'était pas vérifiable : aucune mesure par étape n'existait. C'est maintenant mesuré (voir § 4) |
| Le tunnel est déjà court et clair | 5 étapes, une question par écran, barre de progression, 6 mois gratuits visibles dès l'étape 1 |

**Fait aujourd'hui (priorité 1) :**
- Nouvel écran **« Comprendre les 6 mois gratuits »** avant la carte
- Rappel à l'étape 4
- « Sans engagement » ajouté à l'étape 1
- **Mesure du tunnel** dans l'admin

---

## 2. Audit étape par étape

### Étape 1 · Formule
| | |
|---|---|
| Textes actuels | « Choisissez votre formule » · « Commencer, c'est gratuit : 6 mois offerts sur toutes les formules » · cartes « **Gratuit** pendant 6 mois, puis 5 € HT/mois » · avantages : visible par les clients autour de vous, aucune commission, formule modifiable · « Suivant » · « Déjà inscrit ? Se connecter » |
| Friction | Faible. « Sans engagement » manquait |
| ✅ Fait | Ajout de « Sans engagement : vous arrêtez quand vous voulez » |

### Étape 2 · Portable + code SMS
| | |
|---|---|
| Textes actuels | « Votre numéro de portable » · « Il vous servira à vous connecter. Nous vous envoyons un code par SMS pour le vérifier » · case CGV + confidentialité · écran « Saisissez le code reçu » avec « Renvoyer un code » et « Changer de numéro » |
| SMS envoyé | « Plats du Jour : votre code d'inscription est 123456. Ne le communiquez à personne. » |
| Friction | Faible. Le code est proposé automatiquement par le téléphone (saisie automatique). SMS plutôt administratif mais clair et court |
| Proposition (P2) | SMS un peu plus chaleureux, par exemple « Plats du Jour : voici votre code, 123456. Bienvenue ! Ne le communiquez à personne. » |

### Étape 3 · Mot de passe
| | |
|---|---|
| Textes actuels | « Choisissez votre mot de passe » · « 4 chiffres, faciles à retenir. Vous vous connecterez avec le 06… et ce mot de passe » · saisie deux fois |
| Friction | Très faible. Pas de règle de complexité, pas de conseil anxiogène |
| Proposition | Ne rien changer |

### Étape 4 · Établissement
| | |
|---|---|
| Textes actuels | « Votre établissement » · « Indiquez le numéro SIRET de votre établissement, nous remplissons le reste » · aide « Vous le trouverez sur vos factures ou sur l'Annuaire des entreprises » · puis nom affiché, ville, quartier, jours d'ouverture, certification |
| Messages d'erreur | « Numéro SIRET invalide (14 chiffres) » · « Aucun établissement trouvé avec ce SIRET » · « Cet établissement est indiqué comme fermé » · « Plats du Jour n'est pas encore disponible à … » · « Cet établissement a déjà un compte. Demandez à son propriétaire de vous ajouter à son équipe » · « Vérification impossible pour le moment. Réessayez dans un instant » |
| Friction | **La plus longue étape** : chercher son SIRET, 4 champs et une certification. C'est ici qu'on risque le plus de perdre du monde avant le paiement |
| ✅ Fait | Rappel avant le bouton : « Dernière étape ensuite : enregistrer votre carte, sans aucun frais pendant 6 mois » |
| Proposition (P2) | Mettre l'aide « Où trouver mon SIRET ? » plus en évidence (sur Kbis, factures, avis de situation Insee) |

### Étape 5 · Paiement
| | |
|---|---|
| Avant | Directement « 0 € aujourd'hui » + garanties + frise + facturation + « Enregistrer ma carte bancaire » |
| ✅ Fait | Nouvel écran **avant** le formulaire (toujours l'étape 5, le tunnel reste à 5 étapes), avec un bouton Retour pour le relire |
| Friction restante | Le mot « Paiement » dans la barre d'étapes peut inquiéter. L'e-mail de facturation est obligatoire |
| Proposition (P2) | Renommer l'étape « Paiement » en **« Activation (0 €) »** |

---

## 3. Nouvel écran « Comprendre les 6 mois gratuits » (en place)

> **AVANT DE CONTINUER**
> **Comprendre les 6 mois gratuits**
> On teste ensemble pendant 6 mois. Pas de frais, pas d'engagement, pas de surprise
>
> **Pourquoi 6 mois gratuits ?** Vos clients ne changent pas leurs habitudes du jour au lendemain. Il leur faut le temps de vous découvrir
>
> **Quand voir les résultats ?** Comptez en général environ 3 mois en publiant régulièrement. Les 3 mois suivants, vous jugez sur pièce
>
> **Pourquoi votre carte maintenant ?** Pour que tout continue sans coupure si vous restez. Rien n'est prélevé avant le [date]
>
> **Et après 6 mois ?** Vous décidez. Un e-mail vous prévient 7 jours avant. Vous pouvez arrêter à tout moment, sans frais ni justification
>
> **Alors, on lance ensemble ?**
> [ Continuer vers le paiement ] · 0 € aujourd'hui · sans engagement

⚠️ **À valider par Christine :** « Les résultats arrivent en 3 mois » est une promesse que nous ne pouvons pas encore prouver (pas de données). J'ai écrit « Comptez en général environ 3 mois en publiant régulièrement », plus honnête et conforme au ton demandé (« pas de promesses gonflées »). Le délai devra être confirmé par les premiers retours de la Joliette.

---

## 4. Mesure du tunnel (en place)

- Chaque écran est compté une fois par visite : Formule → Portable → Code SMS → Mot de passe → Établissement → Les 6 mois gratuits → Paiement → Inscription terminée
- **Admin → « Tunnel d'inscription pro »** : visiteurs par étape, % depuis le départ, perte par étape (en orange au-delà de 30 %), **abandon au paiement** comparé à l'objectif de 15 %
- ⚠️ En démo, les mesures restent dans le navigateur de chacun. Pour la campagne, il faut un **outil de mesure réel** (backend ou outil d'analytics) pour additionner tous les restaurateurs

---

## 5. Plan d'implémentation

### Priorité 1 — fait le 2026-10-07
1. Écran « Comprendre les 6 mois gratuits » avant la carte
2. Rappel « Dernière étape : carte, sans frais 6 mois » à l'étape 4
3. « Sans engagement » à l'étape 1
4. Mesure du tunnel dans l'admin

### Priorité 2 — fait le 2026-10-07
1. ✅ Étape 5 renommée « Activation (0 €) » dans la barre d'étapes
2. ✅ Encadré « Où trouver mon SIRET ? » (factures, Kbis / avis Insee, Annuaire des entreprises) à l'étape 4
3. ✅ SMS du code : « Plats du Jour : bienvenue ! Votre code de vérification est 123456. Ne le communiquez à personne. »
4. ✅ **Outil de mesure réel prêt : Umami** (sans cookie, donc sans bandeau de consentement). Événements envoyés : chaque étape du tunnel (`inscription-formule` … `inscription-termine`), les A/B tests (`landing-pro-…`, `liste-…`) et les pages vues. **Reste à faire par Christine :** créer le compte Umami et donner l'identifiant du site (voir § 7)
5. ✅ Message harmonisé « environ 3 mois » : écran avant la carte, encart « Pourquoi 6 mois gratuits ? » des pages /pro A et B, page « Bien démarrer »

### Priorité 3 — après la campagne
1. **A/B test du tunnel** : A sans l'écran d'explication, B avec. Mesure : abandon à l'étape 5 et taux de complétion. N'a de sens qu'avec un outil de mesure réel et assez d'inscriptions (plusieurs dizaines par version)
2. **Test « carte plus tard »** : demander la carte au 5e mois au lieu de l'inscription. Plus d'inscrits probablement, mais moins de passage au payant : à tester avec prudence
3. **Test d'oubli** : appeler quelques restaurateurs une semaine après pour vérifier qu'ils se souviennent pourquoi les 6 mois sont gratuits

### Métriques à suivre
| Métrique | Calcul | Objectif |
|---|---|---|
| Abandon au paiement | 1 − inscriptions terminées ÷ écran « 6 mois gratuits » | < 15 % |
| Taux de complétion | inscriptions terminées ÷ étape 1 | à établir |
| Perte par étape | visiteurs étape n ÷ étape n−1 | repérer l'étape la plus coûteuse (probablement l'étape 4) |
| Conversion de la page /pro | inscriptions ÷ vues (A/B test existant) | à établir |

---

## 6. Test simulé

Parcours complet réalisé de bout en bout sur mobile (390 px), sans blocage : formule → portable + code → mot de passe → SIRET de test → écran « 6 mois gratuits » → carte → espace pro. Toutes les étapes sont bien comptées dans l'admin.

Non fait : capture GIF du parcours (outil non disponible dans ce navigateur) ; chronométrage réel (à faire avec un vrai restaurateur).

---

## 7. Activer la mesure réelle (Umami)

1. Créer un compte gratuit sur umami.is (offre « Hobby » gratuite, à vérifier au moment de l'inscription)
2. Ajouter le site (son adresse Vercel), puis copier son **Website ID**
3. Le coller dans `.env.production` : `VITE_UMAMI_WEBSITE_ID=…`, puis republier sur Vercel
4. Dans Umami, créer un rapport **Funnel** (entonnoir) avec les événements `inscription-formule` → `inscription-portable` → `inscription-code` → `inscription-mot_de_passe` → `inscription-etablissement` → `inscription-paiement_intro` → `inscription-paiement` → `inscription-termine`

Abandon au paiement = 1 − (`inscription-termine` ÷ `inscription-paiement_intro`), objectif < 15 %
