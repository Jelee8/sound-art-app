import { readFile } from "fs/promises";
import path from "path";

export async function GET(req, { params }) {
  const { id } = params;
  if (!id) {
    return new Response("Missing drawing ID", { status: 400 });
  }

  try {
    // decode ID in case of URL encoding
    const filename = decodeURIComponent(id);

    // find JSON file in /public/drawings
    const filePath = path.join(process.cwd(), "public", "drawings", filename);

    const data = await readFile(filePath, "utf-8");

    return new Response(data, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error loading drawing:", err);
    return new Response(JSON.stringify({ error: "Not found" }), {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }
}
