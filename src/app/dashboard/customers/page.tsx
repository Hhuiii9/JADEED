"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  X,
  Upload,
  User as UserIcon,
  Phone,
  MapPin,
  ShoppingBag,
  FileText,
  Loader2,
  CheckCircle,
  Calendar,
  IndianRupee,
  Clock
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  image_url: string | null;
  bags_count: number;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  address_deleted_at: string | null;
}

interface Order {
  id: string;
  product_type: string;
  quantity: number;
  bags_count: number;
  price: number;
  payment_status: string;
  order_date: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Form States
  const [formType, setFormType] = useState<"ADD" | "EDIT">("ADD");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    bags_count: "0",
    payment_status: "PENDING",
    notes: "",
    image_url: "",
  });

  // Fetch Customers
  const fetchCustomers = async (search = "") => {
    setIsLoading(true);
    setError("");
    try {
      const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : "/api/customers";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load customers list");
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to retrieve customers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("add") === "true") {
        setFormType("ADD");
        setFormData({
          name: "",
          phone: "",
          address: "",
          bags_count: "0",
          payment_status: "PENDING",
          notes: "",
          image_url: "",
        });
        setImageFile(null);
        setImagePreview(null);
        setFormError("");
        setIsFormModalOpen(true);

        // Remove ?add=true from browser history
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormType("ADD");
    setFormData({
      name: "",
      phone: "",
      address: "",
      bags_count: "0",
      payment_status: "PENDING",
      notes: "",
      image_url: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: Customer) => {
    setFormType("EDIT");
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || "",
      bags_count: customer.bags_count.toString(),
      payment_status: customer.payment_status,
      notes: customer.notes || "",
      image_url: customer.image_url || "",
    });
    setImageFile(null);
    setImagePreview(customer.image_url);
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Open Details Modal
  const handleOpenDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsModalOpen(true);
    setIsOrdersLoading(true);
    try {
      const response = await fetch(`/api/orders?customerId=${customer.id}`);
      if (response.ok) {
        const orders = await response.json();
        setCustomerOrders(orders);
      }
    } catch (err) {
      console.error("Error loading customer orders:", err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? All their associated orders will also be deleted.`)) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const resData = await response.json();
          throw new Error(resData.error || "Failed to delete customer");
        }
        setCustomers(customers.filter((c) => c.id !== id));
      } catch (err: any) {
        alert(err.message || "An error occurred while deleting.");
      }
    }
  };

  // Handle image selector
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size must be less than 5MB");
      return;
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setFormError("Only JPG, PNG, and WEBP image files are allowed");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  // Upload image to server
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    // Check if offline
    if (typeof window !== "undefined" && !navigator.onLine) {
      throw new Error("You are currently offline. Please connect to the internet to upload customer images.");
    }

    const uploadData = new FormData();
    uploadData.append("file", imageFile);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Image upload failed");
    }

    const data = await response.json();
    return data.url;
  };

  // Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const { name, phone, address, bags_count, payment_status, notes } = formData;

    // Validate fields
    if (!name.trim() || !phone.trim() || !address.trim() || !bags_count) {
      setFormError("Name, phone, address, and bags count are required");
      setFormLoading(false);
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{7,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      setFormError("Please enter a valid phone number (7-15 digits)");
      setFormLoading(false);
      return;
    }

    const bags = parseInt(bags_count, 10);
    if (isNaN(bags) || bags < 0) {
      setFormError("Number of bags must be a non-negative number");
      setFormLoading(false);
      return;
    }

    try {
      let uploadedUrl = formData.image_url;

      // Upload image if selected
      if (imageFile) {
        const resUrl = await uploadImage();
        if (resUrl) uploadedUrl = resUrl;
      }

      const payload = {
        name,
        phone,
        address,
        bags_count: bags,
        payment_status,
        notes,
        image_url: uploadedUrl,
      };

      let response;
      if (formType === "ADD") {
        response = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/customers/${selectedCustomer?.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || "Failed to save customer");
      }

      // Close modal and refresh list
      setIsFormModalOpen(false);
      fetchCustomers(searchQuery);
    } catch (err: any) {
      setFormError(err.message || "An error occurred. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-text tracking-tight">
            Customer Directory
          </h2>
          <p className="text-sm text-brand-muted mt-1 font-medium">
            Manage your client profiles, addresses, and bags assignments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-premium transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Add Customer
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3 bg-white border border-brand-border/60 rounded-2xl px-4 py-3 shadow-sm max-w-md focus-within:border-primary transition-all duration-200">
        <Search className="h-5 w-5 text-brand-muted shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name or phone..."
          className="w-full bg-transparent focus:outline-none text-sm text-brand-text placeholder-brand-muted/75"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-brand-muted hover:text-brand-text">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading Skeleton / Error / Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-3xl border border-brand-border/50"></div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-brand-border/60 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-sm font-semibold text-brand-text">{error}</p>
          <button
            onClick={() => fetchCustomers(searchQuery)}
            className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand-border/60 shadow-sm text-center">
          <UserIcon className="h-12 w-12 text-brand-muted/30 mb-3" />
          <h3 className="font-bold text-base text-brand-text">No Customers Found</h3>
          <p className="text-sm text-brand-muted mt-1 px-4 max-w-md">
            {searchQuery
              ? "We couldn't find any customers matching your search query. Try another keyword."
              : "Register your very first customer to start tracking orders and bags."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark cursor-pointer shadow-premium"
            >
              Add Customer
            </button>
          )}
        </div>
      ) : (
        /* Customers Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => {
            const isAddressDeleted = !customer.address && customer.address_deleted_at;
            return (
              <div
                key={customer.id}
                className="bg-white rounded-3xl border border-brand-border/60 hover:border-brand-border shadow-premium hover:shadow-premium-lg transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Upper Body */}
                <div className="p-6 flex-grow space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Customer Image */}
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary font-bold text-lg overflow-hidden uppercase relative">
                      {customer.image_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={customer.image_url}
                          alt={customer.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        customer.name.substring(0, 2)
                      )}
                    </div>
                    {/* Name & Phone */}
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-brand-text truncate leading-snug group-hover:text-primary transition-colors">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-brand-muted font-semibold flex items-center gap-1 mt-1">
                        <Phone className="h-3.5 w-3.5 text-brand-muted/75 shrink-0" />
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  {/* Bags & Payment Status Row */}
                  <div className="flex items-center gap-4 bg-brand-bg/60 p-3 rounded-2xl text-xs font-bold border border-brand-border/40">
                    <div className="flex items-center gap-1.5 flex-1 text-brand-text">
                      <ShoppingBag className="h-4 w-4 text-primary shrink-0" />
                      <span>{customer.bags_count} Bags</span>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] ${
                          customer.payment_status === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {customer.payment_status === "PAID" ? (
                          <CheckCircle className="h-2.5 w-2.5" />
                        ) : (
                          <Clock className="h-2.5 w-2.5" />
                        )}
                        {customer.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="text-xs space-y-1">
                    <span className="text-brand-muted font-bold block uppercase tracking-wider text-[9px]">
                      Address Details
                    </span>
                    {customer.address ? (
                      <p className="text-brand-text font-medium flex items-start gap-1 line-clamp-2">
                        <MapPin className="h-3.5 w-3.5 text-brand-muted/75 shrink-0 mt-0.5" />
                        <span>{customer.address}</span>
                      </p>
                    ) : isAddressDeleted ? (
                      <div className="flex items-start gap-1.5 text-red-600 bg-red-50/50 p-2.5 rounded-xl border border-red-100/50">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="font-semibold leading-relaxed">
                          Address cleared automatically under 90-day retention rule.
                        </p>
                      </div>
                    ) : (
                      <p className="text-brand-muted/50 italic font-medium">No address specified</p>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-6 py-4 bg-brand-bg/40 border-t border-brand-border/40 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-brand-muted font-bold flex items-center gap-0.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(customer.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenDetails(customer)}
                      className="p-2 text-brand-muted hover:text-primary hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(customer)}
                      className="p-2 text-brand-muted hover:text-primary hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                      title="Edit Customer"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                      className="p-2 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ADD / EDIT FORM MODAL --- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-brand-border/60 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-brand-text">
                {formType === "ADD" ? "Add New Customer" : "Edit Customer"}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSubmitForm} className="flex-grow overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {formError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200/50 p-4 rounded-xl text-sm text-red-600 font-semibold">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Grid 2-cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 12/A Coconut Mill St, Pollachi"
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors"
                />
              </div>

              {/* Bags and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                    Number of Bags <span className="text-red-500">*</span>
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

              {/* Image Upload Input */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                  Customer Image (Optional, Max 5MB)
                </label>
                <div className="mt-1 flex items-center gap-5">
                  <div className="h-16 w-16 bg-brand-bg rounded-2xl border border-dashed border-brand-border flex items-center justify-center text-brand-muted text-xs overflow-hidden uppercase shrink-0">
                    {imagePreview ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Upload className="h-6 w-6 text-brand-muted/65" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <input
                      type="file"
                      id="image-file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-file"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-text hover:bg-brand-bg text-xs font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      Select Image
                    </label>
                    <p className="text-[10px] text-brand-muted mt-1.5 font-medium">
                      Supports JPG, PNG, WEBP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
                  Notes / Observations (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Describe specific preferences or terms..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white focus:border-primary focus:outline-none text-sm transition-colors custom-scrollbar"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-brand-border text-brand-text hover:bg-brand-bg font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-premium transition-all disabled:opacity-75 cursor-pointer"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Customer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAILS & ORDERS MODAL --- */}
      {isDetailsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-brand-border/60 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-brand-text">Customer Profile</h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Profile Card Summary */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 bg-brand-bg/50 p-5 rounded-3xl border border-brand-border/50">
                <div className="h-20 w-20 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-primary font-extrabold text-2xl overflow-hidden uppercase shrink-0">
                  {selectedCustomer.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedCustomer.image_url}
                      alt={selectedCustomer.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    selectedCustomer.name.substring(0, 2)
                  )}
                </div>

                <div className="text-center sm:text-left space-y-2">
                  <h4 className="font-extrabold text-xl text-brand-text leading-snug">
                    {selectedCustomer.name}
                  </h4>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs font-semibold text-brand-muted">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-brand-muted/75 shrink-0" />
                      {selectedCustomer.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5 text-brand-muted/75 shrink-0" />
                      {selectedCustomer.bags_count} Bags Assigned
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedCustomer.payment_status === "PAID"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {selectedCustomer.payment_status === "PAID" ? (
                        <CheckCircle className="h-2.5 w-2.5" />
                      ) : (
                        <Clock className="h-2.5 w-2.5" />
                      )}
                      {selectedCustomer.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address details */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">
                  Registered Address
                </span>
                {selectedCustomer.address ? (
                  <div className="p-4 bg-white border border-brand-border/60 rounded-2xl flex items-start gap-2.5 text-sm">
                    <MapPin className="h-4.5 w-4.5 text-brand-muted shrink-0 mt-0.5" />
                    <span className="font-medium text-brand-text">{selectedCustomer.address}</span>
                  </div>
                ) : selectedCustomer.address_deleted_at ? (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200/40 p-4 rounded-2xl text-sm text-red-700 leading-relaxed font-semibold">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p>Address auto-deleted under GDPR/90-day retention policies.</p>
                      <p className="text-[10px] text-red-500/80 mt-1 font-bold">
                        Cleared on: {new Date(selectedCustomer.address_deleted_at).toLocaleString("en-US")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-brand-muted/50 italic font-semibold">No address supplied.</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">
                  Profile Notes
                </span>
                <div className="p-4 bg-white border border-brand-border/60 rounded-2xl text-sm text-brand-text flex items-start gap-2.5">
                  <FileText className="h-4.5 w-4.5 text-brand-muted shrink-0 mt-0.5" />
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedCustomer.notes || "No notes registered on this profile."}
                  </p>
                </div>
              </div>

              {/* Order Transaction History */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">
                  Order History ({customerOrders.length})
                </span>

                {isOrdersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                ) : customerOrders.length === 0 ? (
                  <p className="text-xs text-brand-muted/50 italic font-semibold p-4 border border-brand-border/40 border-dashed rounded-2xl text-center">
                    No orders registered for this customer yet.
                  </p>
                ) : (
                  <div className="border border-brand-border/60 rounded-2xl overflow-hidden bg-white">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-brand-bg border-b border-brand-border/60 font-bold text-brand-muted uppercase tracking-wide">
                            <th className="p-3">Product</th>
                            <th className="p-3">Bags</th>
                            <th className="p-3">Qty</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/40 font-medium text-brand-text">
                          {customerOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-brand-bg/30">
                              <td className="p-3 font-bold uppercase tracking-tight">
                                {ord.product_type.replace("_", " ")}
                              </td>
                              <td className="p-3">{ord.bags_count}</td>
                              <td className="p-3">{ord.quantity}</td>
                              <td className="p-3 font-bold">₹{ord.price.toLocaleString("en-IN")}</td>
                              <td className="p-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    ord.payment_status === "PAID"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {ord.payment_status}
                                </span>
                              </td>
                              <td className="p-3 text-[10px] text-brand-muted font-bold">
                                {new Date(ord.order_date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-brand-bg/40 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-muted font-bold">
              <span>
                Created:{" "}
                {new Date(selectedCustomer.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
