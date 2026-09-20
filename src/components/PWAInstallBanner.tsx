import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, ShieldCheck, Smartphone, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Offline Status Badge */}
      {!isOnline && (
        <div className="mx-4 p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Device is currently offline — all bedtime functions running from local cache.</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {!isInstalled && deferredPrompt && (
        <div className="mx-4 p-3 rounded-2xl bg-gradient-to-r from-neutral-900 to-indigo-950 border border-indigo-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-xs font-bold text-white">Install Bedtime App</div>
              <div className="text-[10px] text-neutral-400">Install as native Android PWA (100% offline)</div>
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
        </div>
      )}
    </div>
  );
};
