import { NextResponse } from "next/server";
import { listInsuranceCompanies } from "@/services/insurance-companies.service";

/**
 * GET /api/insurance-companies
 * Retorna las aseguradoras activas para autocomplete en el formulario de cotización.
 */
export async function GET() {
  try {
    const companies = await listInsuranceCompanies({ activeOnly: true });
    const mapped = companies.map((c) => ({
      id: c.Id,
      name: c.Name,
      rnc: c.Rnc,
      phone: c.Phone,
      email: c.Email,
      contactName: c.ContactName,
    }));
    return NextResponse.json(mapped);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 },
    );
  }
}
