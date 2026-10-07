import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { errorClass, inputClass, labelClass, primaryButton } from './ui';

/** Mot de passe des pros : 4 chiffres, simple à retenir (les essais sont limités, voir proStore). */
export const PASSWORD_LENGTH = 4;
export const PASSWORD_REGEX = new RegExp(`^\\d{${PASSWORD_LENGTH}}$`);
export const PASSWORD_HINT = `${PASSWORD_LENGTH} chiffres`;

/** Style des champs de mot de passe à 4 chiffres. */
export const pinInputClass = `${inputClass} text-center text-xl tracking-[0.6em]`;

const passwordSchema = z
  .object({
    password: z.string().regex(PASSWORD_REGEX, `Le mot de passe contient ${PASSWORD_HINT}`),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Les deux saisies sont différentes' });

/** Choix du mot de passe à 4 chiffres (avec confirmation) : inscription, invitation, mot de passe oublié. */
export default function PasswordForm({
  submitLabel,
  onSubmit,
}: {
  submitLabel: string;
  onSubmit: (password: string) => Promise<void> | void;
}) {
  const [visible, setVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const pinProps = {
    type: visible ? 'text' : 'password',
    inputMode: 'numeric' as const,
    autoComplete: 'new-password',
    maxLength: PASSWORD_LENGTH,
    placeholder: '••••',
  };

  return (
    <form onSubmit={handleSubmit(({ password }) => onSubmit(password))} noValidate className="space-y-3">
      <div>
        <label htmlFor="new-password" className={labelClass}>
          Mot de passe ({PASSWORD_HINT})
        </label>
        <div className="relative">
          <input id="new-password" aria-invalid={!!errors.password} className={pinInputClass} {...pinProps} {...register('password')} />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className={errorClass}>{errors.password.message}</p>}
      </div>
      <div>
        <label htmlFor="confirm-password" className={labelClass}>
          Saisissez-le une seconde fois
        </label>
        <input id="confirm-password" aria-invalid={!!errors.confirm} className={pinInputClass} {...pinProps} {...register('confirm')} />
        {errors.confirm && <p className={errorClass}>{errors.confirm.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className={primaryButton}>
        {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
