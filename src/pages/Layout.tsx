import { Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import DemoPanel from '@/components/DemoPanel';
import Footer from '@/components/Footer';
import { DEMO_MODE } from '@/lib/demo';

export default function Layout() {
  // Chaque nouvelle page s'ouvre en haut
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Outlet />
      <Footer />
      {DEMO_MODE && <DemoPanel />}
    </div>
  );
}
