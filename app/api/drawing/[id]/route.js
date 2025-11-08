import { promises as fs } from "fs";
import path from "path";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    let fileName = id;

    // add .json if missing
    if (!fileName.endsWith(".json")) fileName += ".json";

    const filePath = path.join(process.cwd(), "public", "drawings", fileName);

    // Debug: log the file path
    console.log("Loading file:", filePath);

    const content = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(content);

    return new Response(JSON.stringify(json), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error loading drawing:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
