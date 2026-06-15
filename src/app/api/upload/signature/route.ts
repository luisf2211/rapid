import { NextRequest, NextResponse } from "next/server";
import { saveSignaturePng } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { dataUrl?: string };
    if (!body.dataUrl || typeof body.dataUrl !== "string") {
      return NextResponse.json({ error: "Firma requerida" }, { status: 400 });
    }

    const result = await saveSignaturePng(body.dataUrl);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al guardar la firma";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
