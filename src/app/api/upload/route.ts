import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image size exceeds the 5MB limit" },
        { status: 400 }
      );
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Only JPG, PNG, and WEBP are allowed" },
        { status: 400 }
      );
    }

    // Read file into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using a Promise stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "jadeed_uploads",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload stream error:", error);
            return reject(error);
          }
          resolve(result);
        }
      ).end(buffer);
    });

    const imageUrl = uploadResult.secure_url;

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
