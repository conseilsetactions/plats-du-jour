import { useState } from 'react';
import { getReminderPhone, proStore, useProDb, type Restaurant } from '@/lib/proStore';
import { formatPhone } from '@/utils/format';
import { primaryButton } from './ui';

/**
 * Choix du numéro qui reçoit le SMS de rappel (une fois par semaine, 1er jour d'ouverture à 10h30, si le plat du jour n'est pas publié).
 * Tout le monde peut se connecter pour publier, mais un seul numéro reçoit le rappel.
 */
export default function ReminderPhonePicker({ restaurant, onSaved }: { restaurant: Restaurant; onSaved?: () => void }) {
  const db = useProDb();
  const [selected, setSelected] = useState(getReminderPhone(restaurant));
  const [saved, setSaved] = useState(false);
  // Propriétaire + membres qui ont accepté leur invitation
  const phones = [restaurant.ownerPhone, ...restaurant.members.filter((m) => proStore.isMemberActive(db, m))];

  return (
    <div>
      <div role="radiogroup" aria-label="Numéro qui reçoit le rappel de la semaine" className="space-y-1.5">
        {phones.map((phone) => (
          <label
            key={phone}
            className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors ${
              selected === phone ? 'border-accent bg-accent-soft' : 'border-input bg-card hover:border-accent/50'
            }`}
          >
            <input
              type="radio"
              name="reminder-phone"
              checked={selected === phone}
              onChange={() => {
                setSelected(phone);
                setSaved(false);
              }}
              className="h-4 w-4 accent-[#d97757]"
            />
            <span className="flex-1 text-foreground">{formatPhone(phone)}</span>
            <span className="text-xs text-subtle">{phone === restaurant.ownerPhone ? 'Propriétaire' : 'Membre'}</span>
          </label>
        ))}
      </div>
      <button
        onClick={() => {
          proStore.confirmReminderPhone(selected);
          setSaved(true);
          onSaved?.();
        }}
        className={`${primaryButton} mt-3`}
      >
        {saved ? 'Enregistré' : 'Enregistrer'}
      </button>
    </div>
  );
}
