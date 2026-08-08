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
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Brand panel — desktop */}
      <aside className="relative hidden overflow-hidden bg-[#0a0d0c] lg:flex lg:flex-col lg:justify-between">
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        {/* Glow accents */}
        <div
          className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-rapid-green/15 blur-[100px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-1/4 h-60 w-60 rounded-full bg-rapid-green/8 blur-[80px]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-10 p-10 xl:p-14">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-white/40 transition-colors hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al inicio
          </Link>

          <div className="space-y-6">
            <Logo variant="dark" />
            <div className="max-w-md space-y-3">
              <h1 className="text-2xl font-semibold tracking-[-0.02em] text-white xl:text-3xl">
                Tu taller, bajo control
              </h1>
              <p className="text-sm leading-relaxed text-white/50">
                Accede al panel operativo de Rapid para gestionar recepciones,
                cotizaciones, inventario y facturación desde cualquier
                dispositivo.
              </p>
            </div>
          </div>

          <ul className="max-w-lg space-y-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="flex gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rapid-green/10 text-rapid-green">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-white/45">{description}</p>
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
            <Logo variant="light" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-rapid-text-muted transition-colors hover:text-rapid-text"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Inicio
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-6 lg:px-12 xl:px-20">
          <div className="w-full max-w-[400px]">
            <div className="mb-8">
              <p className="mb-1.5 text-xs font-medium text-rapid-green">
                Acceso al sistema
              </p>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-rapid-text sm:text-2xl">
                Bienvenido de vuelta
              </h2>
              <p className="mt-1.5 text-sm text-rapid-text-muted">
                Ingresa tus credenciales para continuar.
              </p>
            </div>

            <div className="card p-6 sm:p-7">
              <Suspense
                fallback={
                  <div className="space-y-4 animate-pulse">
                    <div className="h-10 rounded-lg bg-rapid-surface-strong" />
                    <div className="h-10 rounded-lg bg-rapid-surface-strong" />
                    <div className="h-9 rounded-lg bg-rapid-surface-strong" />
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
            </div>

            <p className="mt-5 text-center text-xs text-rapid-text-muted">
              ¿Aún no tienes cuenta?{" "}
              <Link
                href="/#registro"
                className="font-medium text-rapid-green-dark transition-colors hover:text-rapid-green"
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
