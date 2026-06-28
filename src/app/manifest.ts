import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import { AppSettings } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  await dbConnect();
  
  try {
    const settings = await AppSettings.findOne({});
    
    if (!settings) {
      return {
        name: "JADEED Coconut Oil",
        short_name: "JADEED",
        description: "Customer and order management portal for JADEED Coconut Oil",
        theme_color: "#166534",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      };
    }

    return {
      name: settings.appName || "JADEED Coconut Oil",
      short_name: settings.shortName || "JADEED",
      description: `Customer portal for ${settings.companyName || "JADEED Coconut Oil"}`,
      theme_color: settings.themeColor || "#166534",
      background_color: settings.backgroundColor || "#ffffff",
      display: (settings.displayMode || "standalone") as any,
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      icons: [
        {
          src: settings.icon192 || "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: settings.icon512 || "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    };
  } catch (error) {
    console.error("Failed to generate dynamic manifest:", error);
    return {
      name: "JADEED Coconut Oil",
      short_name: "JADEED",
      theme_color: "#166534",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
    };
  }
}
