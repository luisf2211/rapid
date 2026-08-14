"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { TextInput } from "@/components/forms/TextInput";
import { QUOTATION_LABOR_AREAS } from "@/lib/constants";
import {
  quotationTaskTypeSchema,
  type QuotationTaskTypeInput,
} from "@/lib/validations/quotation-task-type";
import {
  createQuotationTaskTypeAction,
  updateQuotationTaskTypeAction,
  toggleQuotationTaskTypeAction,
} from "./actions";

type TaskRow = { Id: number; Name: string; IsActive: boolean };

export function LaborTasksClient({ tasks }: { tasks: TaskRow[] }) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<QuotationTaskTypeInput>({
      resolver: zodResolver(quotationTaskTypeSchema),
      defaultValues: { name: "" },
    });

  const openNew = () => { reset({ name: "" }); setEditing("new"); setError(null); };
  const openEdit = (row: TaskRow) => { reset({ name: row.Name }); setEditing(row.Id); setError(null); };

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = editing === "new"
        ? await createQuotationTaskTypeAction(data)
        : await updateQuotationTaskTypeAction(editing as number, data);
      if (result.ok) setEditing(null); else setError(result.error);
    });
  });

  const handleToggle = (id: number, active: boolean) => {
    startTransition(async () => { await toggleQuotationTaskTypeAction(id, !active); });
  };

  return (
    <div className="space-y-4">
      {editing != null && (
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-lg">{editing === "new" ? "Nueva tarea" : "Editar tarea"}</h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <form onSubmit={onSubmit} className="space-y-4">
            <TextInput label="Nombre *" placeholder="Ej. Pulido de faros" {...register("name")} error={errors.name?.message} />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? "Guardando..." : "Guardar"}</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-rapid-border flex items-center justify-between">
          <h2 className="font-bold">Tareas del taller</h2>
          <button type="button" className="btn-primary text-xs" onClick={openNew}><Plus className="w-4 h-4" /> Nueva</button>
        </div>
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-rapid-text-muted text-sm">
            No hay tareas personalizadas. Agrega las que use tu taller además de las estándar.
          </div>
        ) : (
          <ul>
            {tasks.map((t) => (
              <li key={t.Id} className="border-t border-rapid-border first:border-t-0 px-5 py-3 flex items-center justify-between gap-3">
                <span className={`font-medium text-sm ${t.IsActive ? "" : "text-rapid-text-muted line-through"}`}>
                  {t.Name}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => openEdit(t)} className="p-2 rounded-lg text-rapid-text-muted hover:bg-rapid-surface hover:text-rapid-text" title="Editar">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => handleToggle(t.Id, t.IsActive)} disabled={isPending} className="p-2" title={t.IsActive ? "Desactivar" : "Activar"}>
                    {t.IsActive ? <ToggleRight className="w-5 h-5 text-rapid-green" /> : <ToggleLeft className="w-5 h-5 text-rapid-text-muted" />}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-3">
          Tareas estándar (siempre disponibles)
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUOTATION_LABOR_AREAS.map((a) => (
            <span key={a.value} className="text-xs px-3 py-1.5 rounded-full bg-rapid-surface border border-rapid-border text-rapid-text-muted">
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
