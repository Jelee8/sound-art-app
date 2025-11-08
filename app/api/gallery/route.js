import { readdir } from "fs/promises";
import path from "path";

export async function GET() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const files = await readdir(uploadDir);

  // Return only image URLs
  const images = files
    .filter((f) => f.endsWith(".png") || f.endsWith(".jpg"))
    .map((f) => `/uploads/${f}`)
    .reverse(); // newest first

  return new Response(JSON.stringify(images), {
    headers: { "Content-Type": "application/json" },
  });
}