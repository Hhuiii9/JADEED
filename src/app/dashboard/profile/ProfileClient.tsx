"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    phone: string;
    created_at: string;
  };
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formattedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24 md:pb-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Profile Settings</h1>
        <p className="text-brand-text/75 text-sm">Manage your account credentials and mobile settings.</p>
      </div>

      {/* Profile Detail Card */}
      <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-2xl select-none shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-dark leading-tight">{user.name}</h2>
            <p className="text-xs text-brand-text/60">Registered since {formattedDate}</p>
          </div>
        </div>

        <div className="border-t border-brand-border/50 pt-4 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-text/60 font-medium">Business Email</span>
            <span className="text-brand-dark font-semibold">{user.email}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-text/60 font-medium">Phone Number</span>
            <span className="text-brand-dark font-semibold">{user.phone}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-text/60 font-medium">System Role</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-accent/20 text-brand-dark">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* PWA / Install Application Card */}
      <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 space-y-4">
        <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
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
            className="text-brand-primary"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          PWA Installation Guide
        </h3>
        <p className="text-xs text-brand-text/75 leading-relaxed">
          Install **JADEED Coconut Oil** on your mobile device to run it full-screen, access offline fallbacks, and get quick launcher access.
        </p>

        <div className="space-y-3 pt-2 text-xs">
          {/* iOS Safari instructions */}
          <div className="p-3 bg-brand-bg rounded-2xl border border-brand-border/40">
            <h4 className="font-bold text-brand-dark flex items-center gap-1.5 mb-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              iPhone / iOS (Safari)
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-brand-text/80">
              <li>Tap the **Share** button <span className="font-semibold text-blue-600">⎙</span> at the bottom of Safari.</li>
              <li>Scroll down and select **"Add to Home Screen"**.</li>
              <li>Tap **Add** in the top right to finish installation.</li>
            </ol>
          </div>

          {/* Android instructions */}
          <div className="p-3 bg-brand-bg rounded-2xl border border-brand-border/40">
            <h4 className="font-bold text-brand-dark flex items-center gap-1.5 mb-1 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
              Android / Chrome
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-brand-text/80">
              <li>Tap the menu button <span className="font-semibold text-brand-dark">⋮</span> in the top-right corner.</li>
              <li>Select **"Install App"** or **"Add to Home screen"**.</li>
              <li>Confirm the prompt to install the icon.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Log Out Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full h-12 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-2xl transition border border-red-200/60 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 select-none"
      >
        {isLoggingOut ? (
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out Account
          </>
        )}
      </button>
    </div>
  );
}
