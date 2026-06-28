"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sprout, AlertCircle, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("signup_success") === "true") {
      setSuccess("Account created successfully! Please log in below.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { email, password } = formData;

    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Success -> Redirect to dashboard
      const redirectTo = searchParams.get("from") || "/dashboard";
      router.replace(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo Header */}
      <div className="text-center mb-8">
        <div className="inline-flex bg-primary/10 p-3.5 rounded-2xl mb-4 border border-primary/5">
          <Sprout className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
          Welcome Back
        </h1>
        <p className="text-brand-muted text-sm mt-2 font-medium">
          Log in to manage JADEED Coconut Oil operations
        </p>
      </div>

      {/* Card Body */}
      <div className="glassmorphism rounded-3xl p-6 md:p-10 shadow-premium-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200/50 p-4 rounded-xl text-sm text-emerald-700 font-semibold">
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200/50 p-4 rounded-xl text-sm text-red-600 font-semibold">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@domain.com"
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl cursor-pointer shadow-premium text-sm tracking-wide transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-brand-muted mt-6 font-semibold">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline hover:text-primary-dark ml-1">
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#edf6f0] via-brand-bg to-[#f4faf6] p-4 md:p-8">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
