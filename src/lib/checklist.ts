import {
  CHECKLIST_ITEMS,
  CHECKLIST_LABEL_BY_FIELD,
  type ChecklistField,
} from "@/lib/constants";

/** Nombre del ítem tal como se guarda en SQL Server (legacy). */
export function checklistFieldToDbItemName(field: ChecklistField): string {
  const label = CHECKLIST_LABEL_BY_FIELD[field];
  if (label === "A/C") return "A/C";
  if (label === "Check Engine") return "CHECK ENGINE";
  return label.toUpperCase();
}

/** Resuelve el field canónico desde cualquier variante en la DB. */
export function checklistFieldFromDbItemName(
  itemName: string,
): ChecklistField | undefined {
  const normalized = itemName.trim().toUpperCase();
  for (const item of CHECKLIST_ITEMS) {
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
};

export function emptyChecklistDetails(): ChecklistDetails {
  const checked = {} as Record<ChecklistField, boolean>;
  const comments = {} as Record<ChecklistField, string | null>;
  for (const item of CHECKLIST_ITEMS) {
    checked[item.field] = false;
    comments[item.field] = null;
  }
  return { checked, comments };
}

export function checklistRowsToDetails(
  rows: ChecklistRow[] | null | undefined,
): ChecklistDetails {
  const checked: Record<string, boolean> = {};
  const comments: Record<string, string | null> = {};
  for (const item of CHECKLIST_ITEMS) {
    checked[item.field] = false;
    comments[item.field] = null;
  }
  if (!rows) {
    return { checked, comments } as ChecklistDetails;
  }
  for (const row of rows) {
    const field = checklistFieldFromDbItemName(row.itemName);
    if (!field) continue;
    checked[field] = row.isChecked;
    if (row.comments?.trim()) {
      comments[field] = row.comments.trim();
    }
  }
  return { checked, comments } as ChecklistDetails;
}

export function buildDefaultChecklistFormValues(): Record<
  ChecklistField,
  { checked: boolean; comment: string }
> {
  return Object.fromEntries(
    CHECKLIST_ITEMS.map((item) => [
      item.field,
      { checked: false, comment: "" },
    ]),
  ) as Record<ChecklistField, { checked: boolean; comment: string }>;
}
