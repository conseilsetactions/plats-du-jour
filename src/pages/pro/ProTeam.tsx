import { BellRing } from 'lucide-react';
import ProPage from '@/components/pro/ProPage';
import ReminderPhonePicker from '@/components/pro/ReminderPhonePicker';
import TeamManager from '@/components/pro/TeamManager';

/** Mon équipe : membres qui publient avec leur propre portable, et numéro du rappel de la semaine. */
export default function ProTeam() {
  return (
    <ProPage title="Mon équipe" ownerOnly>
      {({ restaurant }) => (
        <>
          <section className="px-4 py-5">
            <TeamManager members={restaurant.members} ownerPhone={restaurant.ownerPhone} />
          </section>

          <section className="border-t border-border px-4 py-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <BellRing className="h-4 w-4 text-accent" />
              Rappel de la semaine par SMS
            </h2>
            <p className="mb-3 mt-1 text-[13px] text-muted-foreground">
              Une fois par semaine, le 1er jour d'ouverture à 10h30, si le plat du jour n'est pas encore publié, un SMS est envoyé à un seul
              numéro. Tout le monde peut quand même se connecter pour publier
            </p>
            <ReminderPhonePicker key={restaurant.reminderPhone ?? restaurant.ownerPhone} restaurant={restaurant} />
          </section>
        </>
      )}
    </ProPage>
  );
}
