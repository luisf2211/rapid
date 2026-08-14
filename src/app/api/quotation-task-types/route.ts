import { NextResponse } from "next/server";
import {
  listQuotationTaskTypes,
  createQuotationTaskType,
} from "@/services/quotation-task-types.service";
import { quotationTaskTypeSchema } from "@/lib/validations/quotation-task-type";

/**
 * GET /api/quotation-task-types
 * Tareas de mano de obra activas para el select del formulario de cotización.
 */
export async function GET() {
  try {
    const tasks = await listQuotationTaskTypes({ activeOnly: true });
    return NextResponse.json(tasks.map((t) => ({ id: t.Id, name: t.Name })));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/quotation-task-types
 * Crea una tarea nueva desde el modal del formulario de cotización.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = quotationTaskTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }
    const row = await createQuotationTaskType(parsed.data);
    return NextResponse.json({ id: row.Id, name: row.Name });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Ya existe una tarea con ese nombre." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
