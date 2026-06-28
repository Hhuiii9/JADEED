"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Upload,
  Image as ImageIcon,
  Smartphone,
  Globe,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileImage,
  Info,
  X
} from "lucide-react";

interface SettingsClientProps {
  initialSettings: {
    appName: string;
    shortName: string;
    companyName: string;
    companyAddress: string;
    supportPhone: string;
    supportEmail: string;
    website: string;
    logo: string | null;
    icon192: string | null;
    icon512: string | null;
    appleTouchIcon: string | null;
    favicon: string | null;
    splashImage: string | null;
    themeColor: string;
    backgroundColor: string;
    statusBarStyle: string;
    displayMode: string;
    installPromptEnabled: boolean;
    offlineEnabled: boolean;
    pushNotificationEnabled: boolean;
    backgroundSyncEnabled: boolean;
  };
}

type TabType = "general" | "assets" | "pwa";

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [formData, setFormData] = useState(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Upload state management
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState("");

  // Confirmation dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; field: string | null }>({
    open: false,
    field: null,
  });

  // Custom Toast notifications state
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);
  const toastIdRef = useRef(0);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (max 2MB for app settings)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast("Branding asset size must be less than 2MB", "error");
      return;
    }

    setUploadError("");
    setUploadProgress((prev) => ({ ...prev, [fieldName]: 10 }));

    try {
      // Simulate incremental upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[fieldName] || 0;
          if (current >= 90) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [fieldName]: current + 15 };
        });
      }, 150);

      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/settings/upload", {
        method: "POST",
        body: uploadData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "File upload failed");
      }

      const data = await res.json();
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 100 }));
      setFormData((prev) => ({ ...prev, [fieldName]: data.url }));
      showToast(`Asset uploaded successfully!`);

      // Clear progress bar after transition
      setTimeout(() => {
        setUploadProgress((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setUploadProgress((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
      showToast(err.message || "An error occurred during upload", "error");
    }
  };

  // Asset Removal / Delete confirmation
  const triggerRemoveAsset = (fieldName: string) => {
    setDeleteConfirm({ open: true, field: fieldName });
  };

  const confirmRemoveAsset = () => {
    if (deleteConfirm.field) {
      setFormData((prev) => ({ ...prev, [deleteConfirm.field!]: null }));
      showToast("Branding asset removed. Save changes to apply.");
    }
    setDeleteConfirm({ open: false, field: null });
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    if (confirm("Reset settings back to standard JADEED Coconut Oil brand defaults?")) {
      setFormData({
        appName: "JADEED Coconut Oil",
        shortName: "JADEED",
        companyName: "JADEED Coconut Oil Ltd",
        companyAddress: "123 Mill Road, Pollachi, TN",
        supportPhone: "9876543210",
        supportEmail: "support@jadeed.com",
        website: "https://jadeed.com",
        logo: null,
        icon192: null,
        icon512: null,
        appleTouchIcon: null,
        favicon: null,
        splashImage: null,
        themeColor: "#166534",
        backgroundColor: "#ffffff",
        statusBarStyle: "default",
        displayMode: "standalone",
        installPromptEnabled: true,
        offlineEnabled: true,
        pushNotificationEnabled: false,
        backgroundSyncEnabled: false,
      });
      showToast("Defaults loaded. Save to apply.");
    }
  };

  // Submit Settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save configuration settings");
      }

      showToast("App settings saved and PWA parameters regenerated successfully!");
      router.refresh();
    } catch (err: any) {
      showToast(err.message || "An error occurred while saving", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Toast Overlay notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-2xl shadow-lg border text-sm font-semibold pointer-events-auto animate-slide-in transition-all ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-brand-muted hover:text-brand-text p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-dark tracking-tight">App Customizations</h1>
          <p className="text-sm text-brand-text/75 mt-1">Configure your installable PWA options, iOS layouts, company details, and branding files.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation buttons */}
          <div className="bg-white rounded-2xl border border-brand-border/60 shadow-sm p-1.5 flex gap-2 overflow-x-auto select-none">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "general"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-text/60 hover:text-brand-dark hover:bg-brand-bg/50"
              }`}
            >
              <Globe className="h-4 w-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "assets"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-text/60 hover:text-brand-dark hover:bg-brand-bg/50"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Branding Assets
            </button>
            <button
              onClick={() => setActiveTab("pwa")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "pwa"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-text/60 hover:text-brand-dark hover:bg-brand-bg/50"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              PWA & iOS Web App
            </button>
          </div>

          {/* TAB 1: General Settings */}
          {activeTab === "general" && (
            <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 space-y-6">
              <h2 className="text-lg font-extrabold text-brand-dark border-b border-brand-border/40 pb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-brand-primary" />
                General Portal Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Application Name</label>
                  <input
                    type="text"
                    name="appName"
                    value={formData.appName}
                    onChange={handleInputChange}
                    placeholder="e.g. JADEED Coconut Oil"
                    className="w-full h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Short App Name</label>
                  <input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleInputChange}
                    placeholder="e.g. JADEED"
                    maxLength={12}
                    className="w-full h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="e.g. JADEED Coconut Oil Ltd"
                    className="w-full h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Support Phone</label>
                  <input
                    type="text"
                    name="supportPhone"
                    value={formData.supportPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Support Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={formData.supportEmail}
                    onChange={handleInputChange}
                    placeholder="e.g. support@jadeed.com"
                    className="w-full h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Website URL</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="e.g. https://jadeed.com"
                    className="w-full h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Company Address</label>
                  <textarea
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g. 123 Mill Road, Pollachi, Tamil Nadu"
                    className="w-full p-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Branding Assets */}
          {activeTab === "assets" && (
            <div className="space-y-6 animate-fade-in">
              {/* App Logo */}
              <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 space-y-4">
                <h3 className="text-sm font-bold text-brand-dark border-b border-brand-border/40 pb-3 flex items-center justify-between">
                  <span>App Corporate Logo</span>
                  <span className="text-[10px] bg-brand-bg px-2 py-0.5 rounded text-brand-muted">Max 2MB: JPG, PNG, WEBP</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl border border-brand-border/60 bg-brand-bg flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-brand-muted/40" />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <label className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        {formData.logo ? "Change Logo" : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "logo")}
                        />
                      </label>
                      {formData.logo && (
                        <button
                          onClick={() => triggerRemoveAsset("logo")}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer border border-red-200/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                    {uploadProgress.logo && (
                      <div className="space-y-1">
                        <div className="bg-brand-border/60 h-2 rounded-full overflow-hidden w-full">
                          <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${uploadProgress.logo}%` }}></div>
                        </div>
                        <p className="text-[10px] text-brand-primary font-bold">Uploading: {uploadProgress.logo}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Icons Upload */}
              <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 space-y-6">
                <h3 className="text-sm font-bold text-brand-dark border-b border-brand-border/40 pb-3">PWA Launch Application Icons</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Icon 192 */}
                  <div className="border border-brand-border/60 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-4">
                    <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">192x192 Icon</span>
                    <div className="w-16 h-16 rounded-xl bg-brand-bg border flex items-center justify-center overflow-hidden">
                      {formData.icon192 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={formData.icon192} alt="Icon 192" className="w-full h-full object-cover" />
                      ) : (
                        <FileImage className="h-6 w-6 text-brand-muted/30" />
                      )}
                    </div>
                    <div className="w-full space-y-2">
                      <label className="w-full py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15 text-center text-xs font-bold rounded-xl transition active:scale-95 block cursor-pointer">
                        {formData.icon192 ? "Replace" : "Upload"}
                        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => handleFileUpload(e, "icon192")} />
                      </label>
                      {formData.icon192 && (
                        <button onClick={() => triggerRemoveAsset("icon192")} className="w-full py-1.5 text-red-600 hover:text-red-700 text-[11px] font-bold rounded-xl transition cursor-pointer">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Icon 512 */}
                  <div className="border border-brand-border/60 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-4">
                    <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">512x512 Icon</span>
                    <div className="w-16 h-16 rounded-xl bg-brand-bg border flex items-center justify-center overflow-hidden">
                      {formData.icon512 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={formData.icon512} alt="Icon 512" className="w-full h-full object-cover" />
                      ) : (
                        <FileImage className="h-6 w-6 text-brand-muted/30" />
                      )}
                    </div>
                    <div className="w-full space-y-2">
                      <label className="w-full py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15 text-center text-xs font-bold rounded-xl transition active:scale-95 block cursor-pointer">
                        {formData.icon512 ? "Replace" : "Upload"}
                        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => handleFileUpload(e, "icon512")} />
                      </label>
                      {formData.icon512 && (
                        <button onClick={() => triggerRemoveAsset("icon512")} className="w-full py-1.5 text-red-600 hover:text-red-700 text-[11px] font-bold rounded-xl transition cursor-pointer">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Apple Touch Icon */}
                  <div className="border border-brand-border/60 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-4">
                    <span className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">Apple Touch (180x180)</span>
                    <div className="w-16 h-16 rounded-xl bg-brand-bg border flex items-center justify-center overflow-hidden">
                      {formData.appleTouchIcon ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={formData.appleTouchIcon} alt="Apple icon" className="w-full h-full object-cover" />
                      ) : (
                        <FileImage className="h-6 w-6 text-brand-muted/30" />
                      )}
                    </div>
                    <div className="w-full space-y-2">
                      <label className="w-full py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/15 text-center text-xs font-bold rounded-xl transition active:scale-95 block cursor-pointer">
                        {formData.appleTouchIcon ? "Replace" : "Upload"}
                        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={(e) => handleFileUpload(e, "appleTouchIcon")} />
                      </label>
                      {formData.appleTouchIcon && (
                        <button onClick={() => triggerRemoveAsset("appleTouchIcon")} className="w-full py-1.5 text-red-600 hover:text-red-700 text-[11px] font-bold rounded-xl transition cursor-pointer">
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Favicon & Splash Screen */}
              <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 space-y-6">
                <h3 className="text-sm font-bold text-brand-dark border-b border-brand-border/40 pb-3">Browser Favicon & Splash Image</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Favicon */}
                  <div className="flex items-center gap-4 border border-brand-border/60 p-4 rounded-2xl">
                    <div className="w-12 h-12 rounded border bg-brand-bg flex items-center justify-center shrink-0 overflow-hidden">
                      {formData.favicon ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={formData.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-brand-muted/40" />
                      )}
                    </div>
                    <div className="flex-grow space-y-2">
                      <span className="text-xs font-bold text-brand-dark block">Browser Favicon (.ico/.png)</span>
                      <div className="flex gap-2">
                        <label className="px-3 py-1.5 bg-brand-bg hover:bg-brand-border/45 border text-brand-dark text-xs font-bold rounded-lg transition active:scale-95 block cursor-pointer select-none">
                          Replace
                          <input type="file" accept="image/png, image/x-icon, image/vnd.microsoft.icon" className="hidden" onChange={(e) => handleFileUpload(e, "favicon")} />
                        </label>
                        {formData.favicon && (
                          <button onClick={() => triggerRemoveAsset("favicon")} className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition border border-transparent">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Splash Image */}
                  <div className="flex items-center gap-4 border border-brand-border/60 p-4 rounded-2xl">
                    <div className="w-12 h-12 rounded border bg-brand-bg flex items-center justify-center shrink-0 overflow-hidden">
                      {formData.splashImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={formData.splashImage} alt="Splash screen" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-brand-muted/40" />
                      )}
                    </div>
                    <div className="flex-grow space-y-2">
                      <span className="text-xs font-bold text-brand-dark block">PWA Splash Screen (2048x2732)</span>
                      <div className="flex gap-2">
                        <label className="px-3 py-1.5 bg-brand-bg hover:bg-brand-border/45 border text-brand-dark text-xs font-bold rounded-lg transition active:scale-95 block cursor-pointer select-none">
                          Replace
                          <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleFileUpload(e, "splashImage")} />
                        </label>
                        {formData.splashImage && (
                          <button onClick={() => triggerRemoveAsset("splashImage")} className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition border border-transparent">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PWA & iOS Web App configurations */}
          {activeTab === "pwa" && (
            <div className="space-y-6 animate-fade-in">
              {/* Layout styling colors */}
              <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 space-y-6">
                <h2 className="text-sm font-extrabold text-brand-dark border-b border-brand-border/40 pb-3 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-brand-primary" />
                  iOS & Android Display Shell
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theme Color Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Theme Color (Status Bar/Headers)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="themeColor"
                        value={formData.themeColor}
                        onChange={handleInputChange}
                        className="w-12 h-11 p-1 bg-white border border-brand-border/60 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        name="themeColor"
                        value={formData.themeColor}
                        onChange={handleInputChange}
                        className="flex-1 h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20 uppercase"
                      />
                    </div>
                  </div>

                  {/* Background Color Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Background Color (App Canvas)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="backgroundColor"
                        value={formData.backgroundColor}
                        onChange={handleInputChange}
                        className="w-12 h-11 p-1 bg-white border border-brand-border/60 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        name="backgroundColor"
                        value={formData.backgroundColor}
                        onChange={handleInputChange}
                        className="flex-1 h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20 uppercase"
                      />
                    </div>
                  </div>

                  {/* Display Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">Display Mode</label>
                    <select
                      name="displayMode"
                      value={formData.displayMode}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20 cursor-pointer"
                    >
                      <option value="standalone">Standalone (Full-screen App Canvas)</option>
                      <option value="fullscreen">Fullscreen (Immersive - Android/iOS game style)</option>
                      <option value="minimal-ui">Minimal UI (Displays back buttons)</option>
                      <option value="browser">Browser Tab (Traditional Web tab)</option>
                    </select>
                  </div>

                  {/* iOS Status Bar Style */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-brand-dark uppercase tracking-wider">iOS Status Bar Style</label>
                    <select
                      name="statusBarStyle"
                      value={formData.statusBarStyle}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 border border-brand-border/60 rounded-xl focus:border-brand-primary focus:outline-none text-sm text-brand-text bg-brand-bg/20 cursor-pointer"
                    >
                      <option value="default">Default Status Bar (White with dark text)</option>
                      <option value="black">Black Status Bar (Solid black background)</option>
                      <option value="black-translucent">Black Translucent (Blended status bar overlay)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Install and capabilities Settings */}
              <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 space-y-6">
                <h3 className="text-sm font-bold text-brand-dark border-b border-brand-border/40 pb-3">Install & Network capabilities</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Enable Install Prompts */}
                  <label className="flex items-start gap-3 p-4 border border-brand-border/50 rounded-2xl cursor-pointer hover:bg-brand-bg/10 select-none">
                    <input
                      type="checkbox"
                      name="installPromptEnabled"
                      checked={formData.installPromptEnabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-brand-border rounded mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-dark block">Enable Install Banner Prompt</span>
                      <span className="text-[10px] text-brand-text/60 leading-tight block mt-0.5">Prompt mobile browser users to install this application on their home screen.</span>
                    </div>
                  </label>

                  {/* Enable Offline fallbacks */}
                  <label className="flex items-start gap-3 p-4 border border-brand-border/50 rounded-2xl cursor-pointer hover:bg-brand-bg/10 select-none">
                    <input
                      type="checkbox"
                      name="offlineEnabled"
                      checked={formData.offlineEnabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-brand-border rounded mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-dark block">Enable Offline Fallback Mode</span>
                      <span className="text-[10px] text-brand-text/60 leading-tight block mt-0.5">Let users navigate static layouts and show a custom WiFi warning page when offline.</span>
                    </div>
                  </label>

                  {/* Push Notifications */}
                  <label className="flex items-start gap-3 p-4 border border-brand-border/50 rounded-2xl cursor-pointer hover:bg-brand-bg/10 select-none">
                    <input
                      type="checkbox"
                      name="pushNotificationEnabled"
                      checked={formData.pushNotificationEnabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-brand-border rounded mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-dark block">Enable Push Notifications</span>
                      <span className="text-[10px] text-brand-text/60 leading-tight block mt-0.5">Configure hooks to send mobile transaction updates and alert logs.</span>
                    </div>
                  </label>

                  {/* Background Sync */}
                  <label className="flex items-start gap-3 p-4 border border-brand-border/50 rounded-2xl cursor-pointer hover:bg-brand-bg/10 select-none">
                    <input
                      type="checkbox"
                      name="backgroundSyncEnabled"
                      checked={formData.backgroundSyncEnabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-brand-border rounded mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-dark block">Enable Background Synchronization</span>
                      <span className="text-[10px] text-brand-text/60 leading-tight block mt-0.5">Automatically sync customer orders placed offline immediately once network recovers.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-border/40 pt-4">
            <button
              onClick={handleResetDefaults}
              className="px-5 py-2.5 rounded-xl border border-brand-border/60 hover:bg-brand-bg text-brand-text/80 text-xs font-bold transition active:scale-95 cursor-pointer select-none"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-5 py-2.5 rounded-xl text-brand-text/60 hover:text-brand-dark text-xs font-bold transition select-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5 select-none cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-brand-border/60 shadow-md p-6 sticky top-6 space-y-4">
            <h3 className="text-sm font-extrabold text-brand-dark flex items-center gap-1.5 border-b border-brand-border/40 pb-3">
              <Smartphone className="h-4.5 w-4.5 text-brand-primary" />
              Live iPhone PWA Preview
            </h3>

            {/* Virtual iPhone Frame */}
            <div className="mx-auto w-[250px] h-[500px] rounded-[40px] bg-brand-dark border-[8px] border-brand-dark shadow-2xl relative overflow-hidden flex flex-col select-none ring-[1px] ring-white/10">
              {/* iPhone Speaker Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-brand-dark rounded-b-2xl z-40 flex justify-between items-center px-4">
                {/* Camera dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900/50"></div>
                {/* Speaker line */}
                <div className="w-10 h-1 bg-slate-800 rounded"></div>
              </div>

              {/* iPhone Status Bar */}
              <div
                className={`h-9 px-6 flex justify-between items-end text-[9px] font-bold z-30 pt-1.5 leading-none transition-colors duration-200 ${
                  formData.statusBarStyle === "default"
                    ? "bg-white text-slate-900"
                    : "bg-slate-950 text-white"
                }`}
              >
                <span>9:41 AM</span>
                <div className="flex items-center gap-1">
                  {/* Signal bars */}
                  <svg className="w-2.5 h-2" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="0" y="16" width="4" height="8" rx="0.5" />
                    <rect x="6" y="12" width="4" height="12" rx="0.5" />
                    <rect x="12" y="8" width="4" height="16" rx="0.5" />
                    <rect x="18" y="4" width="4" height="20" rx="0.5" />
                  </svg>
                  <span>5G</span>
                  {/* Battery icon */}
                  <div className="w-4 h-2 border border-current rounded-sm flex items-center p-[1px] relative">
                    <div className="bg-current h-full w-[80%] rounded-2xs"></div>
                    <div className="absolute -right-[2px] top-1/2 -translate-y-1/2 w-[1px] h-[2px] bg-current"></div>
                  </div>
                </div>
              </div>

              {/* Dynamic App Canvas Body */}
              <div
                className="flex-1 p-4 flex flex-col justify-between relative text-center pt-8"
                style={{ backgroundColor: formData.backgroundColor }}
              >
                {/* App Logo/Header section */}
                <div className="space-y-4 pt-4">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 border border-brand-border/40 flex items-center justify-center overflow-hidden shadow-sm">
                    {formData.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={formData.logo} alt="Branded logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-brand-muted/30" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-brand-dark truncate px-2">{formData.appName}</h4>
                    <p className="text-[10px] text-brand-muted font-medium mt-0.5 truncate px-2">{formData.companyName}</p>
                  </div>
                </div>

                {/* iPhone Home Screen Simulated App Icon Grid */}
                <div className="p-4 bg-slate-100/80 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-inner flex flex-col items-center gap-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Simulated App Icon</span>
                  
                  <div className="flex flex-col items-center">
                    {/* App icon */}
                    <div
                      className="w-11 h-11 rounded-[10px] shadow-md flex items-center justify-center overflow-hidden border border-black/5 active:scale-95 transition-all"
                      style={{ backgroundColor: formData.themeColor }}
                    >
                      {formData.appleTouchIcon || formData.icon192 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={formData.appleTouchIcon || formData.icon192 || ""}
                          alt="Icon Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-white text-base font-extrabold">
                          {formData.shortName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* App label below icon */}
                    <span className="text-[8px] font-extrabold text-slate-700 mt-1 select-none truncate max-w-[50px] leading-tight">
                      {formData.shortName}
                    </span>
                  </div>
                </div>

                {/* iPhone home bar */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-brand-dark/40 rounded-full"></div>
              </div>
            </div>

            {/* Quick tips details */}
            <div className="p-3 bg-brand-bg rounded-2xl border border-brand-border/40 text-[10px] text-brand-text/75 leading-relaxed flex gap-2">
              <Info className="h-4 w-4 text-brand-primary shrink-0 mt-0.5" />
              <span>
                Theme and status bar style preferences configure your installation templates immediately. Try toggling colors to see preview updates in real-time.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deletion confirmation overlay Modal */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-brand-border/60 p-6 space-y-6 text-center animate-scale-in">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-brand-dark">Remove App Asset</h4>
              <p className="text-xs text-brand-text/65 mt-1 leading-relaxed">
                Are you sure you want to remove this branding graphic? You will need to save configurations to finalize changes.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ open: false, field: null })}
                className="flex-1 py-2.5 rounded-xl border border-brand-border/50 text-brand-text/75 font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                Keep File
              </button>
              <button
                onClick={confirmRemoveAsset}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
