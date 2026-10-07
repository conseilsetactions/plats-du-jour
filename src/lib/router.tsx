import { RootRoute, Route, Router } from '@tanstack/react-router';
import Layout from '@/pages/Layout';
import Home from '@/pages/Home';
import PlatsDetail from '@/pages/PlatsDetail';
import NotFound from '@/pages/NotFound';
import ProLanding from '@/pages/pro/ProLanding';
import ProFaq from '@/pages/pro/ProFaq';
import ProGettingStarted from '@/pages/pro/ProGettingStarted';
import ProKeepGoing from '@/pages/pro/ProKeepGoing';
import ProLogin from '@/pages/pro/ProLogin';
import ProInvitation from '@/pages/pro/ProInvitation';
import ProSubscription from '@/pages/pro/ProSubscription';
import ProMySubscription from '@/pages/pro/ProMySubscription';
import ProEstablishment from '@/pages/pro/ProEstablishment';
import ProCancel from '@/pages/pro/ProCancel';
import ProInvoices from '@/pages/pro/ProInvoices';
import ProInvoice from '@/pages/pro/ProInvoice';
import ProTeam from '@/pages/pro/ProTeam';
import { PLAN_IDS, type PlanId } from '@/lib/plans';
import ProDashboard from '@/pages/pro/ProDashboard';
import Legal from '@/pages/Legal';
import About from '@/pages/About';
import Admin from '@/pages/admin/Admin';

const rootRoute = new RootRoute({
  component: Layout,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const platsDetailRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/plats/$platId',
  component: PlatsDetail,
});

const proLandingRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro',
  component: ProLanding,
});

const proGettingStartedRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/bien-demarrer',
  component: ProGettingStarted,
});

const proKeepGoingRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/continuer', // lien des SMS automatiques de la semaine
  component: ProKeepGoing,
});

const proFaqRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/faq',
  component: ProFaq,
});

export interface ProLoginSearch {
  mode?: 'login' | 'signup';
  plan?: PlanId;
}

const proLoginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/connexion',
  component: ProLogin,
  validateSearch: (search: Record<string, unknown>): ProLoginSearch => ({
    mode: search.mode === 'signup' ? 'signup' : search.mode === 'login' ? 'login' : undefined,
    plan: PLAN_IDS.includes(search.plan as PlanId) ? (search.plan as PlanId) : undefined,
  }),
});

const proDashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/espace',
  component: ProDashboard,
});

const proSubscriptionRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/abonnement',
  component: ProSubscription,
});

const proMySubscriptionRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/mon-abonnement',
  component: ProMySubscription,
});

export interface ProEstablishmentSearch {
  /** Page où revenir après l'enregistrement (ex. depuis la saisie des plats). */
  retour?: 'espace';
}

const proEstablishmentRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/etablissement',
  component: ProEstablishment,
  validateSearch: (search: Record<string, unknown>): ProEstablishmentSearch => ({
    retour: search.retour === 'espace' ? 'espace' : undefined,
  }),
});

const proCancelRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/resiliation',
  component: ProCancel,
});

const proInvoicesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/factures',
  component: ProInvoices,
});

const proInvoiceRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/factures/$invoiceId',
  component: ProInvoice,
});

const proTeamRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/pro/equipe',
  component: ProTeam,
});

const proInvitationRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/i/$code', // lien court, envoyé par SMS
  component: ProInvitation,
});

// Interface admin (démo : non protégée — à mettre derrière une connexion administrateur)
const adminRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: Admin,
});

const legalRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/legal/$doc',
  component: Legal,
});

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/qui-sommes-nous',
  component: About,
});

const notFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  platsDetailRoute,
  proLandingRoute,
  proFaqRoute,
  proGettingStartedRoute,
  proKeepGoingRoute,
  proLoginRoute,
  proDashboardRoute,
  proSubscriptionRoute,
  proMySubscriptionRoute,
  proEstablishmentRoute,
  proCancelRoute,
  proInvoicesRoute,
  proInvoiceRoute,
  proTeamRoute,
  proInvitationRoute,
  adminRoute,
  legalRoute,
  aboutRoute,
  notFoundRoute,
]);

export const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
