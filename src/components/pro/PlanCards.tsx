import { Check, Sparkles } from 'lucide-react';
import { FREE_MONTHS, PLAN_IDS, PLANS, type PlanId } from '@/lib/plans';

interface PlanCardsProps {
  selected?: PlanId;
  /** Sans `onSelect`, les cartes sont simplement informatives. */
  onSelect?: (plan: PlanId) => void;
  /** Sur ordinateur, les trois formules côte à côte. */
  columns?: boolean;
}

/** Les trois formules, empilées ; la formule sélectionnée est mise en avant. */
export default function PlanCards({ selected, onSelect, columns = false }: PlanCardsProps) {
  const selectable = !!onSelect;
  return (
    <div
      role={selectable ? 'radiogroup' : 'list'}
      aria-label="Formules"
      className={`space-y-2 ${columns ? 'lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0' : ''}`}
    >
      {PLAN_IDS.map((id) => {
        const { name, price, tagline, features } = PLANS[id];
        const active = selected === id;
        const Card = selectable ? 'button' : 'div';
        return (
          <Card
            key={id}
            {...(selectable
              ? { type: 'button' as const, role: 'radio', 'aria-checked': active, onClick: () => onSelect(id) }
              : { role: 'listitem' })}
            className={`flex w-full items-start justify-between gap-3 rounded-md border bg-card p-3 text-left transition-colors ${
              columns ? 'lg:p-5' : ''
            } ${
              active ? 'border-accent ring-1 ring-accent' : selectable ? 'border-input hover:border-accent/50' : 'border-input'
            }`}
          >
            <span className="min-w-0">
              <span className={`flex items-center gap-1 text-sm font-semibold ${active ? 'text-accent' : 'text-foreground'}`}>
                {name}
                {id === 'ia' && <Sparkles className="h-3.5 w-3.5 text-accent" />}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{tagline}</span>
              <span className="mt-1.5 block space-y-0.5">
                {features.map((feature) => (
                  <span key={feature} className="flex gap-1 text-[11px] leading-snug text-muted-foreground">
                    <Check className="mt-px h-3 w-3 shrink-0 text-accent" />
                    {feature}
                  </span>
                ))}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block text-lg font-bold leading-tight text-accent-strong">Gratuit</span>
              <span className="block text-[11px] font-medium text-accent-strong">pendant {FREE_MONTHS} mois</span>
              <span className="mt-1 block text-[11px] text-muted-foreground">
                puis <span className="font-semibold text-foreground">{price} € HT</span>/mois
              </span>
            </span>
          </Card>
        );
      })}
    </div>
  );
}
