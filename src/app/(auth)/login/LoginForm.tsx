"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, AlertCircle } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "../actions";
import { TextInput } from "@/components/forms/TextInput";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(data, nextPath);
      if (result.ok) {
        router.push(result.redirectTo);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rapid-error/20 bg-rapid-error/5 p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-rapid-error shrink-0" />
          <p className="text-sm text-rapid-error">{error}</p>
        </div>
      )}

      <TextInput
        label="Correo electrónico"
        type="text"
        autoComplete="username"
        placeholder="admin o usuario@taller.com"
        {...register("email")}
        error={errors.email?.message}
      />

      <TextInput
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        {...register("password")}
        error={errors.password?.message}
      />

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        <LogIn className="w-4 h-4" />
        {isPending ? "Entrando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
