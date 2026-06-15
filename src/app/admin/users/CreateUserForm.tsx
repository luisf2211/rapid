"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, AlertCircle } from "lucide-react";
import {
  createUserSchema,
} from "@/lib/validations/auth";
import { USER_ROLE_LABELS } from "@/lib/auth/constants";
import { TextInput } from "@/components/forms/TextInput";
import { createUserAction } from "../actions";

type CompanyOption = { id: number; name: string };

export function CreateUserForm({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      companyId: companies[0]?.id ?? 0,
      email: "",
      password: "",
      fullName: "",
      role: "COMPANY_USER",
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = await createUserAction(data);
      if (result.ok) {
        router.refresh();
        form.reset({
          companyId: data.companyId,
          email: "",
          password: "",
          fullName: "",
          role: "COMPANY_USER",
        });
      } else {
        setError(result.error);
      }
    });
  });

  if (companies.length === 0) {
    return (
      <div className="card p-5 text-sm text-rapid-text-muted">
        Crea una empresa antes de registrar usuarios.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <h2 className="font-bold text-lg">Nuevo usuario</h2>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}
      <div>
        <label className="form-label">Empresa *</label>
        <select className="form-input" {...register("companyId")}>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Correo"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <TextInput
          label="Contraseña temporal"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
        <TextInput label="Nombre completo" {...register("fullName")} />
        <div>
          <label className="form-label">Rol</label>
          <select className="form-input" {...register("role")}>
            <option value="COMPANY_USER">{USER_ROLE_LABELS.COMPANY_USER}</option>
            <option value="COMPANY_ADMIN">{USER_ROLE_LABELS.COMPANY_ADMIN}</option>
          </select>
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        <Save className="w-4 h-4" />
        {isPending ? "Guardando..." : "Crear usuario"}
      </button>
    </form>
  );
}
