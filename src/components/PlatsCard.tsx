import { Footprints, Star } from 'lucide-react';
import type { Plat } from '@/types';
import { formatDistance, formatPrice, formatRating, formatWalk } from '@/utils/format';

interface PlatsCardProps {
  plat: Plat;
  /** Distance et temps de marche : seulement avec la position GPS réelle. */
  showDistance?: boolean;
}

export default function PlatsCard({ plat, showDistance = true }: PlatsCardProps) {
  const { name, distance, rating } = plat.restaurant;

  return (
    <article className="border-b border-border px-4 py-3 transition-colors hover:bg-muted active:bg-muted">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="flex min-w-0 items-center gap-2 text-[15px] font-semibold text-foreground">
          <span className="truncate">{plat.name}</span>
          {plat.category && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {plat.category}
            </span>
          )}
        </h3>
        <span className="shrink-0 text-base font-bold text-accent">{formatPrice(plat.price)}</span>
      </div>

      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <span className="min-w-0 truncate">{name}</span>
        {showDistance && (
          <>
            <span aria-hidden="true">·</span>
            <span className="shrink-0 text-subtle">{formatDistance(distance)}</span>
            <span aria-hidden="true">·</span>
            <span
              className="flex shrink-0 items-center gap-0.5 text-subtle"
              aria-label={`environ ${formatWalk(distance)} à pied`}
            >
              <Footprints className="h-3 w-3" aria-hidden="true" />
              {formatWalk(distance)}
            </span>
          </>
        )}
        {rating !== undefined && (
          <>
            <span aria-hidden="true">·</span>
            <span
              className="flex shrink-0 items-center gap-0.5 text-subtle"
              aria-label={`Note Google ${formatRating(rating)} sur 5`}
            >
              <Star className="h-3 w-3 fill-accent text-accent" aria-hidden="true" />
              {formatRating(rating)}
              <span className="ml-0.5">Google</span>
            </span>
          </>
        )}
      </p>
    </article>
  );
}
