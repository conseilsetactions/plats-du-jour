// Textes des e-mails envoyés aux restaurateurs (SIMULÉS dans la démo).
// Adresse utilisée : l'e-mail saisi à l'étape de paiement (« e-mail du compte »).
import { keepGoingLink } from '@/lib/sms';

/** Lien vers « Mon abonnement » (carte, formule, résiliation). */
const subscriptionLink = () => `${window.location.origin}/pro/mon-abonnement`;

export interface Email {
  subject: string;
  body: string;
}

const longDate = (date: Date) =>
  date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export const EMAILS = {
  /** Automatique, vendredi 15h : meilleurs publiants de la semaine (remplace l'ancien SMS). */
  weeklyCongrats: (restaurantName: string, publishedDays: number, possibleDays: number): Email => ({
    subject: `Bravo ${restaurantName}, vous jouez le jeu !`,
    body:
      `Bonjour,\n\nBravo pour votre régularité : vous avez publié votre plat du jour ${publishedDays} jours sur ` +
      `${possibleDays} ces 4 dernières semaines. C'est grâce à des établissements comme le vôtre que Plats du Jour ` +
      `se remplit et que la communication pourra démarrer dans votre quartier.\n\n` +
      `Continuez ainsi, voici pourquoi : ${keepGoingLink()}\n\nL'équipe Plats du Jour`,
  }),

  /** Au propriétaire, juste après sa résiliation : confirmation, date de fin et réactivation possible. */
  cancellationConfirmed: (restaurantName: string, endDate: Date): Email => ({
    subject: 'Votre résiliation est bien enregistrée',
    body:
      `Bonjour,\n\nNous vous confirmons la résiliation de l'abonnement Plats du Jour de ${restaurantName}. ` +
      `Aucun prélèvement ne sera effectué.\n\n` +
      `Jusqu'au ${longDate(endDate)} inclus, vous pouvez continuer à publier vos plats du jour : ils restent ` +
      `visibles par les clients de votre quartier. Après cette date, ils ne seront plus affichés.\n\n` +
      `Vous avez changé d'avis ? Vous pouvez réactiver votre abonnement à tout moment, en un clic, depuis votre ` +
      `espace, rubrique « Mon abonnement » : ${subscriptionLink()}\n\n` +
      `Merci d'avoir fait partie de Plats du Jour,\nL'équipe Plats du Jour`,
  }),

  /**
   * 7 jours avant le premier prélèvement (remplace l'ancien SMS).
   * En vrai, Stripe peut envoyer cet e-mail automatiquement (« fin de période d'essai »).
   */
  trialEnding: (
    restaurantName: string,
    planName: string,
    priceHt: number,
    priceTtc: number,
    chargeDate: Date,
    daysLeft: number
  ): Email => ({
    subject: `Votre période gratuite se termine dans ${daysLeft} jours`,
    body:
      `Bonjour,\n\nLa période gratuite de 6 mois de ${restaurantName} sur Plats du Jour arrive à expiration ` +
      `d'ici ${daysLeft} jours.\n\n` +
      `Le ${longDate(chargeDate)}, nous débiterons votre carte bancaire de ${priceTtc.toFixed(2).replace('.', ',')} € TTC ` +
      `(${String(priceHt).replace('.', ',')} € HT) pour votre formule ${planName}, puis chaque mois à la même date. ` +
      `Une facture vous sera envoyée par e-mail après chaque prélèvement.\n\n` +
      `Vous n'avez rien à faire pour continuer. N'hésitez pas à vous connecter à votre espace pour vérifier votre ` +
      `carte, changer de formule ou résilier sans frais, rubrique « Mon abonnement » : ${subscriptionLink()}\n\n` +
      `Merci de votre confiance,\nL'équipe Plats du Jour`,
  }),
};
