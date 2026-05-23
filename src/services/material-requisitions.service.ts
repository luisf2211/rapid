import { prisma } from "@/lib/prisma";
import type { MaterialRequisitionInput } from "@/lib/validations/material-requisition";

export async function listMaterialRequisitions(params?: {
  workOrderId?: number;
}) {
  return prisma.materialRequisition.findMany({
    where: params?.workOrderId ? { workOrderId: params.workOrderId } : undefined,
    include: {
      workOrder: true,
      items: true,
    },
    orderBy: { id: "desc" },
  });
}

export async function getMaterialRequisitionById(id: number) {
  return prisma.materialRequisition.findUnique({
    where: { id },
    include: {
      workOrder: true,
      items: true,
    },
  });
}

export async function createMaterialRequisition(
  input: MaterialRequisitionInput,
) {
  const total = input.items.reduce(
    (acc, it) => acc + Number(it.quantity) * Number(it.unitPrice),
    0,
  );

  return prisma.materialRequisition.create({
    data: {
      workOrderId: input.workOrderId,
      desab: input.desab || null,
      disassembler: input.disassembler || null,
      prep: input.prep || null,
      painter: input.painter || null,
      polisher: input.polisher || null,
      total,
      items: {
        create: input.items.map((it) => ({
          productName: it.productName,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: Number(it.quantity) * Number(it.unitPrice),
          assignedEmployee: it.assignedEmployee || null,
        })),
      },
    },
    include: { items: true },
  });
}
