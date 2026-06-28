import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { AppSettings } from "@/lib/models";
import { getAuthenticatedUser } from "@/lib/server-auth";

// GET /api/settings - Fetch branding settings
export async function GET() {
  try {
    await dbConnect();
    
    // Attempt to find the single settings document
    let settings = await AppSettings.findOne({});
    
    // Seed default settings if none exists yet
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

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET app settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update application configurations
export async function PUT(request: Request) {
  try {
    await dbConnect();
    
    // Auth guard
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Find or create settings document to update
    let settings = await AppSettings.findOne({});
    if (!settings) {
      settings = new AppSettings();
    }

    // Assign editable general fields
    settings.appName = body.appName || "JADEED Coconut Oil";
    settings.shortName = body.shortName || "JADEED";
    settings.companyName = body.companyName || "JADEED Coconut Oil Ltd";
    settings.companyAddress = body.companyAddress || "123 Mill Road, Pollachi, TN";
    settings.supportPhone = body.supportPhone || "9876543210";
    settings.supportEmail = body.supportEmail || "support@jadeed.com";
    settings.website = body.website || "https://jadeed.com";

    // Assign graphics Cloudinary URLs
    settings.logo = body.logo !== undefined ? body.logo : settings.logo;
    settings.icon192 = body.icon192 !== undefined ? body.icon192 : settings.icon192;
    settings.icon512 = body.icon512 !== undefined ? body.icon512 : settings.icon512;
    settings.appleTouchIcon = body.appleTouchIcon !== undefined ? body.appleTouchIcon : settings.appleTouchIcon;
    settings.favicon = body.favicon !== undefined ? body.favicon : settings.favicon;
    settings.splashImage = body.splashImage !== undefined ? body.splashImage : settings.splashImage;

    // Assign iOS styling options
    settings.themeColor = body.themeColor || "#166534";
    settings.backgroundColor = body.backgroundColor || "#ffffff";
    settings.statusBarStyle = body.statusBarStyle || "default";
    settings.displayMode = body.displayMode || "standalone";

    // Assign feature toggles
    settings.installPromptEnabled = body.installPromptEnabled ?? true;
    settings.offlineEnabled = body.offlineEnabled ?? true;
    settings.pushNotificationEnabled = body.pushNotificationEnabled ?? false;
    settings.backgroundSyncEnabled = body.backgroundSyncEnabled ?? false;

    await settings.save();

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("PUT app settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
