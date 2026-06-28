import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { dbConnect } from "@/lib/db";
import { User, AppSettings } from "@/lib/models";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthenticatedUser();
  if (!session) {
    redirect("/login");
  }

  const conn = await dbConnect();
  if (!conn) {
    // If database connection is completely offline, redirect to login
    redirect("/login?error=database_offline");
  }

  const user = await User.findById(session.userId);

  if (!user) {
    redirect("/login");
  }

  // Fetch App Settings on the server
  let settings = await AppSettings.findOne({});
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

  const plainUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
  };

  const plainSettings = {
    appName: settings.appName,
    shortName: settings.shortName,
    companyName: settings.companyName,
    logo: settings.logo,
    themeColor: settings.themeColor,
  };

  return (
    <DashboardShell user={plainUser} settings={plainSettings}>
      {children}
    </DashboardShell>
  );
}
