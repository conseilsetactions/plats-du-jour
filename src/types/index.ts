export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Address {
  street: string;
  quartier: string;
  city: string;
  postalCode: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: Address;
  location: Location;
  phone?: string;
  website?: string;
  distance: number; // in meters
  rating?: number; // 0-5
  reviewCount?: number;
}

export interface Plat {
  id: string;
  name: string;
  description: string;
  price: number; // in euros
  category?: string; // Entrée, Plat, Dessert, Formule (formule Menu)
  restaurant: Restaurant;
  imageUrl?: string;
}

export interface PlatsResponse {
  plats: Plat[];
  count: number;
  timestamp: string;
}

export interface UserLocation {
  location: Location;
  consentGiven: boolean;
  timestamp: string;
}

export interface UserPreferences {
  priceFilter: 'all' | 'budget' | 'mid' | 'premium'; // <8€, 8-12€, >12€
  radius: number; // in meters
  favoritedRestaurants: string[];
  enableSMSReminders: boolean;
  phoneNumber?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}
