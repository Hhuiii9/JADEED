"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sprout, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { name, email, phone, password, confirmPassword } = formData;

    // Client-side validations
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid phone number (7-15 digits)");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong during signup");
      }

      // Success -> redirect to login
      router.push("/login?signup_success=true");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#edf6f0] via-brand-bg to-[#f4faf6] p-4 md:p-8">
      <div className="w-full max-w-lg">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary/10 p-3.5 rounded-2xl mb-4 border border-primary/5">
            <Sprout className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
            Create Business Account
          </h1>
          <p className="text-brand-muted text-sm mt-2 font-medium">
            Register your JADEED Coconut Oil management portal
          </p>
        </div>

        {/* Card Body */}
        <div className="glassmorphism rounded-3xl p-6 md:p-10 shadow-premium-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200/50 p-4 rounded-xl text-sm text-red-600 font-semibold">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                Business / User Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Jadeed Distributors"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. business@domain.com"
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl cursor-pointer shadow-premium text-sm tracking-wide transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-brand-muted mt-6 font-semibold">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline hover:text-primary-dark ml-1">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}
