import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/** Header limpio para las páginas públicas (cliente y taller). */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-rapid-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-5 sm:gap-6">
          <Link
            href="/talleres"
            className="hidden text-[15px] text-rapid-text-muted transition-colors hover:text-rapid-text sm:inline"
          >
            Talleres
          </Link>
          <Link
            href="/rastrear"
            className="hidden text-[15px] text-rapid-text-muted transition-colors hover:text-rapid-text sm:inline"
          >
            Seguir mi solicitud
          </Link>
          <Link
            href="/registrar-taller"
            className="text-[15px] font-medium text-rapid-text-muted transition-colors hover:text-rapid-text"
          >
            Soy un taller
          </Link>
          <Link href="/cotizar" className="btn-primary h-10 min-h-10 px-5 text-sm">
            Cotizar
          </Link>
        </div>
      </div>
    </header>
  );
}
