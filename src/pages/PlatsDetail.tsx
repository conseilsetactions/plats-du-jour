import { useParams, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import Header from '@/components/Header';
import { getSearchLocation, loadZone } from '@/hooks/searchZone';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getServiceStatus, useNow } from '@/lib/clock';
import { useProDb } from '@/lib/proStore';
import { getPlatById, publishedToPlats } from '@/utils/mockData';
import { formatDistance, formatPrice, formatRating, formatWalk } from '@/utils/format';
import { ArrowLeft, ExternalLink, MapPin, Star } from 'lucide-react';

export default function PlatsDetail() {
  const { platId } = useParams({ from: '/plats/$platId' });
  const { location: gpsLocation } = useGeolocation();
  // Même position que la liste : distances identiques sur les deux pages
  const zone = loadZone();
  const location = getSearchLocation(zone, gpsLocation);
  // Distance affichée seulement avec la vraie position (pas depuis le centre d'un quartier)
  const gpsActive = !zone.quartier && !!gpsLocation;
  const proDb = useProDb();
  const now = useNow();
  const isOpen = getServiceStatus(now) === 'open';

  const plat = useMemo(
    () => (isOpen ? getPlatById(platId, location, publishedToPlats(proDb)) : null),
    [isOpen, location?.latitude, location?.longitude, platId, proDb, now]
  );

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
  // Option A : Google retrouve la fiche du restaurant à partir du nom et de l'adresse
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${restaurant.name}, ${street}, ${postalCode} ${city}`
  )}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-md flex-1 bg-card">
        <div className="border-b border-border px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent no-underline">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>

        <section className="border-b border-border px-4 py-5">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold text-foreground">{plat.name}</h1>
            <span className="shrink-0 text-xl font-bold text-accent">{formatPrice(plat.price)}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {plat.category ? `${plat.category} · Menu du jour` : 'Plat du jour'}
          </p>
        </section>

        <section className="space-y-4 px-4 py-5">
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
      </main>
    </div>
  );
}
