import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowLeft,
  BarChart3,
  Car,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "./LoginForm";

const highlights = [
  {
    icon: Car,
    title: "Recepción y seguimiento",
    description: "Órdenes, fotos y estado del vehículo en un solo lugar.",
  },
  {
    icon: Wrench,
    title: "Operación del taller",
    description: "Cotizaciones, materiales y mano de obra conectados.",
  },
  {
    icon: BarChart3,
    title: "Visión en tiempo real",
    description: "Pipeline, alertas y métricas para decidir más rápido.",
  },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Brand panel — desktop */}
      <aside className="relative hidden overflow-hidden bg-rapid-black lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-rapid-green/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-rapid-green/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-10 p-10 xl:p-14">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="space-y-6">
            <Logo variant="dark" />
            <div className="max-w-md space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-white xl:text-4xl">
                Tu taller, bajo control
              </h1>
              <p className="text-base leading-relaxed text-slate-400">
                Accede al panel operativo de Rapid para gestionar recepciones,
                cotizaciones, inventario y facturación desde cualquier
                dispositivo.
              </p>
            </div>
          </div>

          <ul className="max-w-lg space-y-4">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rapid-green/15 text-rapid-green">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-400">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col bg-rapid-bg">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo variant="dark" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-rapid-text-muted transition-colors hover:text-rapid-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-6 lg:px-12 xl:px-20">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 lg:mb-10">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-rapid-green">
                Acceso al sistema
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-rapid-text sm:text-3xl">
                Bienvenido de vuelta
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-rapid-text-muted sm:text-base">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            <div className="rounded-2xl border border-rapid-border bg-rapid-surface p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-8">
              <Suspense
                fallback={
                  <div className="space-y-4 animate-pulse">
                    <div className="h-14 rounded-lg bg-rapid-surface-soft" />
                    <div className="h-14 rounded-lg bg-rapid-surface-soft" />
                    <div className="h-12 rounded-lg bg-rapid-surface-soft" />
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
            </div>

            <p className="mt-6 text-center text-sm text-rapid-text-muted">
              ¿Aún no tienes cuenta?{" "}
              <Link
                href="/#registro"
                className="font-medium text-rapid-green transition-colors hover:text-rapid-green-dark"
              >
                Registrar tu taller
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
