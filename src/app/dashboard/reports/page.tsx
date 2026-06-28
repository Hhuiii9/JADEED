"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Users,
  AlertCircle,
  Calendar,
  Loader2,
  PieChart,
  ChevronRight
} from "lucide-react";

interface ProductBreakdown {
  type: string;
  sales: number;
  quantity: number;
  bags: number;
}

interface TrendDay {
  date: string;
  amount: number;
  bags: number;
}

interface ReportsData {
  dailySales: number;
  weeklySales: number;
  monthlySales: number;
  customerCount: number;
  totalCustomerBags: number;
  totalOrderBags: number;
  pendingPayments: number;
  productsBreakdown: ProductBreakdown[];
  trend: TrendDay[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/reports");
      if (!response.ok) {
        throw new Error("Failed to load business reports data");
      }
      const reportData = await response.json();
      setData(reportData);
    } catch (err: any) {
      console.error(err);
      setError("Unable to retrieve report analytics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-brand-border/60 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="font-bold text-lg text-brand-text">Unable to Load Reports</h3>
        <p className="text-sm text-brand-muted mt-1">{error}</p>
        <button
          onClick={fetchReports}
          className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate highest sales day in trend for graph scale
  const maxAmount = Math.max(...data.trend.map((d) => d.amount), 5000);

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-text tracking-tight">
            Business Reports
          </h2>
          <p className="text-sm text-brand-muted mt-1 font-medium flex items-center gap-1">
            <BarChart3 className="h-4 w-4 text-primary" />
            Comprehensive sales performance and resource reports
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="hidden sm:block px-4 py-2 bg-white border border-brand-border/60 text-brand-text hover:bg-brand-bg rounded-xl font-semibold text-xs transition-colors shadow-sm cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {/* Sales Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-brand-border/60 shadow-premium">
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Today&apos;s Sales</span>
          <p className="text-3xl font-extrabold text-primary mt-1">
            ₹{data.dailySales.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-brand-muted mt-1.5 font-semibold">Since midnight today</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border/60 shadow-premium">
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Weekly Sales (7d)</span>
          <p className="text-3xl font-extrabold text-primary mt-1">
            ₹{data.weeklySales.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-brand-muted mt-1.5 font-semibold">Sales over the last 7 days</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-border/60 shadow-premium">
          <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Monthly Sales (30d)</span>
          <p className="text-3xl font-extrabold text-primary mt-1">
            ₹{data.monthlySales.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-brand-muted mt-1.5 font-semibold">Sales over the last 30 days</p>
        </div>
      </div>

      {/* Business Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-brand-border/60 shadow-premium flex items-center gap-4">
          <div className="bg-emerald-50 text-primary p-3 rounded-2xl border border-emerald-100">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
              Total Customers
            </span>
            <span className="text-xl font-extrabold text-brand-text">{data.customerCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/60 shadow-premium flex items-center gap-4">
          <div className="bg-emerald-50 text-primary p-3 rounded-2xl border border-emerald-100">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
              Customer Bags
            </span>
            <span className="text-xl font-extrabold text-brand-text">{data.totalCustomerBags} Bags</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/60 shadow-premium flex items-center gap-4">
          <div className="bg-emerald-50 text-primary p-3 rounded-2xl border border-emerald-100">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
              Sold Bags (All time)
            </span>
            <span className="text-xl font-extrabold text-brand-text">{data.totalOrderBags} Bags</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/60 shadow-premium flex items-center gap-4">
          <div className={`${data.pendingPayments > 0 ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-emerald-50 border-emerald-100 text-primary"} p-3 rounded-2xl border`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">
              Pending Payments
            </span>
            <span className={`text-xl font-extrabold ${data.pendingPayments > 0 ? "text-amber-600" : "text-brand-text"}`}>
              ₹{data.pendingPayments.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Graphs & Product breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart (7 days) */}
        <div className="bg-white rounded-3xl border border-brand-border/60 shadow-premium p-6 md:p-8 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between border-b border-brand-border/50 pb-4 mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-brand-text flex items-center gap-1.5">
                <TrendingUp className="h-5 w-5 text-primary" />
                7-Day Sales Trend
              </h3>
              <p className="text-xs text-brand-muted font-medium">Daily transaction volumes in Rupees</p>
            </div>
          </div>

          {/* Simple Custom SVG Responsive Graph */}
          <div className="flex-grow flex items-end h-64 relative pt-4 pb-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-bold text-brand-muted/70 pl-2">
              <div className="border-b border-brand-border/30 w-full pb-1 flex justify-between">
                <span>₹{maxAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-b border-brand-border/30 w-full pb-1 flex justify-between">
                <span>₹{(maxAmount / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="border-b border-brand-border/20 w-full pb-1 flex justify-between">
                <span>₹0</span>
              </div>
            </div>

            {/* Bars container */}
            <div className="relative w-full h-full flex justify-around items-end pt-8 z-10 px-8">
              {data.trend.map((day) => {
                // Calculate height as percentage
                const heightPercent = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                return (
                  <div key={day.date} className="flex flex-col items-center group w-12">
                    {/* Tooltip */}
                    <div className="absolute bottom-[80%] opacity-0 group-hover:opacity-100 bg-brand-text text-white text-[9px] font-bold py-1 px-2.5 rounded-lg transition-all duration-200 pointer-events-none shadow-md z-20">
                      ₹{day.amount.toLocaleString()}
                    </div>
                    {/* Graph bar */}
                    <div
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      className={`w-6 rounded-t-lg transition-all duration-300 shadow-sm ${
                        day.amount > 0 ? "bg-primary group-hover:bg-primary-dark" : "bg-emerald-50"
                      }`}
                    ></div>
                    {/* Date label */}
                    <span className="text-[9px] font-bold text-brand-muted mt-2 tracking-tighter">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Breakdown Summary */}
        <div className="bg-white rounded-3xl border border-brand-border/60 shadow-premium p-6 md:p-8 flex flex-col justify-between">
          <div className="border-b border-brand-border/50 pb-4 mb-4">
            <h3 className="font-extrabold text-lg text-brand-text flex items-center gap-1.5">
              <PieChart className="h-5 w-5 text-primary" />
              Product Share
            </h3>
            <p className="text-xs text-brand-muted font-medium">Sales contribution by product categories</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-6 py-4">
            {data.productsBreakdown.length === 0 ? (
              <p className="text-xs text-brand-muted/50 italic font-semibold text-center">
                No product transactions recorded yet.
              </p>
            ) : (
              data.productsBreakdown.map((prod) => {
                const totalSales = data.weeklySales || data.monthlySales || data.dailySales || 1;
                const percentage = Math.round((prod.sales / (totalSales || 1)) * 100);
                
                return (
                  <div key={prod.type} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-brand-text">
                      <span className="uppercase tracking-tight">{prod.type.replace("_", " ")}</span>
                      <span>₹{prod.sales.toLocaleString("en-IN")}</span>
                    </div>
                    
                    {/* Progress Bar wrapper */}
                    <div className="h-3 w-full bg-brand-bg border border-brand-border/60 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                        className={`h-full rounded-full ${
                          prod.type === "COCONUT_OIL"
                            ? "bg-primary"
                            : prod.type === "COCONUT"
                            ? "bg-secondary"
                            : "bg-amber-600"
                        }`}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-brand-muted font-semibold">
                      <span>{prod.quantity} Units Sold</span>
                      <span>{prod.bags} Bags</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-brand-border/40 pt-4 mt-4">
            <p className="text-[10px] text-brand-muted font-semibold leading-relaxed">
              * Share calculations are based on total historical sales recorded under this profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
