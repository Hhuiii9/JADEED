import { mkdir, writeFile } from "fs/promises";
import path from "path";

// A valid Base64 string for a 100x100 solid forest green (#166534) PNG image
const GREEN_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkAQMAAABKLujXAAAAA1BMVEUWZTRj5dGgAAAADklEQVQ4y2NgGAWDCwAAAZAAAbm5q7sAAAAASUVORK5CYII=";
const buffer = Buffer.from(GREEN_PNG_BASE64, "base64");

async function main() {
  console.log("Generating brand icons for JADEED Coconut Oil PWA...");

  const publicDir = path.join(process.cwd(), "public");
  const iconsDir = path.join(publicDir, "icons");

  // Create directories if they do not exist
  await mkdir(iconsDir, { recursive: true });

  // Write icons
  await writeFile(path.join(iconsDir, "icon-192.png"), buffer);
  console.log("Created: public/icons/icon-192.png");

  await writeFile(path.join(iconsDir, "icon-512.png"), buffer);
  console.log("Created: public/icons/icon-512.png");

  await writeFile(path.join(publicDir, "apple-touch-icon.png"), buffer);
  console.log("Created: public/apple-touch-icon.png");

  console.log("[Success] Icons generated successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to generate icons:", err);
  process.exit(1);
});
