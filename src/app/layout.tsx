import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { dbConnect } from "@/lib/db";
import { AppSettings } from "@/lib/models";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Dynamic metadata generation based on database configuration
export async function generateMetadata(): Promise<Metadata> {
  const conn = await dbConnect();
  
  // Fallback immediately if database is not connected (e.g. during build)
  if (!conn) {
    return {
      title: "JADEED Coconut Oil - Customer Portal",
      description: "Secure customer, order, payment and report management application for JADEED Coconut Oil.",
      manifest: "/manifest.json",
      appleWebApp: {
        capable: true,
        title: "JADEED",
        statusBarStyle: "default",
      },
    };
  }

  try {
    const settings = await AppSettings.findOne({});
    if (!settings) {
      return {
        title: "JADEED Coconut Oil - Customer Portal",
        description: "Secure customer, order, payment and report management application for JADEED Coconut Oil.",
        manifest: "/manifest.json",
        appleWebApp: {
          capable: true,
          title: "JADEED",
          statusBarStyle: "default",
        },
      };
    }

    return {
      title: `${settings.appName} - Customer Portal`,
      description: `Secure customer, order, payment and report management application for ${settings.companyName}.`,
      manifest: "/manifest.json",
      icons: {
        icon: settings.favicon || "/favicon.ico",
        apple: settings.appleTouchIcon || "/apple-touch-icon.png",
      },
      appleWebApp: {
        capable: true,
        title: settings.shortName || "JADEED",
        statusBarStyle: (settings.statusBarStyle || "default") as any,
      },
    };
  } catch (error) {
    console.error("Failed to generate dynamic layout metadata:", error);
    return {
      title: "JADEED Coconut Oil - Customer Portal",
      description: "Secure customer, order, payment and report management application for JADEED Coconut Oil.",
      manifest: "/manifest.json",
      appleWebApp: {
        capable: true,
        title: "JADEED",
        statusBarStyle: "default",
      },
    };
  }
}

// Dynamic viewport styling based on custom theme colors
export async function generateViewport() {
  const conn = await dbConnect();
  
  if (!conn) {
    return {
      themeColor: "#166534",
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      viewportFit: "cover",
    };
  }

  try {
    const settings = await AppSettings.findOne({});
    return {
      themeColor: settings?.themeColor || "#166534",
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      viewportFit: "cover",
    };
  } catch (error) {
    return {
      themeColor: "#166534",
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
      viewportFit: "cover",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-brand-bg text-brand-text select-none">
        {children}
        {/* Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('Service Worker registered successfully with scope: ', reg.scope);
                  }, function(err) {
                    console.log('Service Worker registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
