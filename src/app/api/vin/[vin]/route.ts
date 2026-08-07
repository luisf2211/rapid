import { NextResponse } from "next/server";
import { isVinFormatValid } from "@/lib/vin/validate";
import { decodeVinFromNhtsa } from "@/lib/vin/nhtsa";

/**
 * GET /api/vin/[vin]
 * Validates the VIN and decodes it via NHTSA vPIC.
 * Returns normalized vehicle data.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ vin: string }> },
) {
  const { vin: rawVin } = await params;
  const vin = rawVin?.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");

  if (!vin || !isVinFormatValid(vin)) {
    return NextResponse.json(
      { error: "VIN invalido. Debe tener 17 caracteres (sin I, O, Q)." },
      { status: 400 },
    );
  }

  try {
    const result = await decodeVinFromNhtsa(vin);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al consultar NHTSA" },
      { status: 502 },
    );
  }
}
