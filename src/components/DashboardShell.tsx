"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MobileBottomNav from "./MobileBottomNav";
import {
  LayoutDashboard,
  Users,
  Receipt,
  BarChart3,
  LogOut,
  User as UserIcon,
  Sprout,
  Menu,
  X
} from "lucide-react";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "Orders", href: "/dashboard/orders", icon: Receipt },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      setIsLoggingOut(true);
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          router.replace("/login");
          router.refresh();
        } else {
          alert("Failed to logout. Please try again.");
          setIsLoggingOut(false);
        }
      } catch (err) {
        console.error("Logout error:", err);
        alert("An error occurred. Please try again.");
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-white border-r border-brand-border/20 shadow-premium">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl">
            <Sprout className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wider">JADEED</h1>
            <p className="text-xs text-accent/80 font-medium">Coconut Oil</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? "text-accent" : "text-white/60 group-hover:text-white/90"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile Card & Logout */}
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-white/15 h-9 w-9 rounded-full flex items-center justify-center text-white border border-white/10 font-bold uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{user.name}</p>
              <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-200 hover:text-white hover:bg-red-500/20 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 h-16 bg-white border-b border-brand-border/60 shadow-sm z-20">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="font-bold text-md text-primary tracking-wider uppercase">Jadeed</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center text-primary font-bold text-sm uppercase">
              {user.name.charAt(0)}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-brand-text hover:text-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Sidebar overlay menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/40 z-30 flex justify-end transition-opacity duration-300">
            <div className="w-64 bg-primary text-white h-full flex flex-col shadow-2xl p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sprout className="h-6 w-6 text-accent" />
                  <span className="font-bold text-lg tracking-wider">JADEED</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-white/80 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex-grow space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-5 w-5 text-accent" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-white/10 pt-4 mt-auto">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-white/50 truncate mb-4">{user.email}</p>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8faf9] relative z-10">
          <div className="max-w-7xl mx-auto px-4 py-6 md:p-8 pb-24 md:pb-8">
            {children}
          </div>
        </main>

        <MobileBottomNav
          currentPath={pathname}
          onAddCustomerClick={() => router.push("/dashboard/customers?add=true")}
        />
      </div>
    </div>
  );
}
