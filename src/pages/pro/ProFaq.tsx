import { Link } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import { primaryButton } from '@/components/pro/ui';
import { FREE_MONTHS, PLANS } from '@/lib/plans';
import { proStore, useProDb } from '@/lib/proStore';
import { pageMain } from '@/components/layout';

const faq: { q: string; a: string }[] = [
  {
    q: 'Combien ça coûte ?',
    a: `Les ${FREE_MONTHS} premiers mois sont gratuits, quelle que soit la formule. Ensuite : ${PLANS.plat.name} ${PLANS.plat.price} € HT/mois, ${PLANS.menu.name} ${PLANS.menu.price} € HT/mois, ${PLANS.ia.name} ${PLANS.ia.price} € HT/mois`,
  },
  {
    q: 'Pourquoi enregistrer ma carte bancaire dès l’inscription ?',
    a: `Pour que votre abonnement continue sans interruption après les ${FREE_MONTHS} mois offerts. Rien n'est prélevé pendant cette période, un e-mail vous prévient 7 jours avant le premier prélèvement, et vous pouvez annuler à tout moment depuis votre espace`,
  },
  {
    q: 'Prenez-vous une commission sur mes ventes ?',
    a: 'Non. Vous payez uniquement votre abonnement, aucune commission sur ce que vous vendez',
  },
  {
    q: 'Pourquoi me demande-t-on mon SIRET ?',
    a: "Pour vérifier que votre établissement existe et qu'il est en activité, et remplir son adresse automatiquement. Restaurants, traiteurs, boulangeries : toutes les activités sont acceptées",
  },
  {
    q: 'Quand mes plats sont-ils visibles ?',
    a: "Du lundi au vendredi, de 11h à 14h. Chaque plat n'est visible que le jour pour lequel vous l'avez publié, puis il disparaît automatiquement à 14h",
  },
  {
    q: 'Pour quels jours puis-je publier ?',
    a: "Pour aujourd'hui (jusqu'à 14h) et les jours suivants jusqu'au vendredi. À partir du vendredi 14h et le week-end, vous préparez la semaine suivante. Vous pouvez modifier ou retirer un plat jusqu'à 14h le jour concerné",
  },
  {
    q: 'Mon établissement est fermé certains jours le midi ?',
    a: "Indiquez vos jours d'ouverture dans « Mon établissement » (modifiable à tout moment). Les jours fermés, vous n'avez rien à saisir et vous ne recevez pas de rappel",
  },
  {
    q: 'Quelle est la différence entre les formules ?',
    a: `${PLANS.plat.name} : un plat par jour. ${PLANS.menu.name} : vos suggestions du jour (entrée, plat, dessert, formule). ${PLANS.ia.name} : comme la formule Menu, mais vous prenez votre ardoise en photo et l'IA remplit les lignes, que vous pouvez corriger avant de publier`,
  },
  {
    q: 'Puis-je changer de formule ?',
    a: 'Oui, à tout moment depuis votre espace',
  },
  {
    q: 'Plusieurs personnes peuvent-elles publier ?',
    a: "Oui. Le propriétaire du compte ajoute les numéros de portable de son équipe : chaque membre reçoit un SMS d'invitation avec un lien, choisit son mot de passe, puis se connecte avec son propre portable pour publier les plats et modifier les jours d'ouverture. L'abonnement, les factures et l'équipe restent réservés au propriétaire",
  },
  {
    q: 'Comment me connecter ?',
    a: "Avec votre numéro de portable et le mot de passe à 4 chiffres choisi à l'inscription. Mot de passe oublié ? Un code vous est envoyé par SMS pour en choisir un nouveau",
  },
  {
    q: 'Vais-je recevoir des SMS ?',
    a: "Un seul rappel par semaine, le 1er jour d'ouverture à 10h30, et uniquement si votre plat du jour n'est pas encore publié. Les autres informations (factures, fin des mois offerts…) vous sont envoyées par e-mail",
  },
];

export default function ProFaq() {
  // Connecté : pas d'incitation à créer un compte
  const loggedIn = proStore.hasActiveSpace(useProDb());

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header subtitle="Espace pro" />

      <main className={`${pageMain} pb-10`}>

        <section className="px-4 pt-6">
          <h1 className="text-xl font-bold text-foreground">Questions fréquentes</h1>
          <div className="mt-4 divide-y divide-border rounded-md border border-border">
            {faq.map(({ q, a }) => (
              <details key={q} className="group px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-subtle transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {!loggedIn && (
          <section className="px-4 pt-6">
            <Link to="/pro/connexion" search={{ mode: 'signup' }} className={`${primaryButton} no-underline`}>
              Créer mon compte, c'est gratuit
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
