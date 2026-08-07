"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { TextInput } from "@/components/forms/TextInput";
import { insuranceCompanySchema, type InsuranceCompanyInput } from "@/lib/validations/insurance-company";
import { createInsuranceCompanyAction, updateInsuranceCompanyAction, toggleInsuranceCompanyAction } from "./actions";

type CompanyRow = { Id: number; Name: string; Rnc: string | null; Phone: string | null; Email: string | null; ContactName: string | null; Address: string | null; IsActive: boolean };

export function InsuranceCompaniesClient({ companies }: { companies: CompanyRow[] }) {
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const editingRow = typeof editing === "number" ? companies.find((c) => c.Id === editing) : null;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InsuranceCompanyInput>({
    resolver: zodResolver(insuranceCompanySchema),
    defaultValues: editingRow
      ? { name: editingRow.Name, rnc: editingRow.Rnc ?? "", phone: editingRow.Phone ?? "", email: editingRow.Email ?? "", contactName: editingRow.ContactName ?? "", address: editingRow.Address ?? "" }
      : { name: "", rnc: "", phone: "", email: "", contactName: "", address: "" },
  });

  const openNew = () => { reset({ name: "", rnc: "", phone: "", email: "", contactName: "", address: "" }); setEditing("new"); setError(null); };
  const openEdit = (row: CompanyRow) => { reset({ name: row.Name, rnc: row.Rnc ?? "", phone: row.Phone ?? "", email: row.Email ?? "", contactName: row.ContactName ?? "", address: row.Address ?? "" }); setEditing(row.Id); setError(null); };

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = editing === "new" ? await createInsuranceCompanyAction(data) : await updateInsuranceCompanyAction(editing as number, data);
      if (result.ok) setEditing(null); else setError(result.error);
    });
  });

  const handleToggle = (id: number, active: boolean) => { startTransition(async () => { await toggleInsuranceCompanyAction(id, !active); }); };

  return (
    <div className="space-y-4">
      {editing != null && (
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-lg">{editing === "new" ? "Nueva aseguradora" : "Editar aseguradora"}</h2>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextInput label="Nombre *" {...register("name")} error={errors.name?.message} />
              <TextInput label="RNC" {...register("rnc")} error={errors.rnc?.message} />
              <TextInput label="Telefono" {...register("phone")} error={errors.phone?.message} />
              <TextInput label="Email" type="email" {...register("email")} error={errors.email?.message} />
              <TextInput label="Contacto" {...register("contactName")} error={errors.contactName?.message} />
              <TextInput label="Direccion" {...register("address")} error={errors.address?.message} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={isPending}>{isPending ? "Guardando..." : "Guardar"}</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-rapid-border flex items-center justify-between">
          <h2 className="font-bold">Aseguradoras registradas</h2>
          <button type="button" className="btn-primary text-xs" onClick={openNew}><Plus className="w-4 h-4" /> Nueva</button>
        </div>
        {companies.length === 0 ? (
          <div className="p-8 text-center text-rapid-text-muted text-sm">No hay aseguradoras registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-rapid-text-muted bg-rapid-surface-soft">
                <tr>
                  <th className="text-left font-semibold px-5 py-3">Nombre</th>
                  <th className="text-left font-semibold px-5 py-3">RNC</th>
                  <th className="text-left font-semibold px-5 py-3 hidden md:table-cell">Telefono</th>
                  <th className="text-left font-semibold px-5 py-3 hidden lg:table-cell">Contacto</th>
                  <th className="text-center font-semibold px-5 py-3">Estado</th>
                  <th className="px-5 py-3 w-20" />
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.Id} className="border-t border-rapid-border">
                    <td className="px-5 py-3 font-medium">{c.Name}</td>
                    <td className="px-5 py-3 text-rapid-text-muted font-mono text-xs">{c.Rnc || "\u2014"}</td>
                    <td className="px-5 py-3 text-rapid-text-muted hidden md:table-cell">{c.Phone || "\u2014"}</td>
                    <td className="px-5 py-3 text-rapid-text-muted hidden lg:table-cell">{c.ContactName || "\u2014"}</td>
                    <td className="px-5 py-3 text-center">
                      <button type="button" onClick={() => handleToggle(c.Id, c.IsActive)} disabled={isPending} title={c.IsActive ? "Desactivar" : "Activar"}>
                        {c.IsActive ? <ToggleRight className="w-5 h-5 text-rapid-green" /> : <ToggleLeft className="w-5 h-5 text-rapid-text-muted" />}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => openEdit(c)} className="p-2 rounded-lg text-rapid-text-muted hover:bg-rapid-surface hover:text-rapid-text" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
