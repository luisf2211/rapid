"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, AlertCircle } from "lucide-react";
import {
  createCompanySchema,
  type CreateCompanyInput,
} from "@/lib/validations/auth";
import { TextInput } from "@/components/forms/TextInput";
import { createCompanyAction } from "../actions";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCompanyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      slug: "",
      adminEmail: "",
      adminPassword: "",
      adminFullName: "",
    },
  });

  const { register, handleSubmit, setValue, watch } = form;
  const name = watch("name");

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = await createCompanyAction(data);
      if (result.ok) {
        router.refresh();
        form.reset();
      } else {
        setError(result.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="card p-5 space-y-4">
      <h2 className="font-bold text-lg">Nueva empresa / taller</h2>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}
      <TextInput
        label="Nombre del taller"
        {...register("name", {
          onChange: (e) => {
            const currentSlug = form.getValues("slug");
            if (!currentSlug) setValue("slug", slugify(e.target.value));
          },
        })}
        error={form.formState.errors.name?.message}
      />
      <TextInput
        label="Identificador (slug)"
        hint="Solo minúsculas y guiones. Ej: taller-norte"
        {...register("slug")}
        error={form.formState.errors.slug?.message}
      />
      <div className="border-t border-rapid-border pt-4">
        <p className="text-sm font-semibold mb-3">Usuario administrador inicial</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="Correo"
            type="email"
            {...register("adminEmail")}
            error={form.formState.errors.adminEmail?.message}
          />
          <TextInput
            label="Contraseña temporal"
            type="password"
            {...register("adminPassword")}
            error={form.formState.errors.adminPassword?.message}
          />
          <TextInput
            label="Nombre completo"
            containerClassName="sm:col-span-2"
            {...register("adminFullName")}
          />
        </div>
      </div>
      <button type="submit" disabled={isPending} className="btn-primary">
        <Save className="w-4 h-4" />
        {isPending ? "Guardando..." : "Crear empresa"}
      </button>
      {name && (
        <p className="text-xs text-rapid-text-muted">
          Se creará la empresa, su configuración de taller y el usuario admin.
        </p>
      )}
    </form>
  );
}
