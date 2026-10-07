// Backend SIMULÉ de l'espace restaurateur.
// Tout est stocké dans le navigateur (localStorage) pour tester le parcours.
// Cette API sera remplacée par un vrai backend (ex. Supabase) sans changer les écrans.
import { useSyncExternalStore } from 'react';
import type { Location } from '@/types';
import { PLANS, type MenuCategory, type PlanId } from '@/lib/plans';
import { SMS } from '@/lib/sms';
import { getBillingState } from '@/lib/billing';
import { getNow } from '@/lib/clock';
import { isOpenOn } from '@/lib/openDays';
import { dateKey } from '@/utils/format';

export interface RestaurantProfile {
  id: string;
  siret: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  quartier: string;
  location: Location;
  certifiedAt: string; // date de la certification « propriétaire ou représentant »
  openDays?: number[]; // jours d'ouverture le midi (1 = lundi … 5 = vendredi) ; absent = tous
}

export interface Invitation {
  code: string; // code à 6 chiffres envoyé par SMS
  sentAt: string;
  acceptedAt?: string;
}

/**
 * Abonnement (SIMULÉ). En vrai : abonnement Stripe avec période d'essai de 6 mois,
 * carte enregistrée sur la page de paiement hébergée par Stripe.
 */
export interface BillingDetails {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  email: string; // les factures Stripe sont envoyées par e-mail
}

export const CANCEL_REASONS = {
  price: 'Trop cher',
  usability: "Pas facile à utiliser",
  results: "Pas vu d'augmentation de clientèle",
  other: 'Autre raison',
} as const;

export type CancelReason = keyof typeof CANCEL_REASONS;

export interface Billing {
  status: 'trialing' | 'canceled';
  cardSavedAt: string;
  trialEndsAt: string; // date du premier prélèvement
  canceledAt?: string; // résilié : les plats restent visibles jusqu'à la fin de la période en cours
  cancelReason?: CancelReason;
  cancelComment?: string;
  details: BillingDetails;
}

/** Message automatique de suivi envoyé à un établissement (SIMULÉ : historique visible dans /admin). */
export interface AdminAction {
  id: string;
  at: string;
  restaurantId: string;
  type: 'sms_daily' | 'email_congrats';
}

/** E-mail envoyé à l'administrateur (SIMULÉ : enregistré ici, visible dans /admin). */
export interface AdminNotification {
  id: string;
  at: string;
  type: 'cancellation';
  to: string;
  subject: string;
  body: string;
}

/** Destinataire des alertes admin — À CONFIGURER avant la mise en ligne. */
export const ADMIN_EMAIL = 'admin@platsdujour.fr';

export interface Restaurant extends RestaurantProfile {
  plan: PlanId;
  ownerPhone: string;
  members: string[]; // n° de portable des membres de l'équipe
  invitations?: Record<string, Invitation>; // clé : n° de portable du membre
  billing?: Billing; // absent = carte pas encore enregistrée
  /** Numéro qui reçoit le SMS de rappel quotidien (absent = le propriétaire). */
  reminderPhone?: string;
  reminderConfirmed?: boolean; // numéro de rappel choisi explicitement
  /** Proposition « ajouter des membres de l'équipe » : nombre de « Plus tard » et connexion du dernier. */
  teamPrompt?: { dismissals: number; lastDismissedLogin: number };
}

/** Numéro qui reçoit le SMS de rappel quotidien. */
export const getReminderPhone = (restaurant: Restaurant) => restaurant.reminderPhone ?? restaurant.ownerPhone;

/** La proposition d'équipe s'affiche à partir de la 2e connexion, au plus deux fois. */
const TEAM_PROMPT_FROM_LOGIN = 2;
const TEAM_PROMPT_MAX_DISMISSALS = 2;

export interface SentSms {
  to: string;
  text: string;
  code: string;
}

const newInvitationCode = () => String(Math.floor(100000 + Math.random() * 900000));

export interface PublishedPlat {
  id: string;
  restaurantId: string;
  category?: MenuCategory; // formules Menu uniquement
  name: string;
  price: number;
  date: string; // AAAA-MM-JJ
}

export interface DayItem {
  category?: MenuCategory;
  name: string;
  price: number;
}

interface ProAccount {
  restaurantId?: string;
  pendingPlan?: PlanId; // formule choisie à l'inscription, avant la création du restaurant
  termsAcceptedAt?: string; // acceptation CGU / CGV / confidentialité
  gettingStartedSeenAt?: string; // page « Bien démarrer » vue (1re connexion après l'inscription)
  passwordHash?: string; // jamais le mot de passe en clair
  loginCount?: number; // nombre de connexions (l'inscription compte pour la 1re)
  failedLogins?: number; // essais de mot de passe ratés d'affilée
  lockedUntil?: string; // connexion bloquée jusqu'à cette date après trop d'essais
}

/** Mot de passe à 4 chiffres : on bloque après quelques essais ratés pour empêcher de tout essayer. */
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export type PasswordCheck = 'ok' | 'wrong' | 'locked';

/**
 * Empreinte du mot de passe (DÉMO : SHA-256 dans le navigateur).
 * En vrai : vérification côté serveur avec un algorithme dédié (Argon2 / bcrypt), jamais dans l'app.
 */
export const hashPassword = async (phone: string, password: string) => {
  const data = new TextEncoder().encode(`pdj:${normalizePhone(phone)}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

interface ProDb {
  accounts: Record<string, ProAccount>; // clé : n° de portable (+33…)
  restaurants: Record<string, Restaurant>;
  plats: PublishedPlat[]; // dans l'ordre de saisie
  session: string | null; // n° de portable connecté
  adminNotifications: AdminNotification[];
  adminActions: AdminAction[];
  /** L'admin consulte l'espace d'un établissement (« voir en tant que »). */
  impersonating?: boolean;
}

const DB_KEY = 'pdj:pro-db-v2';
const EMPTY_DB: ProDb = {
  accounts: {},
  restaurants: {},
  plats: [],
  session: null,
  adminNotifications: [],
  adminActions: [],
};

let cache: ProDb | null = null;
const listeners = new Set<() => void>();

const read = (): ProDb => {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(DB_KEY);
    cache = stored ? { ...EMPTY_DB, ...JSON.parse(stored) } : EMPTY_DB;
  } catch {
    cache = EMPTY_DB;
  }
  return cache!;
};

const write = (update: (db: ProDb) => ProDb) => {
  cache = update(read());
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(cache));
  } catch {
    // stockage indisponible : les données restent en mémoire pour la session
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const newId = () => Math.random().toString(36).slice(2, 10);

/** "06 12 34 56 78" -> "+33612345678" */
export const normalizePhone = (phone: string) =>
  phone.replace(/[\s.]/g, '').replace(/^0/, '+33');

/** Instantané réactif de la base : les composants se mettent à jour à chaque écriture. */
export const useProDb = () => useSyncExternalStore(subscribe, read);

export type ProDbSnapshot = ProDb;

const currentRestaurant = (db: ProDb): Restaurant | null => {
  const id = db.session ? db.accounts[db.session]?.restaurantId : undefined;
  return id ? db.restaurants[id] ?? null : null;
};

const updateRestaurant = (db: ProDb, update: (r: Restaurant) => Restaurant): ProDb => {
  const restaurant = currentRestaurant(db);
  return restaurant
    ? { ...db, restaurants: { ...db.restaurants, [restaurant.id]: update(restaurant) } }
    : db;
};

export const proStore = {
  // --- Connexion par SMS (code simulé) ---
  hasAccount: (phone: string) => normalizePhone(phone) in read().accounts,

  /** Connexion à un compte existant, ou création (inscription) avec la formule choisie. */
  signIn: (phone: string, signup?: { plan: PlanId }) => {
    const key = normalizePhone(phone);
    const now = new Date().toISOString();
    write((db) => {
      const next: ProDb = {
        ...db,
        session: key,
        accounts: {
          ...db.accounts,
          [key]: db.accounts[key]
            ? { ...db.accounts[key], loginCount: (db.accounts[key].loginCount ?? 1) + 1 }
            : { pendingPlan: signup?.plan ?? 'plat', termsAcceptedAt: now, loginCount: 1 },
        },
      };
      // Un membre invité qui se connecte avec son numéro rejoint l'équipe
      return updateRestaurant(next, (r) => {
        const invitation = r.invitations?.[key];
        return invitation && !invitation.acceptedAt
          ? { ...r, invitations: { ...r.invitations, [key]: { ...invitation, acceptedAt: now } } }
          : r;
      });
    });
  },

  /** Statut d'invitation d'un membre de l'équipe courante. */
  isMemberActive: (db: ProDb, phone: string) => {
    const invitation = currentRestaurant(db)?.invitations?.[phone];
    return !invitation || !!invitation.acceptedAt;
  },

  signOut: () => write((db) => ({ ...db, session: null, impersonating: false })),

  /**
   * Admin : ouvre l'espace pro d'un établissement « en tant que » son propriétaire.
   * DÉMO uniquement. En vrai : réservé aux administrateurs connectés, et chaque accès est journalisé.
   */
  impersonate: (restaurantId: string) =>
    write((db) => {
      const restaurant = db.restaurants[restaurantId];
      return restaurant ? { ...db, session: restaurant.ownerPhone, impersonating: true } : db;
    }),

  stopImpersonating: () => write((db) => ({ ...db, session: null, impersonating: false })),

  hasPassword: (phone: string) => !!read().accounts[normalizePhone(phone)]?.passwordHash,

  /**
   * Vérifie le mot de passe d'un compte existant. Après MAX_LOGIN_ATTEMPTS essais ratés,
   * la connexion est bloquée LOCK_MINUTES minutes (« mot de passe oublié » reste possible).
   * En vrai : ce contrôle se fait côté serveur.
   */
  checkPassword: async (phone: string, password: string): Promise<PasswordCheck> => {
    const key = normalizePhone(phone);
    const account = read().accounts[key];
    if (!account?.passwordHash) return 'wrong';
    if (account.lockedUntil && new Date(account.lockedUntil) > new Date()) return 'locked';

    const ok = account.passwordHash === (await hashPassword(phone, password));
    const failedLogins = ok ? 0 : (account.failedLogins ?? 0) + 1;
    const locked = failedLogins >= MAX_LOGIN_ATTEMPTS;
    write((db) => ({
      ...db,
      accounts: {
        ...db.accounts,
        [key]: {
          ...db.accounts[key],
          failedLogins: locked ? 0 : failedLogins,
          lockedUntil: locked ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : undefined,
        },
      },
    }));
    return ok ? 'ok' : locked ? 'locked' : 'wrong';
  },

  /** Enregistre le mot de passe (inscription, invitation ou mot de passe oublié) et débloque le compte. */
  setPassword: async (phone: string, password: string) => {
    const key = normalizePhone(phone);
    const passwordHash = await hashPassword(phone, password);
    write((db) =>
      db.accounts[key]
        ? {
            ...db,
            accounts: {
              ...db.accounts,
              [key]: { ...db.accounts[key], passwordHash, failedLogins: 0, lockedUntil: undefined },
            },
          }
        : db
    );
  },

  /**
   * La page « Bien démarrer » doit-elle s'afficher ? Oui à la première connexion qui suit
   * l'inscription : propriétaire, inscription terminée (carte enregistrée), page pas encore vue.
   */
  shouldShowGettingStarted: () => {
    const db = read();
    const restaurant = currentRestaurant(db);
    const account = db.session ? db.accounts[db.session] : undefined;
    return !!restaurant?.billing && restaurant.ownerPhone === db.session && !account?.gettingStartedSeenAt;
  },

  markGettingStartedSeen: () =>
    write((db) =>
      db.session && db.accounts[db.session]
        ? {
            ...db,
            accounts: {
              ...db.accounts,
              [db.session]: { ...db.accounts[db.session], gettingStartedSeenAt: new Date().toISOString() },
            },
          }
        : db
    ),

  /** Connecté ET inscription terminée (établissement créé ou membre d'une équipe). */
  hasActiveSpace: (db: ProDb) => !!currentRestaurant(db),

  /** Restaurant de la personne connectée et son rôle. */
  getContext: (db: ProDb) => {
    const restaurant = currentRestaurant(db);
    const account = db.session ? db.accounts[db.session] : undefined;
    return {
      restaurant,
      role: restaurant ? (restaurant.ownerPhone === db.session ? 'owner' : 'member') : null,
      pendingPlan: account?.pendingPlan ?? 'plat',
    } as const;
  },

  // --- Fiche restaurant ---
  createRestaurant: (profile: Omit<RestaurantProfile, 'id'>) => {
    write((db) => {
      if (!db.session) return db;
      const account = db.accounts[db.session] ?? {};
      const id = `pro-${newId()}`;
      const restaurant: Restaurant = {
        ...profile,
        id,
        plan: account.pendingPlan ?? 'plat',
        ownerPhone: db.session,
        members: [],
      };
      return {
        ...db,
        restaurants: { ...db.restaurants, [id]: restaurant },
        accounts: { ...db.accounts, [db.session]: { ...account, restaurantId: id, pendingPlan: undefined } },
      };
    });
  },

  updateRestaurant: (changes: Partial<Pick<RestaurantProfile, 'name' | 'city' | 'quartier' | 'openDays'>>) =>
    write((db) => updateRestaurant(db, (r) => ({ ...r, ...changes }))),

  // --- Équipe et rappel quotidien ---
  /**
   * Proposer d'ajouter des membres de l'équipe ? Au propriétaire, à partir de sa 2e connexion,
   * tant qu'il n'a pas d'équipe ; « Plus tard » la repousse à la connexion suivante (2 fois au plus).
   */
  shouldShowTeamPrompt: (db: ProDb) => {
    const restaurant = currentRestaurant(db);
    if (!restaurant || !db.session || restaurant.ownerPhone !== db.session || restaurant.members.length > 0) return false;
    const logins = db.accounts[db.session]?.loginCount ?? 1;
    const prompt = restaurant.teamPrompt ?? { dismissals: 0, lastDismissedLogin: 0 };
    return (
      logins >= TEAM_PROMPT_FROM_LOGIN &&
      prompt.dismissals < TEAM_PROMPT_MAX_DISMISSALS &&
      logins > prompt.lastDismissedLogin
    );
  },

  dismissTeamPrompt: () =>
    write((db) => {
      const logins = (db.session && db.accounts[db.session]?.loginCount) || 1;
      return updateRestaurant(db, (r) => ({
        ...r,
        teamPrompt: { dismissals: (r.teamPrompt?.dismissals ?? 0) + 1, lastDismissedLogin: logins },
      }));
    }),

  /** Choisit le numéro qui reçoit le SMS de rappel quotidien (propriétaire ou membre de l'équipe). */
  setReminderPhone: (phone: string) =>
    write((db) => updateRestaurant(db, (r) => ({ ...r, reminderPhone: phone === r.ownerPhone ? undefined : phone }))),

  /** Équipe présente mais numéro de rappel jamais choisi : on demande lequel utiliser. */
  needsReminderChoice: (db: ProDb) => {
    const restaurant = currentRestaurant(db);
    return (
      !!restaurant &&
      restaurant.ownerPhone === db.session &&
      restaurant.members.some((m) => restaurant.invitations?.[m]?.acceptedAt) &&
      !restaurant.reminderPhone &&
      !restaurant.reminderConfirmed
    );
  },

  /** Le propriétaire garde le rappel sur son propre numéro (choix explicite). */
  confirmReminderPhone: (phone: string) =>
    write((db) =>
      updateRestaurant(db, (r) => ({
        ...r,
        reminderPhone: phone === r.ownerPhone ? undefined : phone,
        reminderConfirmed: true,
      }))
    ),

  isSiretTaken: (siret: string) => Object.values(read().restaurants).some((r) => r.siret === siret),

  setPlan: (plan: PlanId) => write((db) => updateRestaurant(db, (r) => ({ ...r, plan }))),

  /** Démo : simule l'enregistrement de la carte chez Stripe et démarre la période gratuite. */
  startTrial: (trialEndsAt: Date, details: BillingDetails) =>
    write((db) =>
      updateRestaurant(db, (r) => ({
        ...r,
        billing: {
          status: 'trialing',
          cardSavedAt: new Date().toISOString(),
          trialEndsAt: trialEndsAt.toISOString(),
          details,
        },
      }))
    ),

  /**
   * DÉMO : crée des établissements fictifs inscrits il y a 6 semaines, avec des régularités
   * de publication variées sur les 4 dernières semaines (pour tester le suivi admin).
   */
  seedDemoRestaurants: () => {
    const now = getNow();
    const profiles: [string, string, number, number][] = [
      // [nom, quartier, part des jours publiés, lat/lng décalage]
      ['La Cantine du Port (démo)', 'Vieux Port', 1, 0.001],
      ['Le Bistrot Joliette (démo)', 'Joliette', 0.85, 0.002],
      ['Chez Mimi (démo)', 'Vieux Port', 0.6, 0.003],
      ['Le Petit Docker (démo)', 'Joliette', 0.35, 0.004],
      ['Traiteur Saint-Jean (démo)', 'Vieux Port', 0.15, 0.005],
      ['La Table Oubliée (démo)', 'Joliette', 0, 0.006],
    ];
    const signup = new Date(now);
    signup.setDate(signup.getDate() - 42);
    const trialEnd = new Date(signup);
    trialEnd.setMonth(trialEnd.getMonth() + 6);

    // Jours ouvrés des 4 dernières semaines, du plus ancien au plus récent
    const weekdays: string[] = [];
    for (let d = 27; d >= 0; d--) {
      const day = new Date(now);
      day.setDate(day.getDate() - d);
      if (day.getDay() >= 1 && day.getDay() <= 5) weekdays.push(dateKey(day));
    }

    write((db) => {
      const next = { ...db, accounts: { ...db.accounts }, restaurants: { ...db.restaurants }, plats: [...db.plats] };
      profiles.forEach(([name, quartier, rate, offset], i) => {
        const id = `pro-demo-${i + 1}`;
        const phone = `+3369900000${i + 1}`;
        const isJoliette = quartier === 'Joliette';
        next.accounts[phone] = { restaurantId: id };
        next.restaurants[id] = {
          id,
          siret: `9990000010${String(i + 1).padStart(4, '0')}`,
          name,
          street: `${10 + i} rue de la Démo`,
          postalCode: isJoliette ? '13002' : '13001',
          city: 'Marseille',
          quartier,
          location: {
            latitude: (isJoliette ? 43.3045 : 43.2951) + offset,
            longitude: (isJoliette ? 5.3665 : 5.374) - offset,
          },
          certifiedAt: signup.toISOString(),
          plan: (['plat', 'menu', 'ia'] as const)[i % 3],
          ownerPhone: phone,
          members: [],
          billing: {
            status: 'trialing',
            cardSavedAt: signup.toISOString(),
            trialEndsAt: trialEnd.toISOString(),
            details: {
              name: name.replace(' (démo)', ''),
              street: `${10 + i} rue de la Démo`,
              postalCode: isJoliette ? '13002' : '13001',
              city: 'Marseille',
              email: `demo${i + 1}@example.com`,
            },
          },
        };
        next.plats = next.plats.filter((p) => p.restaurantId !== id);
        // Publications réparties régulièrement selon la part voulue (les plus récentes en dernier)
        weekdays.forEach((date, d) => {
          if (Math.floor((d + 1) * rate) > Math.floor(d * rate)) {
            next.plats.push({ id: `${id}-${date}`, restaurantId: id, date, name: 'Plat du jour (démo)', price: 11 });
          }
        });
      });
      return next;
    });
  },

  /** Enregistre les messages automatiques de suivi envoyés (SIMULÉ). */
  logFollowUp: (restaurantIds: string[], type: AdminAction['type']) =>
    write((db) => ({
      ...db,
      adminActions: [
        ...restaurantIds.map((restaurantId) => ({ id: newId(), at: getNow().toISOString(), restaurantId, type })),
        ...(db.adminActions ?? []),
      ],
    })),

  updateBillingDetails: (details: BillingDetails) =>
    write((db) => updateRestaurant(db, (r) => (r.billing ? { ...r, billing: { ...r.billing, details } } : r))),

  /**
   * Résiliation : plus de prélèvement, plats visibles jusqu'à la fin de la période en cours.
   * Une alerte est envoyée par e-mail à l'administrateur avec la raison (SIMULÉ).
   */
  cancelSubscription: (reason?: CancelReason, comment?: string): AdminNotification | null => {
    const restaurant = currentRestaurant(read());
    if (!restaurant?.billing) return null;
    const now = getNow(); // heure simulée en démo
    const reasonLabel = reason ? CANCEL_REASONS[reason] : 'Non précisée';
    const notification: AdminNotification = {
      id: newId(),
      at: now.toISOString(),
      type: 'cancellation',
      to: ADMIN_EMAIL,
      subject: `Alerte résiliation : ${restaurant.name}`,
      body: [
        `${restaurant.name} (${restaurant.quartier}, ${restaurant.city}) vient de résilier son abonnement`,
        `Formule : ${PLANS[restaurant.plan].name}`,
        `Raison : ${reasonLabel}`,
        comment ? `Commentaire : « ${comment} »` : null,
        `Contact : ${restaurant.billing.details.email} / ${restaurant.ownerPhone}`,
        `SIRET : ${restaurant.siret}`,
      ]
        .filter(Boolean)
        .join('\n'),
    };
    write((db) => ({
      ...updateRestaurant(db, (r) => ({
        ...r,
        billing: {
          ...r.billing!,
          status: 'canceled',
          canceledAt: now.toISOString(),
          cancelReason: reason,
          cancelComment: comment || undefined,
        },
      })),
      adminNotifications: [notification, ...(db.adminNotifications ?? [])],
    }));
    return notification;
  },

  resumeSubscription: () =>
    write((db) =>
      updateRestaurant(db, (r) =>
        r.billing
          ? {
              ...r,
              billing: {
                ...r.billing,
                status: 'trialing',
                canceledAt: undefined,
                cancelReason: undefined,
                cancelComment: undefined,
              },
            }
          : r
      )
    ),

  // --- Équipe ---
  /** Ajoute un membre et lui envoie un SMS d'invitation (simulé). */
  addMember: (phone: string): { error: string } | { sms: SentSms } => {
    const key = normalizePhone(phone);
    const db = read();
    const restaurant = currentRestaurant(db);
    if (!restaurant) return { error: 'Restaurant introuvable' };
    if (key === restaurant.ownerPhone || restaurant.members.includes(key)) {
      return { error: 'Ce numéro fait déjà partie de votre équipe' };
    }
    if (db.accounts[key]) return { error: 'Ce numéro est déjà utilisé par un autre compte' };

    const code = newInvitationCode();
    write((current) => ({
      ...updateRestaurant(current, (r) => ({
        ...r,
        members: [...r.members, key],
        invitations: { ...r.invitations, [key]: { code, sentAt: new Date().toISOString() } },
      })),
      accounts: { ...current.accounts, [key]: { restaurantId: restaurant.id } },
    }));
    return { sms: { to: key, code, text: SMS.invitation(restaurant.name, code) } };
  },

  /** Renvoie un SMS d'invitation avec un nouveau code (l'ancien n'est plus valable). */
  resendInvitation: (phone: string): SentSms | null => {
    const restaurant = currentRestaurant(read());
    if (!restaurant?.members.includes(phone)) return null;
    const code = newInvitationCode();
    write((db) =>
      updateRestaurant(db, (r) => ({
        ...r,
        invitations: { ...r.invitations, [phone]: { code, sentAt: new Date().toISOString() } },
      }))
    );
    return { to: phone, code, text: SMS.invitation(restaurant.name, code) };
  },

  /** Invitation correspondant à un code, si elle existe. */
  findInvitation: (db: ProDb, code: string) => {
    for (const restaurant of Object.values(db.restaurants)) {
      for (const [phone, invitation] of Object.entries(restaurant.invitations ?? {})) {
        if (invitation.code === code && restaurant.members.includes(phone)) {
          return { restaurantName: restaurant.name, phone, accepted: !!invitation.acceptedAt };
        }
      }
    }
    return null;
  },

  /** Le membre rejoint l'équipe : il est connecté avec son numéro. */
  acceptInvitation: (code: string) => {
    const found = proStore.findInvitation(read(), code);
    if (!found) return false;
    write((db) => {
      const restaurantId = db.accounts[found.phone]?.restaurantId;
      const restaurant = restaurantId ? db.restaurants[restaurantId] : undefined;
      if (!restaurant) return db;
      const invitation = restaurant.invitations![found.phone];
      return {
        ...db,
        session: found.phone,
        restaurants: {
          ...db.restaurants,
          [restaurant.id]: {
            ...restaurant,
            invitations: {
              ...restaurant.invitations,
              [found.phone]: { ...invitation, acceptedAt: invitation.acceptedAt ?? new Date().toISOString() },
            },
          },
        },
      };
    });
    return true;
  },

  removeMember: (phone: string) => {
    write((db) => {
      const { [phone]: _removed, ...accounts } = db.accounts;
      return {
        ...updateRestaurant(db, (r) => {
          const { [phone]: _invitation, ...invitations } = r.invitations ?? {};
          // Le rappel quotidien revient au propriétaire si ce membre le recevait
          const reminderPhone = r.reminderPhone === phone ? undefined : r.reminderPhone;
          return { ...r, members: r.members.filter((m) => m !== phone), invitations, reminderPhone };
        }),
        accounts,
      };
    });
  },

  /** Remplace les lignes publiées pour chacun des jours donnés (liste vide = rien ce jour-là). */
  saveWeek: (restaurantId: string, entries: { key: string; items: DayItem[] }[]) => {
    write((db) => {
      const dates = new Set(entries.map((e) => e.key));
      const isReplaced = (p: PublishedPlat) => p.restaurantId === restaurantId && dates.has(p.date);
      const previousIds = new Map<string, string[]>();
      db.plats.filter(isReplaced).forEach((p) => {
        previousIds.set(p.date, [...(previousIds.get(p.date) ?? []), p.id]);
      });

      const updated = entries.flatMap(({ key, items }) =>
        items.map((item, i) => ({
          id: previousIds.get(key)?.[i] ?? `pro-${newId()}`,
          restaurantId,
          date: key,
          ...item,
        }))
      );
      return { ...db, plats: [...db.plats.filter((p) => !isReplaced(p)), ...updated] };
    });
  },

  /**
   * Lignes publiées pour aujourd'hui, avec leur restaurant (pour la page d'accueil).
   * Formule Plat du jour : seule la première ligne du jour est affichée.
   */
  getTodayPlats: (db: ProDb) => {
    const today = dateKey();
    const seen = new Set<string>();
    return db.plats
      .filter((p) => {
        const restaurant = db.restaurants[p.restaurantId];
        if (p.date !== today || !restaurant) return false;
        // Fermé ce jour-là (jours d'ouverture modifiés après la saisie) : rien d'affiché
        if (!isOpenOn(restaurant, getNow())) return false;
        // Abonnement résilié et période (gratuite ou payée) terminée : plus visible
        const billing = restaurant.billing;
        if (billing?.status === 'canceled' && billing.canceledAt) {
          const visibleUntil = getBillingState(billing, new Date(billing.canceledAt)).nextCharge;
          if (today >= dateKey(visibleUntil)) return false;
        }
        if (restaurant.plan === 'plat') {
          if (seen.has(p.restaurantId)) return false;
          seen.add(p.restaurantId);
        }
        return true;
      })
      .map((p) => ({ plat: p, restaurant: db.restaurants[p.restaurantId] as RestaurantProfile }));
  },
};

/** Géocode une adresse via l'API Adresse du gouvernement (gratuite, sans clé). */
export const geocodeAddress = async (
  street: string,
  postalCode: string,
  city: string
): Promise<Location | null> => {
  try {
    const params = new URLSearchParams({ q: `${street} ${postalCode} ${city}`, limit: '1' });
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data.features?.[0]?.geometry?.coordinates;
    return coords ? { latitude: coords[1], longitude: coords[0] } : null;
  } catch {
    return null;
  }
};
