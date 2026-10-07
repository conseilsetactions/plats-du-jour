import type { UserLocation, UserPreferences } from '@/types';

const STORAGE_KEYS = {
  USER_LOCATION: 'pdj:user-location',
  USER_PREFERENCES: 'pdj:user-preferences',
  GEOLOCATION_CONSENT: 'pdj:geolocation-consent',
  SMS_CONSENT: 'pdj:sms-consent',
};

export const storage = {
  // Location
  getUserLocation: (): UserLocation | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setUserLocation: (location: UserLocation) => {
    localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
  },

  clearUserLocation: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
  },

  // Geolocation Consent
  getGeolocationConsent: (): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GEOLOCATION_CONSENT);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  },

  setGeolocationConsent: (consented: boolean) => {
    localStorage.setItem(STORAGE_KEYS.GEOLOCATION_CONSENT, JSON.stringify(consented));
  },

  // SMS Consent
  getSMSConsent: (): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SMS_CONSENT);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  },

  setSMSConsent: (consented: boolean) => {
    localStorage.setItem(STORAGE_KEYS.SMS_CONSENT, JSON.stringify(consented));
  },

  // User Preferences
  getUserPreferences: (): UserPreferences => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return stored
        ? JSON.parse(stored)
        : {
            priceFilter: 'all',
            radius: 500,
            favoritedRestaurants: [],
            enableSMSReminders: false,
          };
    } catch {
      return {
        priceFilter: 'all',
        radius: 500,
        favoritedRestaurants: [],
        enableSMSReminders: false,
      };
    }
  },

  setUserPreferences: (prefs: UserPreferences) => {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs));
  },

  updateUserPreferences: (updates: Partial<UserPreferences>) => {
    const current = storage.getUserPreferences();
    storage.setUserPreferences({ ...current, ...updates });
  },
};
