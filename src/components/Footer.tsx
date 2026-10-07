import { Link } from '@tanstack/react-router';
import SocialLinks from '@/components/SocialLinks';
import { LEGAL_LINKS } from '@/pages/legal/legalContent';

const linkClass = 'text-muted-foreground no-underline hover:text-accent';

/** Pied de page commun : réseaux sociaux, qui sommes-nous et documents juridiques. */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-md px-4 pt-6 lg:max-w-6xl">
        <SocialLinks />
      </div>
      <nav
        aria-label="Informations"
        className="mx-auto flex max-w-md flex-wrap justify-center gap-x-4 gap-y-2 px-4 pb-5 pt-4 text-xs lg:max-w-6xl"
      >
        <Link to="/qui-sommes-nous" className={linkClass}>
          Qui sommes-nous
        </Link>
        {LEGAL_LINKS.map(({ doc, label }) => (
          <Link key={doc} to="/legal/$doc" params={{ doc }} className={linkClass}>
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
