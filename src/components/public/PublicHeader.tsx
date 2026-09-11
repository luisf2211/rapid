import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/** Header limpio estilo Airbnb para el portal público de clientes. */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rapid-border bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/rastrear"
            className="rounded-full px-3 py-2 text-sm font-medium text-rapid-text-body transition-colors hover:bg-rapid-surface-strong"
          >
            Seguir mi solicitud
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-rapid-border px-4 py-2 text-sm font-semibold text-rapid-text transition-colors hover:bg-rapid-surface-soft"
          >
            Soy un taller
          </Link>
        </div>
      </div>
    </header>
  );
}
