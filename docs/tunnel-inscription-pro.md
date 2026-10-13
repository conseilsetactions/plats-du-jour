# Tunnel de création d'un compte pro — Plats du Jour

**Mis à jour :** 2026-10-13 (inscription sans SIRET, établissement choisi sur Google Maps, 2 formules)

```mermaid
flowchart TD
    A([Page « Espace pro » /pro]) -->|Créer mon compte| F

    subgraph E1 [Étape 1 · Formule]
        F[Choix de la formule<br/>Plat du jour 5 € HT · Formule 7 € HT<br/>gratuit 6 mois, sans engagement]
    end

    F -->|Suivant| P

    subgraph E2 [Étape 2 · Portable]
        P[Numéro de portable<br/>+ accepte CGV et confidentialité]
        P -->|numéro déjà inscrit| X1([Se connecter])
        P -->|Suivant : SMS envoyé| C[Saisie du code reçu par SMS]
        C -->|code faux| C
        C -.->|Renvoyer / Changer de numéro| P
    end

    C -->|code correct| M

    subgraph E3 [Étape 3 · Mot de passe]
        M[Mot de passe 4 chiffres<br/>saisi 2 fois]
    end

    M -->|Suivant : compte créé| S

    subgraph E4 [Étape 4 · Établissement]
        S[Recherche sur Google Maps<br/>nom de l'établissement]
        S --> R[Résultats : nom, adresse, note Google]
        R -->|hors zone couverte| X2[« Pas encore disponible ici »]
        R -->|déjà inscrit| X3[« Demandez au propriétaire<br/>de vous ajouter à son équipe »]
        R -->|choix| Q{Est-ce bien votre<br/>établissement ?}
        Q -->|Non| S
        Q -->|Oui, c'est bien moi| D[Nom et adresse modifiables<br/>Quartier, note, position : Google<br/>Jours d'ouverture<br/>Certification propriétaire]
    end

    D -->|Continuer| I

    subgraph E5 [Étape 5 · Activation 0 €]
        I[Comprendre les 6 mois gratuits<br/>pourquoi 6 mois, résultats ~3 mois,<br/>pourquoi la carte, après 6 mois]
        I -->|Continuer vers le paiement| B[Infos de facturation<br/>e-mail et SIRET facultatifs]
        B -->|Enregistrer ma carte| ST[Page sécurisée Stripe<br/>0 € aujourd'hui]
    end

    ST --> W([Bienvenue / Bien démarrer<br/>inscription terminée])
    W -->|Publier mes plats quand je veux| PL([Mes plats du jour de la semaine])

    classDef step fill:#fbefea,stroke:#d97757,color:#1a1a1a
    classDef stop fill:#fdecea,stroke:#c62828,color:#1a1a1a
    classDef ok fill:#e8f5e9,stroke:#2e7d32,color:#1a1a1a
    class F,P,C,M,S,R,D,I,B,ST step
    class X1,X2,X3 stop
    class W,PL ok
```

**À savoir**
- Chaque étape est mesurée (Umami : `inscription-formule` … `inscription-termine`) pour suivre les abandons
- Un restaurateur qui s'arrête en cours de route (après l'étape 3) reprend là où il en était en se reconnectant (menu « Inscription en cours » → « Reprendre mon inscription »)
- Aucun plat n'est demandé pendant l'inscription : il publie quand il veut, depuis « Mes plats du jour »
- En démo : pas de vrai SMS (le code s'affiche), pas de vrai Stripe, établissements Google fictifs (« test »)
