import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import type { BillingDetails } from '@/lib/proStore';
import { errorClass, inputClass, labelClass } from './ui';

export const billingSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez le nom ou la raison sociale'),
  street: z.string().trim().min(4, "Indiquez l'adresse"),
  postalCode: z.string().trim().regex(/^\d{5}$/, 'Code postal invalide'),
  city: z.string().trim().min(2, 'Indiquez la ville'),
  // Facultatifs : sans e-mail, les factures restent disponibles dans l'espace pro
  email: z
    .string()
    .trim()
    .refine((v) => v === '' || z.string().email().safeParse(v).success, 'Adresse e-mail invalide'),
  siret: z
    .string()
    .trim()
    .refine((v) => v === '' || /^d{14}$/.test(v.replace(/s/g, '')), 'Le SIRET contient 14 chiffres'),
});

export type BillingValues = z.infer<typeof billingSchema>;

/** Valeurs du formulaire -> informations enregistrées (champs facultatifs vides retirés). */
export const toBillingDetails = ({ email, siret, ...rest }: BillingValues): BillingDetails => ({
  ...rest,
  email: email || undefined,
  siret: siret ? siret.replace(/s/g, '') : undefined,
});

/** Informations enregistrées -> valeurs du formulaire. */
export const toBillingValues = (details: BillingDetails): BillingValues => ({
  ...details,
  email: details.email ?? '',
  siret: details.siret ?? '',
});

/** Champs « Informations de facturation » (inscription et page Mon abonnement). */
export default function BillingDetailsFields({ form }: { form: UseFormReturn<BillingValues> }) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="bill-name" className={labelClass}>
          Nom ou raison sociale
        </label>
        <input id="bill-name" aria-invalid={!!errors.name} className={inputClass} {...register('name')} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="bill-street" className={labelClass}>
          Adresse de facturation
        </label>
        <input
          id="bill-street"
          autoComplete="street-address"
          aria-invalid={!!errors.street}
          className={inputClass}
          {...register('street')}
        />
        {errors.street && <p className={errorClass}>{errors.street.message}</p>}
      </div>
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <div>
          <label htmlFor="bill-postal" className={labelClass}>
            Code postal
          </label>
          <input
            id="bill-postal"
            inputMode="numeric"
            maxLength={5}
            aria-invalid={!!errors.postalCode}
            className={inputClass}
            {...register('postalCode')}
          />
        </div>
        <div>
          <label htmlFor="bill-city" className={labelClass}>
            Ville
          </label>
          <input id="bill-city" aria-invalid={!!errors.city} className={inputClass} {...register('city')} />
        </div>
      </div>
      {(errors.postalCode || errors.city) && (
        <p className={errorClass}>{errors.postalCode?.message ?? errors.city?.message}</p>
      )}
      <div>
        <label htmlFor="bill-email" className={labelClass}>
          E-mail pour recevoir vos factures <span className="font-normal text-subtle">(facultatif)</span>
        </label>
        <input
          id="bill-email"
          type="email"
          autoComplete="email"
          placeholder="compta@monrestaurant.fr"
          aria-invalid={!!errors.email}
          className={inputClass}
          {...register('email')}
        />
        {errors.email ? (
          <p className={errorClass}>{errors.email.message}</p>
        ) : (
          <p className="mt-1 text-xs text-subtle">Sans e-mail, vos factures restent disponibles dans votre espace</p>
        )}
      </div>
      <div>
        <label htmlFor="bill-siret" className={labelClass}>
          SIRET <span className="font-normal text-subtle">(facultatif)</span>
        </label>
        <input
          id="bill-siret"
          inputMode="numeric"
          placeholder="14 chiffres, s'il doit figurer sur vos factures"
          aria-invalid={!!errors.siret}
          className={inputClass}
          {...register('siret')}
        />
        {errors.siret && <p className={errorClass}>{errors.siret.message}</p>}
      </div>
    </div>
  );
}
