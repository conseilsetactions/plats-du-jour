import { useMemo, type ReactNode } from 'react';
import { Link, Navigate } from '@tanstack/react-router';
import { BellRing, MapPin, Users } from 'lucide-react';
import Header from '@/components/Header';
import MenuWeekForm from '@/components/pro/MenuWeekForm';
import ReminderPhonePicker from '@/components/pro/ReminderPhonePicker';
import { primaryButton, secondaryButton } from '@/components/pro/ui';
import SignupSteps from '@/components/pro/SignupSteps';
import { CreateRestaurantForm } from '@/components/pro/RestaurantForm';
import WeekForm, { type WeekDay, type WeekFormProps } from '@/components/pro/WeekForm';
import { getLastVisibleDay } from '@/lib/billing';
import { getPublishableDays, useNow } from '@/lib/clock';
import { formatOpenDays, getOpenDays, isOpenOn } from '@/lib/openDays';
import { isMenuPlan, PLANS } from '@/lib/plans';
import { proStore, useProDb } from '@/lib/proStore';
import { dateKey, formatDay, formatPhone } from '@/utils/format';
import { pageMain } from '@/components/layout';

/**
 * « Mes plats du jour » : l'accueil de l'espace pro, centré sur la publication.
 * Établissement, abonnement, factures et équipe sont accessibles depuis le menu ☰.
 */
export default function ProDashboard() {
  const db = useProDb();
  const now = useNow();
  const { restaurant, role, pendingPlan } = proStore.getContext(db);

  const today = dateKey(now);

  const { days, recentNames } = useMemo(() => {
    if (!restaurant) return { days: [] as WeekDay[], recentNames: [] as string[] };
    const mine = db.plats.filter((p) => p.restaurantId === restaurant.id);

    const days: WeekDay[] = getPublishableDays(now).map((date) => {
      const key = dateKey(date);
      return {
        key,
        label: formatDay(date),
        isToday: key === today,
        closed: !isOpenOn(restaurant, date),
        items: mine
          .filter((p) => p.date === key)
          .map(({ category, name, price }) => ({ category, name, price })),
      };
    });

    // Noms des plats déjà servis, proposés pendant la saisie (les plus récents d'abord)
    const recentNames = [
      ...new Set(
        mine
          .filter((p) => p.date < today)
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((p) => p.name)
      ),
    ].slice(0, 10);

    return { days, recentNames };
  }, [db, restaurant, now, today]);

  if (!db.session) return <Navigate to="/pro/connexion" search={{ mode: 'login' }} />;

  // Première connexion : on crée d'abord la fiche du restaurant
  if (!restaurant) {
    return (
      <Shell>
        <SignupSteps current="Établissement" />
        <section className="px-4 py-6">
          <h1 className="text-xl font-bold text-foreground">Votre établissement</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Formule choisie : <span className="font-medium text-foreground">{PLANS[pendingPlan].name}</span>.
            Indiquez le numéro SIRET de votre établissement, nous remplissons le reste
          </p>
          <CreateRestaurantForm />
          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Connecté avec le {formatPhone(db.session)}.{' '}
            <button onClick={proStore.signOut} className="font-medium text-accent">
              Se déconnecter
            </button>
          </p>
        </section>
      </Shell>
    );
  }

  const isOwner = role === 'owner';
  // Inscription pas terminée : la carte doit être enregistrée (période gratuite)
  if (isOwner && !restaurant.billing) return <Navigate to="/pro/abonnement" />;
  const { plan } = restaurant;
  const hasMultipleLines = days.some((day) => day.items.length > 1);
  const save: WeekFormProps['onSave'] = (entries) => proStore.saveWeek(restaurant.id, entries);

  return (
    <Shell>
      {/* Établissement, en rappel */}
      <section className="border-b border-border bg-muted px-4 py-3">
        <p className="truncate text-base font-semibold text-foreground">{restaurant.name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {restaurant.street}, {restaurant.city} · {restaurant.quartier}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-subtle">
          {formatOpenDays(getOpenDays(restaurant))}
          {' · '}
          <Link to="/pro/etablissement" search={{ retour: 'espace' }} className="font-semibold text-accent no-underline">
            Modifier
          </Link>
        </p>
        {!isOwner && <p className="mt-1 text-xs text-subtle">Vous publiez en tant que membre de l'équipe</p>}
      </section>

      {/* Abonnement résilié : on peut encore publier jusqu'à la fin de la période */}
      {restaurant.billing?.status === 'canceled' && (
        <section className="border-b border-border bg-muted px-4 py-3 text-[13px]">
          <p className="text-foreground">
            Abonnement résilié : vous pouvez publier et vos plats restent visibles jusqu'au{' '}
            <span className="font-semibold">
              {getLastVisibleDay(restaurant.billing).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </span>{' '}
            inclus
          </p>
          {isOwner && (
            <button onClick={proStore.resumeSubscription} className="mt-1 font-semibold text-accent">
              Réactiver mon abonnement
            </button>
          )}
        </section>
      )}

      {/* À partir de la 2e connexion : proposer de se faire aider par l'équipe */}
      {proStore.shouldShowTeamPrompt(db) && (
        <section className="border-b border-border bg-accent-soft px-4 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-accent" />
            Vous n'êtes pas seul en cuisine ?
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Souhaitez-vous que d'autres membres de l'équipe saisissent les plats du jour à votre place ? Chacun se
            connecte avec son propre portable
          </p>
          <div className="mt-3 flex gap-2">
            <Link to="/pro/equipe" className={`${primaryButton} flex-1 no-underline`}>
              Ajouter un membre
            </Link>
            <button onClick={proStore.dismissTeamPrompt} className={`${secondaryButton} flex-1`}>
              Plus tard
            </button>
          </div>
        </section>
      )}

      {/* Une équipe mais pas encore de numéro choisi pour le rappel de la semaine */}
      {proStore.needsReminderChoice(db) && (
        <section className="border-b border-border bg-accent-soft px-4 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BellRing className="h-4 w-4 text-accent" />
            À quel numéro envoyer le rappel de la semaine ?
          </p>
          <p className="mb-3 mt-1 text-[13px] text-muted-foreground">
            Merci d'indiquer à quel numéro nous devons envoyer le SMS de rappel (une fois par semaine, le 1er jour d'ouverture à 10h30, si le plat du jour n'est pas
            publié). Tout le monde peut quand même se connecter pour saisir les plats
          </p>
          <ReminderPhonePicker restaurant={restaurant} />
        </section>
      )}

      {/* Publication de la semaine */}
      <section className="px-4 py-5">
        <h1 className="text-xl font-bold text-foreground">
          {isMenuPlan(plan) ? 'Mes menus du jour de la semaine' : 'Mes plats du jour de la semaine'}
        </h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {isMenuPlan(plan)
            ? 'Vos suggestions du jour (entrée, plat, dessert, formule), du lundi au vendredi'
            : 'Un plat par jour, du lundi au vendredi'}
        </p>
        {plan === 'plat' && hasMultipleLines && (
          <p className="mt-2 text-xs text-accent-strong">
            Formule Plat du jour : seule la première ligne de chaque jour est affichée aux clients
          </p>
        )}

        <div className="mt-4">
          {isMenuPlan(plan) ? (
            <MenuWeekForm days={days} suggestions={recentNames} onSave={save} aiEnabled={plan === 'ia'} />
          ) : (
            <WeekForm days={days} suggestions={recentNames} onSave={save} />
          )}
        </div>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />
      <main className={`${pageMain} pb-10`}>{children}</main>
    </div>
  );
}
