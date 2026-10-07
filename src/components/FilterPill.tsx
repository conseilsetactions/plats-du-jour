import { ChevronDown } from 'lucide-react';

interface FilterPillProps<T extends string> {
  label: string; // ex. « Prix »
  options: readonly { value: T; label: string }[];
  current: T;
  defaultValue: T;
  onChange: (value: T) => void;
}

/** Filtre compact : une petite pastille qui ouvre la liste native du téléphone. */
export default function FilterPill<T extends string>({
  label,
  options,
  current,
  defaultValue,
  onChange,
}: FilterPillProps<T>) {
  const active = current !== defaultValue;
  const currentLabel = options.find((o) => o.value === current)?.label ?? '';

  return (
    <label
      className={`relative inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-xs transition-colors ${
        active
          ? 'border-accent bg-accent text-accent-foreground'
          : 'border-input bg-card text-muted-foreground hover:border-accent/50'
      }`}
    >
      <span className="pointer-events-none">
        {label} : <span className={`font-semibold ${active ? '' : 'text-foreground'}`}>{currentLabel}</span>
      </span>
      <ChevronDown className="pointer-events-none h-3.5 w-3.5 opacity-70" />
      <select
        aria-label={label}
        value={current}
        onChange={(e) => onChange(e.target.value as T)}
        className="absolute inset-0 cursor-pointer bg-card text-foreground opacity-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
