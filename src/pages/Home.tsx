import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import Header from '@/components/Header';
import LocationPicker from '@/components/LocationPicker';
import { findNearestZone, getSearchLocation, loadZone, saveZone, type Zone } from '@/hooks/searchZone';
import PlatsCard from '@/components/PlatsCard';
import PlatsMap from '@/components/PlatsMap';
import PlatsTable from '@/components/PlatsTable';
import FilterPill from '@/components/FilterPill';
import WalkSlider, { type WalkLimit } from '@/components/WalkSlider';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PublicIntro from '@/components/PublicIntro';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { getServiceStatus, useNow, type ServiceStatus } from '@/lib/clock';
import { getListVariant, trackList, type ListVariant } from '@/lib/listAbtest';
import { useProDb } from '@/lib/proStore';
import type { Plat } from '@/types';
import { getMockPlats, publishedToPlats } from '@/utils/mockData';
import { filterByPriceRange, formatDay, walkingMinutes } from '@/utils/format';
import { Clock3, Search, SearchX, X } from 'lucide-react';

const PRICE_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'budget', label: '< 8€' },
  { value: 'mid', label: '8-12€' },
  { value: 'premium', label: '> 12€' },
] as const;

const RATING_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: '4', label: '4 ★ et +' },
  { value: '4.5', label: '4,5 ★ et +' },
] as const;

type PriceFilterValue = (typeof PRICE_OPTIONS)[number]['value'];
type RatingFilterValue = (typeof RATING_OPTIONS)[number]['value'];

const closedMessages: Record<Exclude<ServiceStatus, 'open'>, { title: string; text: string }> = {
  before: {
    title: 'Rendez-vous à 11h',
    text: 'Retrouvez à 11h les plats du jour de votre quartier',
  },
  after: {
    title: 'Le service du midi est terminé',
    text: 'Revenez demain à partir de 11h pour retrouver les plats du jour de votre quartier',
  },
  weekend: {
    title: 'Les plats du jour reviennent lundi',
    text: 'Rendez-vous lundi à partir de 11h pour retrouver les plats du jour de votre quartier',
  },
};

const card = 'lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-card';

export default function Home() {
  const { location, loading, error, setConsentGiven } = useGeolocation();
  const now = useNow();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const status = getServiceStatus(now);
  const [zone, setZone] = useState<Zone>(loadZone);
  // Filtres remis à « Tous » à chaque visite
  const [priceFilter, setPriceFilter] = useState<PriceFilterValue>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilterValue>('all');
  const [walkLimit, setWalkLimit] = useState<WalkLimit>(null); // minutes de marche max
  // Le GPS peut être éteint sans perdre la position déjà connue
  const [gpsOff, setGpsOff] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Version C : établissement survolé dans la liste ou choisi sur le plan
  const [activeRestaurant, setActiveRestaurant] = useState<string | null>(null);
  const [listVariant] = useState<ListVariant>(getListVariant);
  const proDb = useProDb();
  // `now` en dépendance : la liste des plats publiés change avec le jour
  const published = useMemo(() => publishedToPlats(proDb), [proDb, now]);

  const gpsLocation = gpsOff ? null : location;
  const effectiveLocation = getSearchLocation(zone, gpsLocation);
  const gpsActive = !zone.quartier && !!gpsLocation;
  // GPS loin de toute ville couverte : pas de filtres ni de liste, seulement la présentation
  const outOfZone = gpsActive && !findNearestZone(gpsLocation);

  const gpsError = error
    ? error.code === 1
      ? 'Localisation refusée. Choisissez plutôt une ville et un quartier'
      : 'Position introuvable. Choisissez plutôt une ville et un quartier'
    : null;

  const filteredPlats = useMemo(() => {
    if (!effectiveLocation) return [];
    const query = searchQuery.trim().toLowerCase();

    return getMockPlats(effectiveLocation, published).plats.filter((plat) => {
      if (!filterByPriceRange(plat.price, priceFilter)) return false;
      if (ratingFilter !== 'all' && (plat.restaurant.rating ?? 0) < Number(ratingFilter)) return false;
      if (gpsActive && walkLimit !== null && walkingMinutes(plat.restaurant.distance) > walkLimit) return false;
      if (!query) return true;
      return (
        plat.name.toLowerCase().includes(query) ||
        plat.restaurant.name.toLowerCase().includes(query)
      );
    });
  }, [effectiveLocation?.latitude, effectiveLocation?.longitude, published, priceFilter, ratingFilter, walkLimit, gpsActive, searchQuery]);

  const isOpen = status === 'open';
  const hasList = isOpen && !!effectiveLocation && !outOfZone && filteredPlats.length > 0;

  // Ordinateur : A/B test A (ardoise) / C (liste + plan) pour les visiteurs avec GPS.
  // Sans GPS, toujours le plan : c'est le seul moyen de situer les établissements.
  const inAbTest = isDesktop && gpsActive;
  const desktopVariant: ListVariant = gpsActive ? listVariant : 'c';

  // Une vue par visite et par version, seulement quand la liste est réellement affichée
  const viewTracked = useRef(false);
  useEffect(() => {
    if (!inAbTest || !hasList || viewTracked.current) return;
    viewTracked.current = true;
    trackList('view', listVariant);
  }, [inAbTest, hasList, listVariant]);

  const trackOpen = () => {
    if (inAbTest) trackList('plat_click', listVariant);
  };
  const openPlat = (plat: Plat) => {
    trackOpen();
    navigate({ to: '/plats/$platId', params: { platId: plat.id } });
  };

  // Clic sur un repère du plan : on montre ses plats dans la liste
  const selectFromMap = (id: string | null) => {
    setActiveRestaurant(id);
    if (id) document.querySelector(`[data-restaurant="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  // Interrupteur GPS : allumer (et oublier le quartier) ou éteindre
  const handleGps = () => {
    if (gpsActive) {
      setGpsOff(true);
      return;
    }
    const next = { city: zone.city, quartier: null };
    setZone(next);
    saveZone(next);
    setGpsOff(false);
    setConsentGiven(true);
  };

  const handleZone = (next: Zone) => {
    setZone(next);
    saveZone(next);
  };

  const countLine = (
    <p className="hidden border-b border-border px-5 py-3 text-sm text-muted-foreground lg:block">
      <span className="font-semibold text-foreground">
        {filteredPlats.length} plat{filteredPlats.length > 1 ? 's' : ''}
      </span>{' '}
      {gpsActive ? "autour de vous, les plus proches d'abord" : `dans le quartier ${zone.quartier}`}
    </p>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PWAInstallPrompt />

      <Header showProLink />

      <main className="mx-auto w-full max-w-md flex-1 bg-card pb-10 lg:max-w-6xl lg:bg-transparent lg:px-4 lg:py-6">
        {/* Zone et filtres (ordinateur : une barre en haut, toute la largeur pour les plats) */}
        <div className={card}>
          <section className="border-b border-border bg-accent-soft px-4 py-4 lg:px-5 lg:py-5">
            <LocationPicker
              day={formatDay(now)}
              gpsActive={gpsActive}
              gpsLoading={loading}
              gpsError={gpsError}
              gpsLocation={gpsLocation}
              zone={zone}
              onGps={handleGps}
              onZone={handleZone}
            />
            <p className="mt-2 text-xs text-muted-foreground">Du lundi au vendredi, de 11h à 14h</p>
          </section>

          {isOpen && effectiveLocation && !outOfZone && (
            <section className="space-y-2.5 border-b border-border bg-muted px-4 py-3 lg:flex lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-3 lg:space-y-0 lg:border-b-0 lg:px-5">
              <div className="relative lg:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
                <input
                  type="search"
                  placeholder="Plat ou restaurant…"
                  aria-label="Rechercher un plat ou un restaurant"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-card pl-8 pr-9 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 [&::-webkit-search-cancel-button]:hidden"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Effacer la recherche"
                    className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Le temps de marche n'a de sens qu'avec la vraie position (GPS) */}
              {gpsActive && (
                <div className="lg:w-80">
                  <WalkSlider value={walkLimit} onChange={setWalkLimit} />
                </div>
              )}

              <div className="flex gap-1.5">
                <FilterPill
                  label="Prix"
                  options={PRICE_OPTIONS}
                  current={priceFilter}
                  defaultValue="all"
                  onChange={setPriceFilter}
                />
                <FilterPill
                  label="Note Google"
                  options={RATING_OPTIONS}
                  current={ratingFilter}
                  defaultValue="all"
                  onChange={setRatingFilter}
                />
              </div>
            </section>
          )}
        </div>

        <div className="lg:mt-4">
          {hasList && isDesktop && desktopVariant === 'a' ? (
            /* Version A : l'ardoise du quartier */
            <section className={card}>
              {countLine}
              <PlatsTable plats={filteredPlats} showDistance={gpsActive} onOpen={trackOpen} />
            </section>
          ) : hasList && isDesktop ? (
            /* Version C : liste à gauche, plan à droite */
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-4">
              <section className={card}>
                {countLine}
                <ul aria-label="Plats du jour">
                  {filteredPlats.map((plat) => (
                    <li
                      key={plat.id}
                      data-restaurant={plat.restaurant.id}
                      onMouseEnter={() => setActiveRestaurant(plat.restaurant.id)}
                      onMouseLeave={() => setActiveRestaurant(null)}
                      className={activeRestaurant === plat.restaurant.id ? 'bg-accent-soft' : ''}
                    >
                      <Link to="/plats/$platId" params={{ platId: plat.id }} onClick={trackOpen} className="block no-underline">
                        <PlatsCard plat={plat} showDistance={gpsActive} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
              <div className="sticky top-[84px] h-[calc(100vh-108px)] overflow-hidden rounded-xl border border-border">
                <PlatsMap
                  plats={filteredPlats}
                  center={effectiveLocation!}
                  userLocation={gpsActive ? gpsLocation : null}
                  activeRestaurantId={activeRestaurant}
                  onSelectRestaurant={selectFromMap}
                  onOpenPlat={openPlat}
                />
              </div>
            </div>
          ) : (
            <section className={card}>
              {!isOpen ? (
                <div className="flex flex-col items-center px-8 py-12 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-accent">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <p className="font-semibold text-foreground">{closedMessages[status].title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{closedMessages[status].text}</p>
                </div>
              ) : !effectiveLocation ? (
                <p className="px-8 py-12 text-center text-sm text-muted-foreground">
                  Activez le GPS ou choisissez un quartier pour voir les plats du jour près de vous
                </p>
              ) : outOfZone ? null : filteredPlats.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <SearchX className="h-5 w-5" />
                  </span>
                  <p className="font-semibold text-foreground">Aucun plat trouvé</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Essayez un autre prix, une autre recherche ou un autre quartier
                  </p>
                </div>
              ) : (
                /* Téléphone : la liste simple */
                <ul aria-label="Plats les plus proches d'abord">
                  {filteredPlats.map((plat) => (
                    <li key={plat.id}>
                      <Link to="/plats/$platId" params={{ platId: plat.id }} className="block no-underline">
                        <PlatsCard plat={plat} showDistance={gpsActive} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Rien à montrer : on présente le site au grand public */}
          {!hasList && <PublicIntro onPickQuartier={(city, quartier) => handleZone({ city, quartier })} />}

          <p className="mx-4 mt-8 border-t border-border pt-4 text-center text-xs leading-relaxed text-subtle lg:mx-0 lg:mt-4 lg:border-t-0 lg:pt-0">
            Plats du Jour affiche uniquement les plats du jour saisis par les établissements participants.
            Nous ne pouvons pas garantir le nombre de plats disponibles dans chaque établissement : vérifiez
            auprès de l'établissement concerné si nécessaire
          </p>
        </div>
      </main>
    </div>
  );
}
