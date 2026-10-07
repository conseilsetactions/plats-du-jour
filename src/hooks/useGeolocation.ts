import { useState, useCallback, useEffect } from 'react';
import type { Location, GeolocationError } from '@/types';
import { getDemoGps } from '@/lib/demoGps';
import { storage } from '@/utils/storage';

interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: GeolocationError | null;
  consentGiven: boolean;
  setConsentGiven: (consent: boolean) => void;
  requestLocation: () => void;
  setLocation: (location: Location) => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocationState] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [consentGiven, setConsentGivenState] = useState(false);

  // Load saved location and consent on mount
  useEffect(() => {
    const savedLocation = storage.getUserLocation();
    const savedConsent = storage.getGeolocationConsent();

    if (savedLocation) {
      setLocationState(savedLocation.location);
    }
    setConsentGivenState(savedConsent);
  }, []);

  const setConsentGiven = useCallback((consent: boolean) => {
    setConsentGivenState(consent);
    storage.setGeolocationConsent(consent);

    if (consent) {
      requestLocation();
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError({
        code: -1,
        message: 'Geolocation not supported',
      });
      return;
    }

    setLoading(true);
    setError(null);

    // Démo : position simulée choisie dans le module « Démo »
    const demo = getDemoGps();
    if (demo) {
      setLocationState(demo);
      storage.setUserLocation({ location: demo, consentGiven: true, timestamp: new Date().toISOString() });
      storage.setGeolocationConsent(true);
      setConsentGivenState(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation: Location = { latitude, longitude, accuracy };

        setLocationState(newLocation);
        storage.setUserLocation({
          location: newLocation,
          consentGiven: true,
          timestamp: new Date().toISOString(),
        });
        storage.setGeolocationConsent(true);
        setConsentGivenState(true);
        setLoading(false);
      },
      (err) => {
        setError({
          code: err.code,
          message: err.message,
        });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  const setLocation = useCallback((newLocation: Location) => {
    setLocationState(newLocation);
    storage.setUserLocation({
      location: newLocation,
      consentGiven: true,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return {
    location,
    loading,
    error,
    consentGiven,
    setConsentGiven,
    requestLocation,
    setLocation,
  };
};
