import {
  ALL_CHECKLIST_ITEMS,
  CHECKLIST_ITEMS,
  CHECKLIST_LABEL_BY_FIELD,
  LEGACY_CHECKLIST_ITEMS,
  type ActiveChecklistField,
  type ChecklistField,
  type LegacyChecklistField,
} from "@/lib/constants";

/** Nombre del ítem tal como se guarda en SQL Server (legacy). */
export function checklistFieldToDbItemName(field: ChecklistField): string {
  const label = CHECKLIST_LABEL_BY_FIELD[field];
  if (label === "A/C") return "A/C";
  if (label === "Check Engine") return "CHECK ENGINE";
  return label.toUpperCase();
}

/** Resuelve el field canónico desde cualquier variante en la DB, incluidos los retirados. */
export function checklistFieldFromDbItemName(
  itemName: string,
): ChecklistField | undefined {
  const normalized = itemName.trim().toUpperCase();
  for (const item of ALL_CHECKLIST_ITEMS) {
    if (checklistFieldToDbItemName(item.field).toUpperCase() === normalized) {
      return item.field;
    }
  }
  return undefined;
}

export type ChecklistRow = {
  itemName: string;
  isChecked: boolean;
  comments?: string | null;
  hasComment?: boolean;
};

export type ChecklistDetails = {
  checked: Record<ChecklistField, boolean>;
  comments: Record<ChecklistField, string | null>;
  /** Ítems que la orden tiene realmente guardados en la DB. */
  present: Partial<Record<ChecklistField, boolean>>;
};

export function emptyChecklistDetails(): ChecklistDetails {
  const checked = {} as Record<ChecklistField, boolean>;
  const comments = {} as Record<ChecklistField, string | null>;
  for (const item of ALL_CHECKLIST_ITEMS) {
    checked[item.field] = false;
    comments[item.field] = null;
  }
  return { checked, comments, present: {} };
}

export function checklistRowsToDetails(
  rows: ChecklistRow[] | null | undefined,
): ChecklistDetails {
  const details = emptyChecklistDetails();
  if (!rows) return details;
  for (const row of rows) {
    const field = checklistFieldFromDbItemName(row.itemName);
    if (!field) continue;
    details.present[field] = true;
    details.checked[field] = row.isChecked;
    if (row.comments?.trim()) {
      details.comments[field] = row.comments.trim();
    }
  }
  return details;
}

/** Ítems retirados que esta orden sí tiene guardados. */
export function legacyChecklistFieldsPresent(
  present: ChecklistDetails["present"],
): LegacyChecklistField[] {
  return LEGACY_CHECKLIST_ITEMS.filter((item) => present[item.field]).map(
    (item) => item.field,
  );
}

/**
 * Ítems a mostrar en una orden: los vigentes más los retirados que esa orden
 * ya tenía guardados, para no perder información de recepciones históricas.
 */
export function checklistDisplayItems(
  present: ChecklistDetails["present"],
): Array<{ field: ChecklistField; label: string; legacy: boolean }> {
  const active = CHECKLIST_ITEMS.map((item) => ({ ...item, legacy: false }));
  const legacy = LEGACY_CHECKLIST_ITEMS.filter((item) => present[item.field]).map(
    (item) => ({ ...item, legacy: true }),
  );
  return [...active, ...legacy];
}

/** True si ningún ítem del checklist fue marcado (recepción recién creada). */
export function isChecklistIncomplete(
  rows: ChecklistRow[] | null | undefined,
): boolean {
  if (!rows?.length) return true;
  const { checked } = checklistRowsToDetails(rows);
  return !ALL_CHECKLIST_ITEMS.some((item) => checked[item.field]);
}

export type ChecklistEntryFormValue = { checked: boolean; comment: string };

export type ChecklistFormValues = Record<
  ActiveChecklistField,
  ChecklistEntryFormValue
> &
  Partial<Record<LegacyChecklistField, ChecklistEntryFormValue>>;

export function buildDefaultChecklistFormValues(): ChecklistFormValues {
  return Object.fromEntries(
    CHECKLIST_ITEMS.map((item) => [item.field, { checked: false, comment: "" }]),
  ) as ChecklistFormValues;
}
