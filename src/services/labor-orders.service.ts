import { prisma } from "@/lib/prisma";
import type { LaborOrderInput } from "@/lib/validations/labor-order";

export async function listLaborOrders(params?: { workOrderId?: number }) {
  return prisma.laborOrder.findMany({
    where: params?.workOrderId ? { workOrderId: params.workOrderId } : undefined,
    include: {
      workOrder: true,
      items: true,
    },
    orderBy: { id: "desc" },
  });
}

export async function getLaborOrderById(id: number) {
  return prisma.laborOrder.findUnique({
    where: { id },
    include: { workOrder: true, items: true },
  });
}

export async function createLaborOrder(input: LaborOrderInput) {
  const itemsWithTotal = input.items.map((it) => {
    const total =
      Number(it.desabCost) +
      Number(it.disassemblerCost) +
      Number(it.prepCost) +
      Number(it.painterCost) +
      Number(it.polisherCost);
    return { ...it, total };
  });
  const total = itemsWithTotal.reduce((acc, it) => acc + it.total, 0);

  return prisma.laborOrder.create({
    data: {
      workOrderId: input.workOrderId,
      desab: input.desab || null,
      disassembler: input.disassembler || null,
      prep: input.prep || null,
      painter: input.painter || null,
      polisher: input.polisher || null,
      total,
      items: {
        create: itemsWithTotal.map((it) => ({
          partName: it.partName,
          desabCost: it.desabCost,
          disassemblerCost: it.disassemblerCost,
          prepCost: it.prepCost,
          painterCost: it.painterCost,
          polisherCost: it.polisherCost,
          total: it.total,
        })),
      },
    },
    include: { items: true },
  });
}
