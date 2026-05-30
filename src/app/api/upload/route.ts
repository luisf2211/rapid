import { NextRequest, NextResponse } from "next/server";
import { saveUploadedImage } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }

    const subfolderRaw = formData.get("subfolder");
    const subfolder =
      typeof subfolderRaw === "string" && /^[a-z][a-z0-9_-]*$/.test(subfolderRaw)
        ? subfolderRaw
        : "field";

    const result = await saveUploadedImage(file, subfolder);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al subir la imagen";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
