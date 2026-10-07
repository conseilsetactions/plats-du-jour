// Cadres de page communs. Téléphone : colonne de 448px. Ordinateur (lg, ≥ 1024px) : carte centrée plus large.

/** Pages de contenu (espace pro, aide, pages légales…). */
export const pageMain =
  'mx-auto w-full max-w-md flex-1 bg-card lg:my-8 lg:max-w-3xl lg:flex-none lg:overflow-hidden lg:rounded-xl lg:border lg:border-border';

/** Pages courtes (connexion, invitation) : carte étroite sur ordinateur. */
export const narrowMain =
  'mx-auto w-full max-w-md flex-1 bg-card lg:my-8 lg:max-w-lg lg:flex-none lg:overflow-hidden lg:rounded-xl lg:border lg:border-border';

/** Landing pages : pleine largeur sur ordinateur (chaque section centre son contenu avec `landingSection`). */
export const landingMain = 'mx-auto w-full max-w-md flex-1 bg-card lg:max-w-none';

/** Marges latérales d'une section de landing : contenu centré sur 60rem, fond pleine largeur. */
export const landingSection = 'lg:px-[max(2rem,calc((100%_-_60rem)/2))]';
