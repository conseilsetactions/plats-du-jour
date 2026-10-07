// Textes juridiques de Plats du Jour.
// PROJETS rédigés d'après le fonctionnement réel de l'app : À FAIRE VALIDER PAR UN JURISTE.
// Les passages entre crochets « [à compléter : …] » sont des informations manquantes, surlignées à l'écran.
import { FREE_MONTHS, PLANS, REMINDER_DAYS_BEFORE_CHARGE, priceWithVat, type PlanId } from '@/lib/plans';

export type LegalDocId = 'mentions-legales' | 'confidentialite' | 'cgv';

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDoc {
  title: string;
  updatedAt: string;
  intro?: string;
  sections: LegalSection[];
}

const EDITOR = 'C&A Conseils et Actions';
const CONTACT_EMAIL = '[à compléter : adresse e-mail de contact]';
const price = (id: PlanId) =>
  `${PLANS[id].price} € HT par mois (${priceWithVat(PLANS[id].price).toFixed(2).replace('.', ',')} € TTC)`;

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  // ---------------------------------------------------------------------------
  'mentions-legales': {
    title: 'Mentions légales',
    updatedAt: '[à compléter : date de mise en ligne]',
    sections: [
      {
        title: 'Éditeur du site',
        paragraphs: [
          `Le site et l'application Plats du Jour sont édités par ${EDITOR}, [à compléter : forme juridique (SAS, SARL, entreprise individuelle…)] au capital de [à compléter : montant] €.`,
          'Siège social : [à compléter : adresse complète].',
          'SIRET : [à compléter] — RCS : [à compléter : ville et numéro].',
          'Numéro de TVA intracommunautaire : [à compléter].',
          `Contact : ${CONTACT_EMAIL}.`,
        ],
      },
      {
        title: 'Directeur de la publication',
        paragraphs: ['[à compléter : prénom et nom du directeur ou de la directrice de la publication].'],
      },
      {
        title: 'Hébergement',
        paragraphs: [
          "Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis — [à compléter : à confirmer selon l'hébergeur retenu pour la mise en ligne].",
        ],
      },
      {
        title: 'Propriété intellectuelle',
        paragraphs: [
          `La marque, le logo, la charte graphique et les contenus de Plats du Jour (hors contenus publiés par les établissements) sont la propriété de ${EDITOR}. Toute reproduction sans autorisation est interdite.`,
          'Les plats, prix et informations publiés par les établissements restent sous leur responsabilité (voir les CGV).',
        ],
      },
      {
        title: 'Informations publiées',
        paragraphs: [
          "Les plats du jour, menus et prix sont publiés directement par les établissements. Plats du Jour ne peut garantir le nombre de plats disponibles ni l'exactitude de ces informations : vérifiez auprès de l'établissement concerné si nécessaire.",
          "Les notes affichées proviennent de Google et ne sont pas attribuées par Plats du Jour. Les distances et temps de marche sont des estimations.",
        ],
      },
      {
        title: 'Données personnelles',
        paragraphs: [
          "Le traitement de vos données personnelles est décrit dans notre politique de confidentialité.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  confidentialite: {
    title: 'Politique de confidentialité',
    updatedAt: '[à compléter : date de mise en ligne]',
    intro:
      'Cette politique explique quelles données Plats du Jour utilise, pourquoi, combien de temps, et comment exercer vos droits (règlement européen sur la protection des données, RGPD).',
    sections: [
      {
        title: 'Responsable du traitement',
        paragraphs: [`${EDITOR}, [à compléter : adresse du siège]. Contact : ${CONTACT_EMAIL}.`],
      },
      {
        title: 'Si vous consultez les plats du jour (clients)',
        paragraphs: [
          "Vous n'avez pas besoin de créer de compte.",
          "Position GPS : uniquement si vous activez le GPS, pour calculer les distances. Elle est conservée sur votre appareil et n'est pas enregistrée par nos serveurs [à compléter : à confirmer dans la version finale].",
          'Ville et quartier choisis : conservés sur votre appareil pour vous éviter de les ressaisir.',
          "Mesure d'audience : nous utilisons Umami, un outil de statistiques sans cookie qui ne collecte aucune donnée permettant de vous identifier (pages vues, étapes de l'inscription, de façon anonyme et globale). Aucun bandeau de consentement n'est donc nécessaire [à compléter : à confirmer par un juriste].",
        ],
      },
      {
        title: 'Si vous êtes un établissement (professionnels)',
        paragraphs: [
          "Compte : numéro de portable (identifiant et SMS de service), mot de passe (conservé uniquement sous forme d'empreinte chiffrée, jamais en clair).",
          "Établissement : SIRET, nom, adresse et quartier (l'adresse provient de l'annuaire public des entreprises), jours d'ouverture, formule choisie.",
          "Facturation : nom ou raison sociale, adresse de facturation, e-mail. Les données de carte bancaire sont saisies et conservées par notre prestataire de paiement Stripe : Plats du Jour n'y a jamais accès.",
          "Contenus : plats, menus et prix publiés ; photos d'ardoise transmises à un service d'intelligence artificielle pour en extraire le texte (formule Menu + IA).",
          'Équipe : numéros de portable des membres ajoutés par le propriétaire.',
          'Suivi : régularité des publications, SMS et e-mails envoyés, motif de résiliation si vous le précisez.',
        ],
      },
      {
        title: 'Pourquoi nous utilisons ces données',
        paragraphs: [
          "Fournir le service et gérer votre compte (exécution du contrat) : publication des plats, connexion, équipe.",
          "Facturer l'abonnement et respecter nos obligations comptables (exécution du contrat, obligation légale).",
          `Vous envoyer des messages de service : un SMS de rappel une fois par semaine (le 1er jour d'ouverture à 10h30) si votre plat du jour n'est pas encore publié, des e-mails (fin de la période gratuite, factures, félicitations). [à compléter : base légale à valider — exécution du contrat ou intérêt légitime, avec possibilité de désactiver les rappels].`,
          "Améliorer la plateforme et accompagner les établissements (intérêt légitime) : statistiques de publication, appels d'accompagnement, tests de pages.",
          "Assistance : un administrateur de Plats du Jour peut consulter votre espace pro pour vous aider (« voir en tant que ») ; chaque accès est enregistré.",
        ],
      },
      {
        title: 'Destinataires et prestataires',
        paragraphs: [
          "Vos données ne sont jamais vendues. Elles sont accessibles à l'équipe de Plats du Jour et à nos prestataires techniques, dans la limite de leur mission :",
          'Hébergement : [à compléter : hébergeur et base de données retenus].',
          'Paiement : Stripe Payments Europe Ltd.',
          "Mesure d'audience : Umami (Umami Software, Inc.), statistiques anonymes sans cookie [à compléter : à vérifier, localisation des serveurs].",
          'Envoi des SMS : [à compléter : prestataire].',
          'Envoi des e-mails : [à compléter : prestataire].',
          "Lecture des photos d'ardoise : [à compléter : prestataire d'intelligence artificielle].",
          "Certains prestataires peuvent être situés hors de l'Union européenne ; les transferts sont alors encadrés par les clauses contractuelles types de la Commission européenne [à compléter : à vérifier pour chaque prestataire].",
          'Les plats, prix, nom et adresse de votre établissement sont, par nature, publics.',
        ],
      },
      {
        title: 'Durées de conservation',
        paragraphs: [
          "Compte et établissement : pendant toute la durée de l'abonnement, puis [à compléter : durée, par exemple 3 ans] après la fin de la relation commerciale.",
          'Factures et pièces comptables : 10 ans (obligation légale).',
          'Plats publiés : [à compléter : durée de conservation de l\'historique].',
          'Données des clients stockées sur leur appareil : jusqu\'à ce qu\'ils les effacent.',
        ],
      },
      {
        title: 'Vos droits',
        paragraphs: [
          "Vous pouvez demander l'accès, la rectification ou l'effacement de vos données, vous opposer à certains traitements, en demander la limitation ou la portabilité.",
          `Écrivez-nous à ${CONTACT_EMAIL}. Nous répondons sous un mois.`,
          "Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (www.cnil.fr).",
        ],
      },
      {
        title: 'Sécurité',
        paragraphs: [
          'Connexion protégée par mot de passe, codes à usage unique envoyés par SMS, mots de passe jamais conservés en clair, paiement géré par Stripe.',
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  cgv: {
    title: 'Conditions générales de vente',
    updatedAt: '[à compléter : date de mise en ligne]',
    intro: `Les présentes conditions régissent l'abonnement au service Plats du Jour souscrit par les établissements (restaurants, traiteurs, boulangeries…) auprès de ${EDITOR}. Elles s'adressent exclusivement à des professionnels.`,
    sections: [
      {
        title: '1. Le service',
        paragraphs: [
          "Plats du Jour permet aux établissements de publier leur plat du jour ou leur menu, du lundi au vendredi. Les plats sont présentés aux clients situés à proximité, de 11h à 14h, le jour pour lequel ils ont été publiés.",
          "Plats du Jour peut relayer les plats publiés sur ses propres supports de communication, notamment sur les réseaux sociaux, avec des publications ciblées par quartier.",
        ],
      },
      {
        title: '2. Inscription',
        paragraphs: [
          "L'inscription se fait avec un numéro de portable vérifié par SMS et un mot de passe. L'établissement est vérifié à partir de son numéro SIRET (établissement existant et en activité).",
          "La personne qui s'inscrit certifie être propriétaire ou représentante légale de l'établissement, ou dûment autorisée à le représenter. Toute inscription frauduleuse entraîne la suppression du compte.",
          "Le titulaire du compte peut ajouter des membres d'équipe, qui publient avec leur propre portable. Il reste responsable de leur utilisation du service.",
        ],
      },
      {
        title: '3. Formules et prix',
        paragraphs: [
          `${PLANS.plat.name} : un plat par jour — ${price('plat')}.`,
          `${PLANS.menu.name} : suggestions du jour (entrée, plat, dessert, formule) — ${price('menu')}.`,
          `${PLANS.ia.name} : formule Menu avec saisie automatique à partir d'une photo de l'ardoise — ${price('ia')}.`,
          "Les prix sont exprimés hors taxes ; la TVA en vigueur s'y ajoute. La formule peut être changée à tout moment depuis l'espace pro ; le nouveau prix s'applique [à compléter : à partir du prochain prélèvement / au prorata].",
        ],
      },
      {
        title: `4. Période gratuite de ${FREE_MONTHS} mois`,
        paragraphs: [
          `Toute nouvelle inscription bénéficie de ${FREE_MONTHS} mois gratuits, sans engagement. Une carte bancaire est enregistrée à l'inscription, mais aucun prélèvement n'a lieu pendant cette période.`,
          `Un e-mail rappelle la date du premier prélèvement ${REMINDER_DAYS_BEFORE_CHARGE} jours avant la fin de la période gratuite. Sans résiliation, l'abonnement payant démarre automatiquement à son terme.`,
          '[à compléter : une seule période gratuite par établissement (SIRET) ?]',
        ],
      },
      {
        title: '5. Paiement et facturation',
        paragraphs: [
          "L'abonnement est payable mensuellement, d'avance, par prélèvement sur la carte bancaire enregistrée. Les paiements sont traités par Stripe ; Plats du Jour n'a jamais accès aux numéros de carte.",
          "Aucune facture n'est émise pendant la période gratuite. Ensuite, une facture est envoyée par e-mail après chaque prélèvement et reste disponible dans l'espace pro.",
          "En cas d'échec de paiement, de nouvelles tentatives sont effectuées et l'établissement est prévenu par e-mail. [à compléter : délai au-delà duquel le compte est suspendu].",
        ],
      },
      {
        title: '6. Résiliation',
        paragraphs: [
          "L'abonnement est sans engagement et peut être résilié à tout moment depuis l'espace pro (« Mon abonnement »), sans frais ni justification.",
          "La résiliation prend effet à la fin de la période en cours (gratuite ou déjà payée) : les plats restent visibles jusqu'à cette date et aucun nouveau prélèvement n'a lieu. Aucun remboursement au prorata n'est effectué [à compléter : à confirmer].",
          "Plats du Jour peut suspendre ou résilier un compte en cas de manquement aux présentes conditions, notamment en cas de contenus trompeurs ou illicites, après mise en demeure restée sans effet [à compléter : délai], sauf urgence.",
        ],
      },
      {
        title: '7. Contenus publiés par l\'établissement',
        paragraphs: [
          "L'établissement est seul responsable des plats, prix et informations qu'il publie : ils doivent être exacts, à jour et conformes à la réglementation, notamment en matière d'information sur les allergènes et de prix affichés.",
          "L'établissement accorde à Plats du Jour, pour la durée de l'abonnement et [à compléter : durée après résiliation], une autorisation gratuite et non exclusive de reproduire et diffuser ses contenus (plats, prix, nom, photos) sur le site, l'application et les supports de communication de Plats du Jour, y compris les réseaux sociaux.",
          "Avec la formule Menu + IA, les lignes remplies à partir d'une photo doivent être vérifiées par l'établissement avant publication.",
        ],
      },
      {
        title: '8. Disponibilité et responsabilité',
        paragraphs: [
          "Plats du Jour s'efforce d'assurer l'accès au service en continu, sans pouvoir le garantir (maintenance, incidents techniques).",
          "Plats du Jour ne garantit aucun volume de clientèle ou de chiffre d'affaires. Sa responsabilité est limitée [à compléter : par exemple au montant des sommes versées au cours des 12 derniers mois].",
        ],
      },
      {
        title: '9. Données personnelles',
        paragraphs: ['Les traitements de données sont décrits dans la politique de confidentialité.'],
      },
      {
        title: '10. Modification des conditions',
        paragraphs: [
          "Plats du Jour peut modifier les présentes conditions. Les établissements sont prévenus par e-mail [à compléter : délai, par exemple 30 jours] avant leur entrée en vigueur et peuvent résilier sans frais s'ils les refusent.",
        ],
      },
      {
        title: '11. Droit applicable et litiges',
        paragraphs: [
          "Les présentes conditions sont soumises au droit français. En cas de litige, les parties recherchent d'abord une solution amiable ; à défaut, compétence est attribuée aux tribunaux de [à compléter : Marseille].",
        ],
      },
    ],
  },
};

export const LEGAL_LINKS: { doc: LegalDocId; label: string }[] = [
  { doc: 'mentions-legales', label: 'Mentions légales' },
  { doc: 'confidentialite', label: 'Confidentialité' },
  { doc: 'cgv', label: 'CGV' },
];
