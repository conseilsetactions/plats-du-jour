import { Link } from '@tanstack/react-router';
import { Footprints, Star } from 'lucide-react';
import type { Plat } from '@/types';
import { formatDistance, formatPrice, formatRating, formatWalk } from '@/utils/format';

interface PlatsTableProps {
  plats: Plat[];
  /** Colonne « À pied » : seulement avec la position GPS réelle. */
  showDistance: boolean;
  onOpen?: (plat: Plat) => void;
}

/** Version A (ordinateur) : l'ardoise du quartier, une ligne par plat. */
export default function PlatsTable({ plats, showDistance, onOpen }: PlatsTableProps) {
  const columns = showDistance
    ? 'grid-cols-[minmax(0,2.4fr)_minmax(0,1.6fr)_9rem_6rem_5rem]'
    : 'grid-cols-[minmax(0,2.4fr)_minmax(0,1.6fr)_6rem_5rem]';

  return (
    <div role="table" aria-label="Plats du jour" className="text-sm">
      <div role="row" className={`grid ${columns} gap-4 border-b border-border bg-muted px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-subtle`}>
        <span role="columnheader">Plat</span>
        <span role="columnheader">Établissement</span>
        {showDistance && <span role="columnheader">À pied</span>}
        <span role="columnheader">Note Google</span>
        <span role="columnheader" className="text-right">
          Prix
        </span>
      </div>
      {plats.map((plat) => (
        <Link
          key={plat.id}
          to="/plats/$platId"
          params={{ platId: plat.id }}
          onClick={() => onOpen?.(plat)}
          role="row"
          className={`grid ${columns} items-center gap-4 border-b border-border px-5 py-3 text-foreground no-underline transition-colors last:border-b-0 hover:bg-accent-soft`}
        >
          <span role="cell" className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold">{plat.name}</span>
            {plat.category && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {plat.category}
              </span>
            )}
          </span>
          <span role="cell" className="truncate text-muted-foreground">
            {plat.restaurant.name}
          </span>
          {showDistance && (
            <span role="cell" className="flex items-center gap-1 text-muted-foreground">
              <Footprints className="h-3.5 w-3.5 text-subtle" aria-hidden="true" />
              {formatWalk(plat.restaurant.distance)}
              <span className="text-xs text-subtle">· {formatDistance(plat.restaurant.distance)}</span>
            </span>
          )}
          <span role="cell" className="flex items-center gap-1 text-muted-foreground">
            {plat.restaurant.rating !== undefined && (
              <>
                <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
                {formatRating(plat.restaurant.rating)}
              </>
            )}
          </span>
          <span role="cell" className="text-right text-base font-bold text-accent">
            {formatPrice(plat.price)}
          </span>
        </Link>
      ))}
    </div>
  );
}
