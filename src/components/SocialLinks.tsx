import type { ReactNode } from 'react';

/**
 * Pages Plats du Jour sur les réseaux sociaux.
 * À COMPLÉTER : coller l'adresse de chaque page une fois les comptes créés (vide = icône sans lien).
 */
const SOCIAL = [
  { name: 'Facebook', url: '', icon: <FacebookIcon /> },
  { name: 'Instagram', url: '', icon: <InstagramIcon /> },
  { name: 'LinkedIn', url: '', icon: <LinkedinIcon /> },
];

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function FacebookIcon() {
  return (
    <Svg>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />
    </Svg>
  );
}

function InstagramIcon() {
  return (
    <Svg>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </Svg>
  );
}

function LinkedinIcon() {
  return (
    <Svg>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V17M8 7.5v.01M12 17v-6.5M12 13.5c0-1.7 1-3 2.5-3S17 11.5 17 13v4" />
    </Svg>
  );
}

/** Encart « Retrouvez-nous sur Facebook, Instagram et LinkedIn ». */
export default function SocialLinks() {
  const iconClass =
    'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-accent transition-colors';
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-muted-foreground">Retrouvez-nous sur Facebook, Instagram et LinkedIn</p>
      <div className="flex gap-2">
        {SOCIAL.map(({ name, url, icon }) =>
          url ? (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Plats du Jour sur ${name}`}
              className={`${iconClass} hover:border-accent hover:bg-accent-soft`}
            >
              {icon}
            </a>
          ) : (
            <span key={name} title={`${name} : lien à venir`} aria-label={`${name} (lien à venir)`} className={iconClass}>
              {icon}
            </span>
          )
        )}
      </div>
    </div>
  );
}
