import { useSyncExternalStore } from 'react';

/** Vrai quand la requête média correspond (ex. '(min-width: 1024px)' pour l'ordinateur). */
export const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );

/** Écran d'ordinateur (même seuil que les classes `lg:` de Tailwind). */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
