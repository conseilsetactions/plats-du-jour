import { useState } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowLeft, Check } from 'lucide-react';
import ProPage from '@/components/pro/ProPage';
import { EditRestaurantForm, OpenDaysForm } from '@/components/pro/RestaurantForm';
import { proStore, useProDb } from '@/lib/proStore';

/**
 * Mon établissement.
 * Propriétaire : nom affiché, ville, quartier et jours d'ouverture (adresse et SIRET viennent de la vérification).
 * Membre de l'équipe : jours d'ouverture uniquement.
 */
export default function ProEstablishment() {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const isOwner = proStore.getContext(useProDb()).role === 'owner';
  // Venu de la saisie des plats (« Modifier » les jours d'ouverture) : on y retourne après l'enregistrement
  const { retour } = useSearch({ from: '/pro/etablissement' });
  const backToSpace = retour === 'espace';
  const done = () => (backToSpace ? navigate({ to: '/pro/espace' }) : setSaved(true));
  const cancel = backToSpace ? () => navigate({ to: '/pro/espace' }) : undefined;

  return (
    <ProPage title={isOwner ? 'Mon établissement' : "Jours d'ouverture"}>
      {({ restaurant }) => (
        <section className="px-4 py-5">
          {backToSpace && (
            <Link to="/pro/espace" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent no-underline">
              <ArrowLeft className="h-4 w-4" />
              Retour à mes plats du jour
            </Link>
          )}
          {isOwner ? (
            <>
              <p className="mb-4 text-[13px] text-muted-foreground">
                L'adresse et le SIRET proviennent de la vérification de votre établissement et ne peuvent pas
                être modifiés ici
              </p>
              <EditRestaurantForm key={restaurant.id} restaurant={restaurant} onDone={done} onCancel={cancel} />
            </>
          ) : (
            <>
              <p className="mb-4 text-[13px] text-muted-foreground">
                Indiquez les jours où {restaurant.name} sert le midi. Les jours fermés, il n'y a pas de plat à saisir
              </p>
              <OpenDaysForm key={restaurant.id} restaurant={restaurant} onDone={done} onCancel={cancel} />
            </>
          )}
          {saved && (
            <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-accent-strong">
              <Check className="h-4 w-4" />
              Modifications enregistrées
            </p>
          )}
        </section>
      )}
    </ProPage>
  );
}
