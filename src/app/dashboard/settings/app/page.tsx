import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { dbConnect } from "@/lib/db";
import { AppSettings } from "@/lib/models";
import SettingsClient from "./SettingsClient";

export default async function AppSettingsPage() {
  const session = await getAuthenticatedUser();
  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  
  // Fetch settings from MongoDB
  let settings = await AppSettings.findOne({});
  
  // Seed default settings if empty
  if (!settings) {
    settings = await AppSettings.create({
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
  }

  // Convert Mongoose doc to plain object for React client
  const plainSettings = {
    appName: settings.appName,
    shortName: settings.shortName,
    companyName: settings.companyName,
    companyAddress: settings.companyAddress,
    supportPhone: settings.supportPhone,
    supportEmail: settings.supportEmail,
    website: settings.website,
    logo: settings.logo,
    icon192: settings.icon192,
    icon512: settings.icon512,
    appleTouchIcon: settings.appleTouchIcon,
    favicon: settings.favicon,
    splashImage: settings.splashImage,
    themeColor: settings.themeColor,
    backgroundColor: settings.backgroundColor,
    statusBarStyle: settings.statusBarStyle,
    displayMode: settings.displayMode,
    installPromptEnabled: settings.installPromptEnabled,
    offlineEnabled: settings.offlineEnabled,
    pushNotificationEnabled: settings.pushNotificationEnabled,
    backgroundSyncEnabled: settings.backgroundSyncEnabled,
  };

  return <SettingsClient initialSettings={plainSettings} />;
}
