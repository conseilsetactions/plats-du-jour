import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, X } from 'lucide-react';
import { proStore, useProDb, type SentSms } from '@/lib/proStore';
import { formatPhone } from '@/utils/format';
import { errorClass, inputClass, secondaryButton } from './ui';

const MOBILE_REGEX = /^(\+33\s?|0)[67]([\s.]?\d{2}){4}$/;

const memberSchema = z.object({
  phone: z.string().trim().regex(MOBILE_REGEX, 'Numéro de portable invalide (ex. 06 12 34 56 78)'),
});

/** Liste de l'équipe, ajout d'un membre (SMS d'invitation) et retrait. */
export default function TeamManager({ members, ownerPhone }: { members: string[]; ownerPhone: string }) {
  const db = useProDb();
  // Dernier SMS d'invitation « envoyé » (affiché en démo)
  const [lastSms, setLastSms] = useState<SentSms | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof memberSchema>>({ resolver: zodResolver(memberSchema) });

  const add = ({ phone }: { phone: string }) => {
    const result = proStore.addMember(phone);
    if ('error' in result) return setError('phone', { message: result.error });
    reset({ phone: '' });
    setLastSms(result.sms);
  };

  return (
    <div>
      <p className="text-[13px] text-muted-foreground">
        Ajoutez le portable d'un membre : il reçoit un SMS d'invitation pour publier les menus avec son
        propre téléphone
      </p>

      <ul className="mt-3 divide-y divide-border rounded-md border border-border text-sm">
        <li className="flex items-center justify-between px-3 py-2.5">
          <span className="text-foreground">{formatPhone(ownerPhone)}</span>
          <span className="text-xs text-subtle">Propriétaire</span>
        </li>
        {members.map((phone) => (
          <li key={phone} className="flex items-center justify-between px-3 py-2">
            <span className="text-foreground">{formatPhone(phone)}</span>
            <span className="flex items-center gap-2">
              {proStore.isMemberActive(db, phone) ? (
                <span className="text-xs text-subtle">Actif</span>
              ) : (
                <>
                  <span className="text-xs text-accent-strong">Invitation envoyée</span>
                  <button
                    onClick={() => setLastSms(proStore.resendInvitation(phone))}
                    className="text-xs font-medium text-accent"
                  >
                    Renvoyer
                  </button>
                </>
              )}
              <button
                onClick={() => proStore.removeMember(phone)}
                aria-label={`Retirer ${formatPhone(phone)} de l'équipe`}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent-strong"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit(add)} noValidate className="mt-3">
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="Portable du membre"
            aria-label="Portable du nouveau membre"
            aria-invalid={!!errors.phone}
            className={inputClass}
            {...register('phone')}
          />
          <button type="submit" className={`${secondaryButton} shrink-0`}>
            <UserPlus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </form>

      {lastSms && (
        <div className="mt-4 rounded-md border border-dashed border-accent/60 p-3 text-[13px]">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-strong">
            Démo : SMS envoyé au {formatPhone(lastSms.to)}
          </p>
          <p className="mt-1.5 rounded-md bg-muted p-2.5 text-foreground">{lastSms.text}</p>
          <p className="mt-2 text-muted-foreground">
            Aucun SMS n'est réellement envoyé. Pour jouer le rôle du membre :{' '}
            <Link to="/i/$code" params={{ code: lastSms.code }} className="font-medium text-accent underline">
              ouvrir le lien de l'invitation
            </Link>{' '}
            (vous serez déconnecté de ce compte)
          </p>
        </div>
      )}
    </div>
  );
}
