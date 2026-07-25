"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type {
  WorkOrderFormValues,
  WorkOrderInput,
} from "@/lib/validations/work-order";

/** Subir la versión invalida los borradores guardados con una forma anterior. */
const DRAFT_VERSION = 2;
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const SAVE_DEBOUNCE_MS = 800;

export type WorkOrderDraft = {
  version: number;
  savedAt: string;
  values: WorkOrderFormValues;
};

function draftKey(mode: "create" | "edit", workOrderId?: number): string {
  return mode === "edit"
    ? `rapid:work-order-draft:edit:${workOrderId ?? "unknown"}`
    : "rapid:work-order-draft:new";
}

function readDraft(key: string): WorkOrderDraft | null {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WorkOrderDraft;
    if (parsed?.version !== DRAFT_VERSION || !parsed.values) return null;
    const age = Date.now() - new Date(parsed.savedAt).getTime();
    if (!Number.isFinite(age) || age > DRAFT_MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

interface Options {
  form: UseFormReturn<WorkOrderFormValues, unknown, WorkOrderInput>;
  mode: "create" | "edit";
  workOrderId?: number;
  defaultValues: WorkOrderFormValues;
}

/**
 * Conserva lo tecleado en el formulario de recepción por si la página se
 * refresca por accidente. Al crear se restaura solo; al editar se pregunta,
 * porque los datos del servidor pueden ser más recientes que el borrador.
 */
export function useWorkOrderDraft({
  form,
  mode,
  workOrderId,
  defaultValues,
}: Options) {
  const key = draftKey(mode, workOrderId);
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<WorkOrderDraft | null>(null);
  const skipSaveRef = useRef(false);
  const defaultsJsonRef = useRef(JSON.stringify(defaultValues));

  const clearDraft = useCallback(() => {
    window.localStorage.removeItem(key);
    setRestoredAt(null);
    setPendingDraft(null);
  }, [key]);

  const applyDraft = useCallback(
    (draft: WorkOrderDraft) => {
      skipSaveRef.current = true;
      form.reset(draft.values);
      setRestoredAt(draft.savedAt);
      setPendingDraft(null);
      window.setTimeout(() => {
        skipSaveRef.current = false;
      }, 0);
    },
    [form],
  );

  const discardDraft = useCallback(() => {
    skipSaveRef.current = true;
    form.reset(JSON.parse(defaultsJsonRef.current) as WorkOrderFormValues);
    clearDraft();
    window.setTimeout(() => {
      skipSaveRef.current = false;
    }, 0);
  }, [form, clearDraft]);

  // localStorage solo existe en el cliente: se lee después de montar.
  useEffect(() => {
    const draft = readDraft(key);
    if (!draft) {
      window.localStorage.removeItem(key);
      return;
    }
    if (JSON.stringify(draft.values) === defaultsJsonRef.current) {
      window.localStorage.removeItem(key);
      return;
    }
    if (mode === "create") {
      applyDraft(draft);
    } else {
      setPendingDraft(draft);
    }
    // Solo al montar: restaurar de nuevo pisaría lo que el usuario ya escribió.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const subscription = form.watch(() => {
      if (skipSaveRef.current) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const values = form.getValues();
        if (JSON.stringify(values) === defaultsJsonRef.current) {
          window.localStorage.removeItem(key);
          return;
        }
        const draft: WorkOrderDraft = {
          version: DRAFT_VERSION,
          savedAt: new Date().toISOString(),
          values,
        };
        try {
          window.localStorage.setItem(key, JSON.stringify(draft));
        } catch {
          // Sin espacio en localStorage: el formulario sigue funcionando igual.
        }
      }, SAVE_DEBOUNCE_MS);
    });
    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [form, key]);

  return { restoredAt, pendingDraft, applyDraft, discardDraft, clearDraft };
}
