// Textes de TOUS les SMS envoyés par l'app.
// Règle : chaque SMS doit tenir en UN seul SMS, soit 160 caractères maximum de
// l'alphabet SMS standard (GSM 03.38). Un seul caractère hors alphabet (ê, ç, ô, ’…)
// ferait passer la limite à 70 caractères : on les remplace donc avant l'envoi.

const GSM_BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const GSM_EXTENDED = '^{}\\[~]|€'; // comptent pour 2 caractères

export const SMS_MAX_LENGTH = 160;

/** Remplace les caractères hors alphabet SMS (ê -> e, ç -> c, œ -> oe, ’ -> '…). */
export const toGsm = (text: string) =>
  [...text]
    .map((char) => {
      if (GSM_BASIC.includes(char) || GSM_EXTENDED.includes(char)) return char;
      const replacements: Record<string, string> = { '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', œ: 'oe', Œ: 'OE' };
      if (replacements[char]) return replacements[char];
      const base = char.normalize('NFD').replace(/[̀-ͯ]/g, '');
      return [...base].every((c) => GSM_BASIC.includes(c)) ? base : '';
    })
    .join('');

/** Longueur facturée d'un SMS (les caractères étendus comptent double). */
export const smsLength = (text: string) =>
  [...text].reduce((total, char) => total + (GSM_EXTENDED.includes(char) ? 2 : 1), 0);

const checkSingleSms = (text: string) => {
  if (import.meta.env.DEV && smsLength(text) > SMS_MAX_LENGTH) {
    console.warn(`SMS trop long (${smsLength(text)} caractères) : ${text}`);
  }
  if (import.meta.env.DEV && toGsm(text) !== text) {
    console.warn(`SMS avec un caractère hors alphabet SMS (limite 70 caractères) : ${text}`);
  }
  return text;
};

/** Lien court envoyé dans le SMS d'invitation. */
export const invitationLink = (code: string) => `${window.location.origin}/i/${code}`;

/** Lien vers la page « Pourquoi continuer » (SMS automatiques de la semaine). */
export const keepGoingLink = () => `${window.location.origin}/pro/continuer`;

/** Lien vers l'espace pro (rappel de la semaine). */
export const spaceLink = () => `${window.location.origin}/pro/espace`;

/** Ton du rappel de la semaine selon la régularité du restaurateur (voir activity.ts). */
export type ReminderTone = 'new' | 'top' | 'regular' | 'low';

export const SMS = {
  /** Création de compte : vérification du portable (une seule fois). */
  signupCode: (code: string) =>
    checkSingleSms(`Plats du Jour : votre code d'inscription est ${code}. Ne le communiquez à personne.`),

  /** « Mot de passe oublié ». */
  resetCode: (code: string) =>
    checkSingleSms(
      `Plats du Jour : votre code pour choisir un nouveau mot de passe est ${code}. Ne le communiquez à personne.`
    ),

  /**
   * Automatique, UNE FOIS PAR SEMAINE : le 1er jour d'ouverture de la semaine à 10h30, au numéro
   * choisi pour le rappel (getReminderPhone : le propriétaire par défaut, ou un membre de l'équipe),
   * SEULEMENT si le plat du jour n'est pas encore publié. Le ton s'adapte à la régularité.
   * Objectif : limiter le coût des SMS (au plus ~4 par mois et par établissement).
   */
  weeklyReminder: (tone: ReminderTone) => {
    const texts: Record<ReminderTone, string> = {
      new: `Plats du Jour : nouvelle semaine ! Publiez vos plats du jour en une fois, avant 11h : ${spaceLink()}`,
      top: `Plats du Jour : vos habitués vous attendent ! Publiez vos plats de la semaine avant 11h : ${spaceLink()}`,
      regular: `Plats du Jour : nouvelle semaine ! Publiez vos plats du jour pour rester visible : ${spaceLink()}`,
      low: `Plats du Jour : vos clients ne voient pas vos plats. Publiez votre semaine en 2 minutes : ${spaceLink()}`,
    };
    return checkSingleSms(texts[tone]);
  },

  /** Ajout d'un membre par le propriétaire, et « Renvoyer » l'invitation. */
  invitation: (restaurantName: string, code: string) => {
    const build = (name: string) =>
      `${name} vous ajoute à son équipe sur Plats du Jour pour gérer ses menus. Code ${code} : ${invitationLink(code)}`;
    // Nom du restaurant raccourci si besoin pour rester dans un seul SMS
    let name = toGsm(restaurantName).trim();
    while (name.length > 1 && smsLength(build(name)) > SMS_MAX_LENGTH) name = name.slice(0, -1);
    return checkSingleSms(build(name.trim()));
  },
};
