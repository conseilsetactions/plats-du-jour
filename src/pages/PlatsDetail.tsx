import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import Header from '@/components/Header';
import PlatsMap from '@/components/PlatsMap';
import { getSearchLocation, loadZone } from '@/hooks/searchZone';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { getServiceStatus, useNow } from '@/lib/clock';
import { useProDb } from '@/lib/proStore';
import { getMockPlats, getPlatById, publishedToPlats } from '@/utils/mockData';
import { formatDistance, formatPrice, formatRating, formatWalk } from '@/utils/format';
import { ArrowLeft, ExternalLink, MapPin, Star } from 'lucide-react';

/**
 * Fiche d'un plat. Téléphone : une colonne. Ordinateur : informations à gauche, plan à droite.
 * Les autres plats du jour du même établissement sont listés (Formule « ardoise »).
 */
export default function PlatsDetail() {
  const { platId } = useParams({ from: '/plats/$platId' });
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { location: gpsLocation } = useGeolocation();
  // Même position que la liste : distances identiques sur les deux pages
  const zone = loadZone();
  const location = getSearchLocation(zone, gpsLocation);
  // Distance affichée seulement avec la vraie position (pas depuis le centre d'un quartier)
  const gpsActive = !zone.quartier && !!gpsLocation;
  const proDb = useProDb();
  const now = useNow();
  const isOpen = getServiceStatus(now) === 'open';

  const { plat, others } = useMemo(() => {
    if (!isOpen) return { plat: null, others: [] };
    const published = publishedToPlats(proDb);
    const found = getPlatById(platId, location, published);
    if (!found) return { plat: null, others: [] };
    // Autres plats du jour du même établissement, aujourd'hui
    const all = getMockPlats(location ?? found.restaurant.location, published, Infinity).plats;
    return {
      plat: found,
      others: all.filter((p) => p.restaurant.id === found.restaurant.id && p.id !== found.id),
    };
  }, [isOpen, location?.latitude, location?.longitude, platId, proDb, now]);

  if (!plat) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center bg-card px-4 text-center">
          <p className="mb-3 text-muted-foreground">Ce plat n'est plus disponible</p>
          <Link to="/" className="text-sm font-medium text-accent">
            Retour aux plats
          </Link>
        </main>
      </div>
    );
  }

  const { restaurant } = plat;
  const { street, postalCode, city, quartier } = restaurant.address;
  // Google retrouve la fiche du restaurant à partir du nom et de l'adresse
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${restaurant.name}, ${street}, ${postalCode} ${city}`
  )}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showProLink />

      <main className="mx-auto w-full max-w-md flex-1 bg-card lg:max-w-6xl lg:bg-transparent lg:px-4 lg:py-6">
        <div className="border-b border-border px-4 py-3 lg:border-b-0 lg:px-0 lg:pt-0">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent no-underline">
            <ArrowLeft className="h-4 w-4" />
            Retour aux plats
          </Link>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-4">
          <div className="lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-card">
            <section className="border-b border-border px-4 py-5 lg:px-6 lg:py-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">Plat du jour</p>
              <div className="mt-1 flex items-start justify-between gap-4">
                <h1 className="text-xl font-bold text-foreground lg:text-2xl">{plat.name}</h1>
                <span className="shrink-0 text-xl font-bold text-accent lg:text-2xl">{formatPrice(plat.price)}</span>
              </div>
            </section>

            <section className="space-y-4 px-4 py-5 lg:px-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">{restaurant.name}</h2>
                {restaurant.rating !== undefined && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
                    {formatRating(restaurant.rating)}
                    <span className="text-xs text-subtle">Google</span>
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                <div className="text-sm">
                  <p className="text-foreground">{street}</p>
                  <p className="text-muted-foreground">
                    {postalCode} {city} · {quartier}
                  </p>
                  {gpsActive && (
                    <p className="mt-1 text-xs text-subtle">
                      {formatDistance(restaurant.distance)} · environ {formatWalk(restaurant.distance)} à pied
                    </p>
                  )}
                </div>
              </div>

              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground no-underline hover:bg-accent-strong"
              >
                Voir sur Google Maps
                <ExternalLink className="h-4 w-4" />
              </a>
            </section>

            {/* Tout ce que l'établissement propose aujourd'hui */}
            {others.length > 0 && (
              <section className="border-t border-border px-4 py-5 lg:px-6">
                <h2 className="text-sm font-semibold text-foreground">Aussi aujourd'hui chez {restaurant.name}</h2>
                <ul className="mt-2 divide-y divide-border">
                  {others.map((other) => (
                    <li key={other.id}>
                      <Link
                        to="/plats/$platId"
                        params={{ platId: other.id }}
                        className="flex items-baseline justify-between gap-3 py-2.5 text-sm no-underline hover:text-accent"
                      >
                        <span className="text-foreground">{other.name}</span>
                        <span className="shrink-0 font-semibold text-accent">{formatPrice(other.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Ordinateur : le plan, avec l'établissement (et votre position si le GPS est activé) */}
          {isDesktop && (
            <div className="sticky top-[84px] h-[calc(100vh-140px)] min-h-[420px] overflow-hidden rounded-xl border border-border">
              <PlatsMap
                plats={[plat, ...others]}
                center={restaurant.location}
                userLocation={gpsActive ? gpsLocation : null}
                activeRestaurantId={restaurant.id}
                onSelectRestaurant={() => {}}
                onOpenPlat={(p) => navigate({ to: '/plats/$platId', params: { platId: p.id } })}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
