"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingBag,
  AlertCircle,
  Receipt,
  ArrowRight,
  TrendingUp,
  Plus,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";

interface SummaryData {
  totalCustomers: number;
  totalBags: number;
  totalPendingPayments: number;
  totalOrders: number;
  recentCustomers: Array<{
    id: string;
    name: string;
    phone: string;
    bags_count: number;
    payment_status: string;
    created_at: string;
  }>;
  recentOrders: Array<{
    id: string;
    customer_id: string;
    product_type: string;
    quantity: number;
    bags_count: number;
    price: number;
    payment_status: string;
    order_date: string;
    customer: {
      name: string;
    };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch("/api/dashboard/summary");
        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }
        const summary = await response.json();
        setData(summary);
      } catch (err: any) {
        console.error(err);
        setError("Error loading metrics. Please reload.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
        
        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>

        {/* Lists Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
          <div className="h-96 bg-gray-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-red-100 shadow-sm text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="font-bold text-lg text-brand-text">Unable to Load Dashboard</h3>
        <p className="text-sm text-brand-muted mt-1">{error || "Something went wrong."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Customers",
      value: data.totalCustomers,
      icon: Users,
      color: "bg-emerald-500",
      description: "Registered business accounts",
      link: "/dashboard/customers"
    },
    {
      title: "Active Bags",
      value: data.totalBags,
      icon: ShoppingBag,
      color: "bg-primary",
      description: "Coconuts bags allocated",
      link: "/dashboard/customers"
    },
    {
      title: "Pending Payments",
      value: `₹${data.totalPendingPayments.toLocaleString("en-IN")}`,
      icon: AlertCircle,
      color: data.totalPendingPayments > 0 ? "bg-amber-500" : "bg-emerald-500",
      description: "Unpaid order receivables",
      link: "/dashboard/orders"
    },
    {
      title: "Total Orders",
      value: data.totalOrders,
      icon: Receipt,
      color: "bg-secondary",
      description: "Sales transactions processed",
      link: "/dashboard/orders"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-text tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-brand-muted mt-1 font-medium flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            Real-time status of JADEED Coconut Oil business
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/customers"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-text hover:bg-brand-bg font-semibold text-sm shadow-sm transition-all"
          >
            Manage Customers
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-premium transition-all"
          >
            <Plus className="h-4 w-4" />
            New Order
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Link
            href={kpi.link}
            key={kpi.title}
            className="block group bg-white rounded-3xl p-6 border border-brand-border/60 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                  {kpi.title}
                </span>
                <p className="text-2xl font-extrabold text-brand-text group-hover:text-primary transition-colors">
                  {kpi.value}
                </p>
              </div>
              <div className={`${kpi.color} p-3 rounded-2xl text-white shadow-md shadow-black/5`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-border/40 flex items-center justify-between text-xs">
              <span className="text-brand-muted font-medium">{kpi.description}</span>
              <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                View
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Customers Card */}
        <div className="bg-white rounded-3xl border border-brand-border/60 shadow-premium p-6 md:p-8 flex flex-col h-[460px]">
          <div className="flex items-center justify-between border-b border-brand-border/50 pb-4 mb-4">
            <div>
              <h3 className="font-extrabold text-lg text-brand-text">Recent Customers</h3>
              <p className="text-xs text-brand-muted font-medium">Newly added business accounts</p>
            </div>
            <Link
              href="/dashboard/customers"
              className="text-xs font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-0.5"
            >
              See all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {data.recentCustomers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <Users className="h-10 w-10 text-brand-muted/40 mb-2" />
                <p className="text-sm font-semibold text-brand-muted">No customers registered yet</p>
                <Link
                  href="/dashboard/customers"
                  className="text-xs text-primary font-bold hover:underline mt-1"
                >
                  Create one now
                </Link>
              </div>
            ) : (
              data.recentCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-brand-bg border border-transparent hover:border-brand-border/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-primary h-10 w-10 rounded-full flex items-center justify-center font-bold uppercase border border-emerald-100">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-text truncate max-w-[150px] sm:max-w-xs">
                        {customer.name}
                      </p>
                      <p className="text-xs text-brand-muted font-medium">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {customer.bags_count} Bags
                    </span>
                    <p className="text-[10px] text-brand-muted font-medium mt-1">
                      {new Date(customer.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Card */}
        <div className="bg-white rounded-3xl border border-brand-border/60 shadow-premium p-6 md:p-8 flex flex-col h-[460px]">
          <div className="flex items-center justify-between border-b border-brand-border/50 pb-4 mb-4">
            <div>
              <h3 className="font-extrabold text-lg text-brand-text">Recent Orders</h3>
              <p className="text-xs text-brand-muted font-medium">Latest sales transactions</p>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-0.5"
            >
              See all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {data.recentOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <Receipt className="h-10 w-10 text-brand-muted/40 mb-2" />
                <p className="text-sm font-semibold text-brand-muted">No orders placed yet</p>
                <Link
                  href="/dashboard/orders"
                  className="text-xs text-primary font-bold hover:underline mt-1"
                >
                  Create first order
                </Link>
              </div>
            ) : (
              data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-brand-bg border border-transparent hover:border-brand-border/40 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-text truncate">
                      {order.customer.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
                        {order.product_type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-brand-muted font-semibold flex items-center gap-0.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {new Date(order.order_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-right ml-4 shrink-0">
                    <span className="text-sm font-extrabold text-brand-text block">
                      ₹{order.price.toLocaleString("en-IN")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                        order.payment_status === "PAID"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.payment_status === "PAID" ? (
                        <CheckCircle2 className="h-2.5 w-2.5" />
                      ) : (
                        <Clock className="h-2.5 w-2.5" />
                      )}
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
