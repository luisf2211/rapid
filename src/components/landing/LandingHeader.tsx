"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#talleres", label: "Para talleres" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-rapid-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] text-rapid-text-muted transition-colors hover:text-rapid-text"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/rastrear"
            className="text-[15px] text-rapid-text-muted transition-colors hover:text-rapid-text"
          >
            Seguir solicitud
          </Link>
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/login"
            className="text-[15px] font-medium text-rapid-text-muted transition-colors hover:text-rapid-text"
          >
            Soy un taller
          </Link>
          <Link
            href="/cotizar"
            className="btn-primary h-10 min-h-10 px-5 text-sm"
          >
            Pedir cotización
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-rapid-text md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-rapid-border bg-white md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4 sm:px-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-[15px] text-rapid-text-body hover:bg-rapid-surface-soft"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/rastrear"
            className="rounded-lg px-3 py-2.5 text-[15px] text-rapid-text-body hover:bg-rapid-surface-soft"
            onClick={() => setOpen(false)}
          >
            Seguir solicitud
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2.5 text-[15px] text-rapid-text-body hover:bg-rapid-surface-soft"
            onClick={() => setOpen(false)}
          >
            Soy un taller
          </Link>
          <div className="mt-3 border-t border-rapid-border pt-4">
            <Link
              href="/cotizar"
              className="btn-primary h-11 w-full text-sm"
              onClick={() => setOpen(false)}
            >
              Pedir cotización
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
