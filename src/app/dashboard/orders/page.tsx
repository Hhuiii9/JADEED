"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Plus,
  Filter,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ShoppingBag,
  TrendingUp,
  User as UserIcon
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Order {
  id: string;
  customer_id: string;
  product_type: string;
  quantity: number;
  bags_count: number;
  price: number;
  payment_status: string;
  order_date: string;
  created_at: string;
  customer: {
    name: string;
    phone: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    customer_id: "",
    product_type: "COCONUT",
    quantity: "",
    bags_count: "0",
    price: "",
    payment_status: "PENDING",
    order_date: new Date().toISOString().split("T")[0],
  });

  // Fetch Orders
  const fetchOrders = async () => {
    setIsLoading(true);
    setError("");
    try {
      let url = "/api/orders";
      if (selectedCustomerId) {
        url += `?customerId=${selectedCustomerId}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load orders");
      }
      const data: Order[] = await response.json();
      
      // Perform local filtering for product type and status to avoid multiple round-trips
      let filtered = data;
      if (selectedProductType) {
        filtered = filtered.filter((o) => o.product_type === selectedProductType);
      }
      if (selectedPaymentStatus) {
        filtered = filtered.filter((o) => o.payment_status === selectedPaymentStatus);
      }

      setOrders(filtered);
    } catch (err: any) {
      console.error(err);
      setError("Unable to retrieve orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Customers for select options
  const fetchCustomersList = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Failed to load customer list for select options:", err);
    }
  };

  useEffect(() => {
    fetchCustomersList();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [selectedCustomerId, selectedProductType, selectedPaymentStatus]);

  // Handle Add Order Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);

    const { customer_id, product_type, quantity, bags_count, price, payment_status, order_date } = formData;

    // Validation
    if (!customer_id) {
      setModalError("Please select a customer");
      setModalLoading(false);
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setModalError("Quantity must be a number greater than 0");
      setModalLoading(false);
      return;
    }

    const bags = parseInt(bags_count, 10);
    if (isNaN(bags) || bags < 0) {
      setModalError("Bags count must be a valid non-negative number");
      setModalLoading(false);
      return;
    }

    const prc = parseFloat(price);
    if (isNaN(prc) || prc < 0) {
      setModalError("Price must be a valid non-negative number");
      setModalLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id,
          product_type,
          quantity: qty,
          bags_count: bags,
          price: prc,
          payment_status,
          order_date: order_date ? new Date(order_date).toISOString() : new Date().toISOString(),
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to create order");
      }

      // Reset & Refresh
      setIsAddModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      setModalError(err.message || "An error occurred while creating order.");
    } finally {
      setModalLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCustomerId("");
    setSelectedProductType("");
    setSelectedPaymentStatus("");
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-text tracking-tight">
            Sales & Orders
          </h2>
          <p className="text-sm text-brand-muted mt-1 font-medium">
            Monitor sales transactions for coconut, coconut oil and copra orders
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddModalOpen(true);
            setModalError("");
            setFormData({
              customer_id: customers[0]?.id || "",
              product_type: "COCONUT",
              quantity: "",
              bags_count: "0",
              price: "",
              payment_status: "PENDING",
              order_date: new Date().toISOString().split("T")[0],
            });
          }}
          className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-premium transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Create Order
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 md:p-6 rounded-3xl border border-brand-border/60 shadow-premium flex flex-wrap items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-brand-muted uppercase tracking-wider shrink-0 mr-2">
          <Filter className="h-4.5 w-4.5 text-brand-muted" />
          <span>Filters:</span>
        </div>

        {/* Customer Select */}
        <div className="flex-grow sm:flex-grow-0 sm:min-w-[180px]">
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-brand-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Type Select */}
        <div className="w-full sm:w-auto sm:min-w-[140px]">
          <select
            value={selectedProductType}
            onChange={(e) => setSelectedProductType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-brand-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">All Products</option>
            <option value="COCONUT">Coconut</option>
            <option value="COCONUT_OIL">Coconut Oil</option>
            <option value="COPRA">Copra</option>
          </select>
        </div>

        {/* Payment Status Select */}
        <div className="w-full sm:w-auto sm:min-w-[140px]">
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-brand-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="">All Payments</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(selectedCustomerId || selectedProductType || selectedPaymentStatus) && (
          <button
            onClick={clearFilters}
            className="px-3.5 py-2 text-primary hover:text-primary-dark font-extrabold uppercase hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading Skeleton / Error / Empty States */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-brand-border/60 shadow-premium p-6 space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-brand-border/60 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-sm font-semibold text-brand-text">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand-border/60 shadow-sm text-center">
          <Receipt className="h-12 w-12 text-brand-muted/30 mb-3" />
          <h3 className="font-bold text-base text-brand-text">No Orders Found</h3>
          <p className="text-sm text-brand-muted mt-1 px-4 max-w-md">
            {selectedCustomerId || selectedProductType || selectedPaymentStatus
              ? "We couldn't find any orders matching these filters. Try modifying your filter options."
              : "Register your very first order to start tracking quantities, bags, and sales."}
          </p>
          {!selectedCustomerId && !selectedProductType && !selectedPaymentStatus && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer shadow-premium"
            >
              Create Order
            </button>
          )}
        </div>
      ) : (
        /* Orders Listing Table (Responsive) */
        <div className="bg-white rounded-3xl border border-brand-border/60 shadow-premium overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-brand-bg/80 border-b border-brand-border/60 font-extrabold text-brand-muted uppercase tracking-wide">
                  <th className="p-4 md:p-5">Customer</th>
                  <th className="p-4 md:p-5">Product</th>
                  <th className="p-4 md:p-5">Quantity</th>
                  <th className="p-4 md:p-5">Bags</th>
                  <th className="p-4 md:p-5">Price</th>
                  <th className="p-4 md:p-5">Date</th>
                  <th className="p-4 md:p-5">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 font-medium text-brand-text">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-bg/20 transition-colors">
                    <td className="p-4 md:p-5">
                      <div className="flex items-center gap-2">
                        <div className="bg-emerald-50 text-primary h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] uppercase">
                          {order.customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-brand-text">{order.customer.name}</p>
                          <p className="text-[10px] text-brand-muted leading-tight font-semibold mt-0.5">
                            {order.customer.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-extrabold tracking-wide uppercase text-[10px]">
                        {order.product_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 md:p-5">
                      {order.quantity} {order.product_type === "COCONUT_OIL" ? "Liters" : "Units"}
                    </td>
                    <td className="p-4 md:p-5 flex items-center gap-1 mt-3.5">
                      <ShoppingBag className="h-3.5 w-3.5 text-brand-muted shrink-0" />
                      <span>{order.bags_count} Bags</span>
                    </td>
                    <td className="p-4 md:p-5 font-bold text-sm">
                      ₹{order.price.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 md:p-5 text-[10px] text-brand-muted font-bold">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-brand-muted/75" />
                        {new Date(order.order_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="p-4 md:p-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CREATE ORDER MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-brand-border/60 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-brand-text">Create Sales Order</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleAddSubmit} className="flex-grow overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {modalError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200/50 p-4 rounded-xl text-sm text-red-600 font-semibold">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Customer Select */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                {customers.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl text-xs text-amber-800 font-semibold">
                    You must register a customer first before placing an order. Go to the{" "}
                    <Link href="/dashboard/customers" className="underline font-bold text-primary">
                      Customers Page
                    </Link>{" "}
                    to add one.
                  </div>
                ) : (
                  <select
                    required
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors cursor-pointer"
                  >
                    <option value="" disabled>-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Product and Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors cursor-pointer"
                  >
                    <option value="COCONUT">Coconut</option>
                    <option value="COCONUT_OIL">Coconut Oil</option>
                    <option value="COPRA">Copra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder={formData.product_type === "COCONUT_OIL" ? "Liters (e.g. 50)" : "Units (e.g. 500)"}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Bags and Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Bags Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.bags_count}
                    onChange={(e) => setFormData({ ...formData, bags_count: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Total Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 7500"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Date and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Order Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.order_date}
                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Payment Status
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-bg font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || customers.length === 0}
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-premium transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
