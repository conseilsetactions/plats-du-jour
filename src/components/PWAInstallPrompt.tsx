import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export default function PWAInstallPrompt() {
  const { isInstallable, showInstallPrompt, dismissPrompt } = usePWAInstall();

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground mb-1">
            Installer Plats du Jour
          </h3>
          <p className="text-sm text-muted-foreground">
            Accédez rapidement à l'app depuis votre écran d'accueil
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => showInstallPrompt()}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Installer
          </button>

          <button
            onClick={dismissPrompt}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
