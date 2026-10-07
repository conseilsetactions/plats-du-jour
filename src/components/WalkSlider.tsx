import { Footprints } from 'lucide-react';

/** Paliers du curseur, en minutes de marche ; `null` = toutes distances. */
export const WALK_STEPS = [3, 5, 10, 15, null] as const;
export type WalkLimit = (typeof WALK_STEPS)[number];

interface WalkSliderProps {
  value: WalkLimit;
  onChange: (value: WalkLimit) => void;
}

/** Curseur « À pied » : 3, 5, 10, 15 min ou toutes distances. */
export default function WalkSlider({ value, onChange }: WalkSliderProps) {
  const index = WALK_STEPS.indexOf(value);
  const label = value === null ? 'Toutes distances' : `${value} min max`;

  return (
    <div className="flex items-center gap-3">
      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <Footprints className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        À pied
      </span>
      <input
        type="range"
        min={0}
        max={WALK_STEPS.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(WALK_STEPS[Number(e.target.value)])}
        aria-label="Temps de marche maximum"
        aria-valuetext={label}
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[#d97757]"
      />
      <span
        className={`w-[104px] shrink-0 text-right text-xs font-semibold ${value === null ? 'text-muted-foreground' : 'text-accent-strong'}`}
      >
        {label}
      </span>
    </div>
  );
}
