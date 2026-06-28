import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    // Auth guard
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate size (max 2MB for app settings)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Branding asset size exceeds the 2MB limit" },
        { status: 400 }
      );
    }

    // Validate file formats
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/x-icon",
      "image/vnd.microsoft.icon", // standard MIME type for .ico
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".ico")) {
      return NextResponse.json(
        { error: "Unsupported image type. Only JPG, PNG, WEBP, and ICO are allowed" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary folder jadeed_pwa_settings
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "jadeed_pwa_settings",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary app upload stream error:", error);
            return reject(error);
          }
          resolve(result);
        }
      ).end(buffer);
    });

    const imageUrl = uploadResult.secure_url;

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error("App settings upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
