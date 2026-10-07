import { Link } from '@tanstack/react-router';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Page non trouvée</p>
          <Link
            to="/"
            className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors font-medium"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
