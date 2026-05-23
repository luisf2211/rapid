import { readFile } from "fs/promises";
import { join, resolve, sep } from "path";
import { NextRequest, NextResponse } from "next/server";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const uploadsDir = process.env.UPLOADS_DIR;
  if (!uploadsDir) {
    return NextResponse.json(
      { error: "UPLOADS_DIR no configurado en .env" },
      { status: 404 },
    );
  }

  const { path: segments } = await params;
  const root = resolve(uploadsDir);
  const filePath = resolve(join(root, ...segments));

  if (filePath !== root && !filePath.startsWith(root + sep)) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  try {
    const buffer = await readFile(filePath);
    const ext = segments[segments.length - 1]?.split(".").pop()?.toLowerCase();
    const contentType = (ext && MIME[ext]) || "application/octet-stream";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
