"use client";

import Link from "next/link";

interface MobileBottomNavProps {
  currentPath: string;
  onAddCustomerClick: () => void;
}

export default function MobileBottomNav({
  currentPath,
  onAddCustomerClick,
}: MobileBottomNavProps) {
  const isTabActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-brand-border/60 shadow-lg justify-around items-center px-2 z-20 pb-safe">
      {/* 1. Dashboard Tab */}
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] transition-colors select-none ${
          isTabActive("/dashboard") ? "text-brand-primary font-semibold" : "text-brand-text/60"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-0.5"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="text-[10px]">Dashboard</span>
      </Link>

      {/* 2. Customers Tab */}
      <Link
        href="/dashboard/customers"
        className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] transition-colors select-none ${
          isTabActive("/dashboard/customers") ? "text-brand-primary font-semibold" : "text-brand-text/60"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-0.5"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="text-[10px]">Customers</span>
      </Link>

      {/* 3. Add Customer Middle Action (Floating style) */}
      <button
        onClick={onAddCustomerClick}
        className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] relative -top-3 select-none"
      >
        <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md active:scale-90 active:bg-brand-primary/95 transition-all">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </div>
        <span className="text-[10px] text-brand-text/60 mt-1">Add Client</span>
      </button>

      {/* 4. Reports Tab */}
      <Link
        href="/dashboard/reports"
        className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] transition-colors select-none ${
          isTabActive("/dashboard/reports") ? "text-brand-primary font-semibold" : "text-brand-text/60"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-0.5"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span className="text-[10px]">Reports</span>
      </Link>

      {/* 5. Profile Tab */}
      <Link
        href="/dashboard/profile"
        className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] transition-colors select-none ${
          isTabActive("/dashboard/profile") ? "text-brand-primary font-semibold" : "text-brand-text/60"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
        </svg>
        <span className="text-[10px]">Profile</span>
      </Link>
    </nav>
  );
}
