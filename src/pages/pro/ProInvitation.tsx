import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { Users } from 'lucide-react';
import Header from '@/components/Header';
import PasswordForm from '@/components/pro/PasswordForm';
import { primaryButton, secondaryButton } from '@/components/pro/ui';
import { proStore, useProDb } from '@/lib/proStore';
import { formatPhone } from '@/utils/format';
import { narrowMain } from '@/components/layout';

/** Lien reçu par SMS par un nouveau membre de l'équipe. */
export default function ProInvitation() {
  const { code } = useParams({ from: '/i/$code' });
  const db = useProDb();
  const navigate = useNavigate();
  const invitation = proStore.findInvitation(db, code);

  // Le membre choisit son mot de passe en rejoignant l'équipe
  const join = async (password: string) => {
    if (!invitation || !proStore.acceptInvitation(code)) return;
    await proStore.setPassword(invitation.phone, password);
    navigate({ to: '/pro/espace' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />

      <main className={`${narrowMain} px-4 py-8 text-center`}>
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-accent">
          <Users className="h-5 w-5" />
        </span>

        {!invitation ? (
          <>
            <h1 className="text-lg font-bold text-foreground">Invitation introuvable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ce lien n'est plus valable. Demandez au propriétaire de l'établissement de vous renvoyer
              une invitation
            </p>
            <Link to="/pro" className={`${secondaryButton} mt-6 w-full no-underline`}>
              Espace pro
            </Link>
          </>
        ) : invitation.accepted ? (
          <>
            <h1 className="text-lg font-bold text-foreground">Invitation déjà acceptée</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Vous faites déjà partie de l'équipe de {invitation.restaurantName}. Connectez-vous avec
              votre numéro de portable et votre mot de passe
            </p>
            <Link
              to="/pro/connexion"
              search={{ mode: 'login' }}
              className={`${primaryButton} mt-6 no-underline`}
            >
              Se connecter
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-foreground">
              {invitation.restaurantName} vous invite à rejoindre son équipe
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Vous pourrez publier les plats et menus du jour de l'établissement depuis votre téléphone
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Numéro invité : <span className="font-medium text-foreground">{formatPhone(invitation.phone)}</span>
            </p>
            <div className="mt-6 text-left">
              <p className="mb-3 text-center text-sm font-medium text-foreground">
                Choisissez votre mot de passe pour vous connecter ensuite
              </p>
              <PasswordForm submitLabel="Rejoindre l'équipe" onSubmit={join} />
            </div>
            <p className="mt-3 text-xs text-subtle">
              Ce n'est pas vous ? Ignorez simplement ce message
            </p>
          </>
        )}
      </main>
    </div>
  );
}
