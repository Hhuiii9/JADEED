"use client";

import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg text-brand-text p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border/60 shadow-xl p-8 text-center glassmorphism animate-fade-in">
        {/* Wifi Off Icon */}
        <div className="mx-auto w-20 h-20 bg-brand-accent/10 text-brand-primary rounded-full flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-wifi-off"
          >
            <path d="M1 1l22 22" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5" />
            <path d="M5 12.5a10.94 10.94 0 0 1 5.83-2.84" />
            <path d="M8.58 6.36A16.54 16.54 0 0 1 12 6c4.07 0 7.87 1.49 10.82 4" />
            <path d="M1.18 10A16.5 16.5 0 0 1 5 7.6" />
            <path d="M12 18h.01" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-brand-dark mb-3">No Internet Connection</h1>
        <p className="text-brand-text/75 text-sm mb-8 leading-relaxed">
          JADEED Coconut Oil Customer Portal is currently offline. Please check your internet connection or Wi-Fi settings and try again.
        </p>

        {isOnline ? (
          <div className="mb-6 p-3 bg-brand-accent/15 text-brand-dark font-medium text-xs rounded-xl animate-pulse">
            Connection detected! You should be able to reload.
          </div>
        ) : null}

        <button
          onClick={handleReload}
          className="w-full h-12 bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold rounded-2xl transition shadow-md active:scale-95 flex items-center justify-center gap-2 select-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-refresh-cw"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          Reload Page
        </button>
      </div>
    </div>
  );
}
