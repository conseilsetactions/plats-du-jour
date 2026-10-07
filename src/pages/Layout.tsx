import { Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import DemoPanel from '@/components/DemoPanel';
import Footer from '@/components/Footer';

export default function Layout() {
  // Chaque nouvelle page s'ouvre en haut
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Outlet />
      <Footer />
      {import.meta.env.DEV && <DemoPanel />}
    </div>
  );
}
