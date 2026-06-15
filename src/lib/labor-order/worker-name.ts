type LaborOrderWorkerFields = {
  technician?: string | null;
  desab?: string | null;
  disassembler?: string | null;
  prep?: string | null;
  painter?: string | null;
  polisher?: string | null;
};

export function laborOrderWorkerName(lo: LaborOrderWorkerFields): string {
  const name = lo.technician?.trim();
  if (name) return name;
  const legacy = [lo.desab, lo.disassembler, lo.prep, lo.painter, lo.polisher].filter(
    Boolean,
  );
  return legacy.length > 0 ? legacy.join(" · ") : "—";
}
