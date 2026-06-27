"use client";

import {
  forwardRef,
  useState,
  useTransition,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "../actions";
import { cn } from "@/lib/utils";

interface LoginFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leadingIcon: ReactNode;
  trailing?: ReactNode;
}

const LoginField = forwardRef<HTMLInputElement, LoginFieldProps>(
  function LoginField(
    { label, error, hint, leadingIcon, trailing, className, id, name, ...props },
    ref,
  ) {
    const fieldId = id ?? name;

    return (
      <div>
        <label
          htmlFor={fieldId}
          className="mb-1.5 block text-sm font-medium text-rapid-text"
        >
          {label}
        </label>
        <div className="relative">
          <span
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2",
              error ? "text-rapid-error" : "text-rapid-text-muted",
            )}
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
          <input
            ref={ref}
            id={fieldId}
            name={name}
            className={cn(
              "form-input h-14 w-full py-0 pl-11",
              trailing ? "pr-12" : "pr-3",
              error && "border-rapid-error focus:border-rapid-error",
              className,
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={
              error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
            }
            {...props}
          />
          {trailing ? (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {trailing}
            </div>
          ) : null}
        </div>
        {error ? (
          <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-rapid-error">
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-rapid-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rapid-error/25 bg-rapid-error/[0.06] px-3.5 py-3"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rapid-error" />
          <p className="text-sm leading-snug text-rapid-error">{error}</p>
        </div>
      )}

      <LoginField
        label="Correo electrónico"
        type="text"
        autoComplete="username"
        inputMode="email"
        placeholder="tu@correo.com"
        leadingIcon={<Mail className="h-[1.125rem] w-[1.125rem]" />}
        {...register("email")}
        error={errors.email?.message}
      />

      <LoginField
        label="Contraseña"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        leadingIcon={<Lock className="h-[1.125rem] w-[1.125rem]" />}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-rapid-text-muted transition-colors hover:bg-rapid-surface-soft hover:text-rapid-text"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? (
              <EyeOff className="h-[1.125rem] w-[1.125rem]" />
            ) : (
              <Eye className="h-[1.125rem] w-[1.125rem]" />
            )}
          </button>
        }
        {...register("password")}
        error={errors.password?.message}
      />

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary mt-1 h-12 w-full text-base shadow-[0_4px_14px_rgba(0,200,83,0.25)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,200,83,0.3)] disabled:shadow-none"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Entrando…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Iniciar sesión
          </>
        )}
      </button>
    </form>
  );
}
