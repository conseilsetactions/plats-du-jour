// Lecture d'un menu à partir d'une photo (formule Menu + IA).
//
// DÉMO : la lecture est SIMULÉE. Pour la vraie version, la photo sera envoyée à un
// service serveur (la clé d'API ne doit jamais être dans l'app) qui demandera à un
// modèle d'IA avec vision (ex. Claude) d'en extraire les lignes catégorie / nom / prix.
import type { DayItem } from '@/lib/proStore';

const SAMPLE_MENUS: DayItem[][] = [
  [
    { category: 'Entrée', name: 'Salade de chèvre chaud', price: 7 },
    { category: 'Plat', name: 'Daube provençale', price: 13.5 },
    { category: 'Dessert', name: 'Tarte au citron', price: 5 },
    { category: 'Formule', name: 'Entrée + plat + dessert', price: 21 },
  ],
  [
    { category: 'Entrée', name: 'Soupe de poissons', price: 8 },
    { category: 'Plat', name: 'Pieds paquets', price: 14 },
    { category: 'Dessert', name: 'Navettes et café', price: 4.5 },
  ],
  [
    { category: 'Plat', name: 'Aïoli complet', price: 15 },
    { category: 'Dessert', name: 'Fiadone', price: 5.5 },
    { category: 'Formule', name: 'Plat + dessert', price: 18 },
  ],
];

export const scanMenuPhoto = async (photo: File): Promise<DayItem[]> => {
  void photo; // la vraie version enverra la photo au serveur
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return SAMPLE_MENUS[Math.floor(Math.random() * SAMPLE_MENUS.length)];
};
