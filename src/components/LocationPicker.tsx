import { ChevronDown, LoaderCircle, LocateFixed, X } from 'lucide-react';
import { findNearestZone, type Zone } from '@/hooks/searchZone';
import type { Location } from '@/types';
import { CITY_NAMES, getQuartiers, isCity } from '@/utils/mockData';

interface LocationPickerProps {
  /** Date du jour déjà formatée (« lundi 5 octobre »). */
  day: string;
  gpsActive: boolean;
  gpsLoading: boolean;
  gpsError: string | null;
  gpsLocation: Location | null;
  zone: Zone;
  onGps: () => void;
  onZone: (zone: Zone) => void;
}

/** Menu déroulant intégré à la phrase : le texte choisi apparaît souligné, en couleur. */
function InlineSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={`relative inline-flex cursor-pointer items-center gap-0.5 whitespace-nowrap rounded-md px-1.5 align-baseline transition-colors ${
        value
          ? 'text-accent-strong underline decoration-accent/40 decoration-2 underline-offset-4 hover:bg-card/60'
          : 'bg-card text-accent ring-1 ring-accent/50 hover:ring-accent'
      }`}
    >
      <span className="pointer-events-none">{value || placeholder}</span>
      <ChevronDown className="pointer-events-none h-4 w-4 shrink-0" aria-hidden="true" />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer bg-card text-base text-foreground opacity-0"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Choix de la zone sous forme de phrase :
 * « Voir les plats du jour de [Marseille ▾] dans le quartier [Vieux Port ▾] ou [utiliser ma position] ».
 * Avec le GPS : « Les plats du jour autour de moi », avec la ville et le quartier détectés.
 */
export default function LocationPicker({
  day,
  gpsActive,
  gpsLoading,
  gpsError,
  gpsLocation,
  zone,
  onGps,
  onZone,
}: LocationPickerProps) {
  const gpsZone = gpsActive && gpsLocation ? findNearestZone(gpsLocation) : null;
  const { city } = zone;
  const quartier = zone.quartier ?? '';

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-strong">Aujourd'hui, {day}</p>
      {gpsActive ? (
        <h1 className="mt-1 text-lg font-bold leading-snug text-foreground lg:text-xl">
          Les plats du jour <span className="text-accent-strong">autour de moi</span>
        </h1>
      ) : (
        <h1 className="mt-1 text-lg font-bold leading-loose text-foreground lg:text-xl">
          Voir les plats du jour de{' '}
          <InlineSelect
            label="Choisir une ville"
            value={city}
            placeholder="choisir une ville"
            options={CITY_NAMES}
            onChange={(next) => isCity(next) && onZone({ city: next, quartier: null })}
          />{' '}
          dans le quartier{' '}
          <InlineSelect
            label="Choisir un quartier"
            value={quartier}
            placeholder="choisir"
            options={getQuartiers(city)}
            onChange={(next) => onZone({ city, quartier: next })}
          />
        </h1>
      )}

      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
        {gpsActive ? (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 font-medium text-accent-foreground">
              <LocateFixed className="h-3.5 w-3.5" />
              {gpsZone ? `GPS activé · ${gpsZone.quartier}, ${gpsZone.city}` : 'GPS activé'}
              <button onClick={onGps} aria-label="Désactiver le GPS" className="-mr-1 rounded-full p-0.5 hover:bg-accent-strong">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
            <button onClick={onGps} className="font-medium text-accent underline underline-offset-2">
              choisir plutôt un quartier
            </button>
          </>
        ) : (
          <>
            ou
            <button
              onClick={onGps}
              disabled={gpsLoading}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/50 bg-card px-2.5 py-1 font-medium text-accent hover:border-accent disabled:opacity-60"
            >
              {gpsLoading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
              utiliser ma position GPS
            </button>
          </>
        )}
      </div>

      {gpsActive && gpsLocation && !gpsZone && (
        <p className="mt-2 text-[13px] text-accent-strong">
          Plats du Jour n'est pas encore disponible près de vous. Choisissez une ville et un quartier
        </p>
      )}
      {gpsError && (
        <p role="alert" className="mt-2 text-[13px] text-accent-strong">
          {gpsError}
        </p>
      )}
    </div>
  );
}
