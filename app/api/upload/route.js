import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) return new Response("No file uploaded", { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  // ✅ Unique filename each time
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1e6);
  const filename = `drawing-${timestamp}-${random}.png`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, buffer);

  return new Response(
    JSON.stringify({ success: true, path: `/uploads/${filename}` }),
    { headers: { "Content-Type": "application/json" } }
  );
}
