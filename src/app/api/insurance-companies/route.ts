import { NextResponse } from "next/server";
import { listInsuranceCompanies, createInsuranceCompany } from "@/services/insurance-companies.service";
import { insuranceCompanySchema } from "@/lib/validations/insurance-company";

/**
 * GET /api/insurance-companies
 * Retorna las aseguradoras activas para el dropdown en el formulario de cotización.
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

/**
 * POST /api/insurance-companies
 * Crea una nueva aseguradora desde el modal del formulario de cotización.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = insuranceCompanySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }
    const row = await createInsuranceCompany(parsed.data);
    return NextResponse.json({
      id: row.Id,
      name: row.Name,
      rnc: row.Rnc,
      phone: row.Phone,
      contactName: row.ContactName,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ya existe una aseguradora con ese nombre." }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
