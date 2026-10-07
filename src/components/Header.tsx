import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  CalendarDays,
  CircleHelp,
  CreditCard,
  Eye,
  FileText,
  LogOut,
  Menu,
  Sprout,
  Store,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { proStore, useProDb } from '@/lib/proStore';

/** Menu de l'espace pro du propriétaire. */
const ownerLinks = [
  { to: '/pro/espace', label: 'Mes plats du jour', icon: UtensilsCrossed },
  { to: '/pro/etablissement', label: 'Mon établissement', icon: Store },
  { to: '/pro/mon-abonnement', label: 'Mon abonnement', icon: CreditCard },
  { to: '/pro/factures', label: 'Mes factures', icon: FileText },
  { to: '/pro/equipe', label: 'Mon équipe', icon: Users },
] as const;

/** Membres de l'équipe : les plats du jour et les jours d'ouverture uniquement. */
const memberLinks = [
  { to: '/pro/espace', label: 'Mes plats du jour', icon: UtensilsCrossed },
  { to: '/pro/etablissement', label: "Jours d'ouverture", icon: CalendarDays },
] as const;

interface HeaderProps {
  subtitle?: string;
  /** Affiche le bouton « Publier mon menu » (pages client). */
  showProLink?: boolean;
  /** En-tête pleine largeur (admin sur ordinateur). */
  wide?: boolean;
}

export default function Header({ subtitle, showProLink = false, wide = false }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const db = useProDb();
  const proLoggedIn = proStore.hasActiveSpace(db);
  // Connecté mais inscription pas terminée (établissement ou paiement à faire)
  const signingUp = !!db.session && !proLoggedIn;
  const { restaurant, role } = proStore.getContext(db);
  const inPro = pathname.startsWith('/pro') || pathname.startsWith('/i/');

  // Fermeture du menu : changement de page, clic à l'extérieur, touche Échap
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const itemClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3 text-sm no-underline transition-colors hover:bg-muted ${
      active ? 'font-semibold text-accent' : 'text-foreground'
    }`;
  // Liens affichés directement dans l'en-tête sur ordinateur
  const inlineClass = (active: boolean) =>
    `rounded-md px-2.5 py-1.5 text-sm no-underline transition-colors hover:bg-muted ${
      active ? 'font-semibold text-accent' : 'text-foreground'
    }`;
  const width = wide ? 'max-w-6xl' : 'max-w-md lg:max-w-6xl';
  const visibleProLinks = role === 'owner' ? ownerLinks : memberLinks;

  const logoutButton = (
    <button
      onClick={async () => {
        // On quitte d'abord la page pro (sinon elle redirige vers la connexion)
        await navigate({ to: '/pro' });
        proStore.signOut();
      }}
      className={`${itemClass(false)} w-full text-left`}
    >
      <LogOut className="h-4 w-4 text-accent" />
      Déconnexion
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      {/* Admin en train de consulter l'espace d'un établissement */}
      {db.impersonating && restaurant && (
        <div className="bg-foreground text-card">
          <div className={`mx-auto flex items-center gap-2 px-4 py-2 text-xs ${width}`}>
            <Eye className="h-4 w-4 shrink-0 text-accent" />
            <span className="min-w-0 flex-1 truncate">
              Vue admin : <span className="font-semibold">{restaurant.name}</span>
            </span>
            <button
              onClick={async () => {
                await navigate({ to: '/admin' });
                proStore.stopImpersonating();
              }}
              className="shrink-0 rounded bg-accent px-2.5 py-1 font-semibold text-accent-foreground hover:bg-accent-strong"
            >
              Quitter
            </button>
          </div>
        </div>
      )}
      <div
        ref={menuRef}
        className={`relative mx-auto flex items-center gap-3 px-4 py-3 ${width}`}
      >
        <Link to="/" className="flex items-center gap-3 no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <UtensilsCrossed className="h-[18px] w-[18px]" />
          </span>
          <span className="flex flex-col">
            <span className="text-base font-semibold text-foreground">Plats du Jour</span>
            {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          </span>
        </Link>

        {/* Ordinateur : navigation principale visible en permanence */}
        <nav aria-label="Navigation" className="ml-6 hidden items-center gap-1 lg:flex">
          {signingUp ? (
            <span className="px-2.5 text-sm text-muted-foreground">Inscription en cours</span>
          ) : proLoggedIn ? (
            visibleProLinks.map(({ to, label }) => (
              <Link key={to} to={to} className={inlineClass(pathname === to)}>
                {label}
              </Link>
            ))
          ) : (
            <>
              <Link to="/" className={inlineClass(!inPro && pathname === '/')}>
                Voir les plats
              </Link>
              <Link to="/pro" className={inlineClass(inPro)}>
                Espace pro
              </Link>
              <Link to="/qui-sommes-nous" className={inlineClass(pathname === '/qui-sommes-nous')}>
                Qui sommes-nous
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {showProLink && (
            <Link
              to={proLoggedIn ? '/pro/espace' : '/pro'}
              className="rounded-md border border-accent px-2.5 py-1.5 text-xs font-medium text-accent no-underline hover:bg-accent hover:text-accent-foreground"
            >
              Publier mon menu
            </Link>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="main-menu"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className={`flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted ${
              proLoggedIn || signingUp ? '' : 'lg:hidden'
            }`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav
            id="main-menu"
            aria-label="Menu principal"
            className="absolute right-4 top-full mt-1 w-64 overflow-hidden rounded-md border border-border bg-card shadow-lg"
          >
            {proLoggedIn ? (
              <>
                <p className="truncate px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-subtle">
                  {restaurant?.name}
                </p>
                {/* Sur ordinateur, ces liens sont déjà dans l'en-tête */}
                <div className="lg:hidden">
                  {visibleProLinks.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} className={itemClass(pathname === to)}>
                      <Icon className="h-4 w-4 text-accent" />
                      {label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border lg:border-t-0">
                  <Link to="/pro/bien-demarrer" className={itemClass(pathname === '/pro/bien-demarrer')}>
                    <Sprout className="h-4 w-4 text-accent" />
                    Bien démarrer
                  </Link>
                  <Link to="/pro/faq" className={itemClass(pathname === '/pro/faq')}>
                    <CircleHelp className="h-4 w-4 text-accent" />
                    Aide
                  </Link>
                  <Link to="/" className={itemClass(pathname === '/')}>
                    <Eye className="h-4 w-4 text-accent" />
                    Voir les plats
                  </Link>
                  {logoutButton}
                </div>
              </>
            ) : signingUp ? (
              <>
                <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-subtle">
                  Inscription en cours
                </p>
                <Link to="/pro/espace" className={itemClass(false)}>
                  <Sprout className="h-4 w-4 text-accent" />
                  Reprendre mon inscription
                </Link>
                <div className="border-t border-border">
                  <Link to="/pro/faq" className={itemClass(pathname === '/pro/faq')}>
                    <CircleHelp className="h-4 w-4 text-accent" />
                    Aide
                  </Link>
                  <Link to="/" className={itemClass(pathname === '/')}>
                    <Eye className="h-4 w-4 text-accent" />
                    Voir les plats
                  </Link>
                  {logoutButton}
                </div>
              </>
            ) : (
              <>
                <Link to="/" className={itemClass(!inPro)}>
                  <UtensilsCrossed className="h-4 w-4 text-accent" />
                  Voir les plats
                </Link>
                <Link to="/pro" className={`${itemClass(inPro)} border-t border-border`}>
                  <Store className="h-4 w-4 text-accent" />
                  Espace pro
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
