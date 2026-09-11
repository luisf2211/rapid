import { NextRequest, NextResponse } from "next/server";
import { publicQuoteRequestSchema } from "@/lib/validations/public-quote";
import { createPublicQuoteRequest } from "@/services/public-quotations.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const parsed = publicQuoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }

  try {
    const result = await createPublicQuoteRequest(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo enviar la solicitud";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
