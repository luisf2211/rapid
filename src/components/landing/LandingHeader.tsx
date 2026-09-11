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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-rapid-border bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-rapid-text-body transition-colors hover:text-rapid-text"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/rastrear"
            className="text-sm font-medium text-rapid-text-body transition-colors hover:text-rapid-text"
          >
            Seguir solicitud
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-rapid-border px-4 py-2 text-sm font-semibold text-rapid-text transition-colors hover:bg-rapid-surface-soft"
          >
            Soy un taller
          </Link>
          <Link href="/cotizar" className="btn-primary h-10 min-h-10 px-4 text-sm">
            Solicitar cotización
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
        <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-rapid-text-body hover:bg-rapid-surface-soft"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/rastrear"
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-rapid-text-body hover:bg-rapid-surface-soft"
            onClick={() => setOpen(false)}
          >
            Seguir solicitud
          </Link>
          <div className="mt-3 flex flex-col gap-2 border-t border-rapid-border pt-4">
            <Link
              href="/login"
              className="btn-secondary h-11 w-full text-sm"
              onClick={() => setOpen(false)}
            >
              Soy un taller
            </Link>
            <Link
              href="/cotizar"
              className="btn-primary h-11 w-full text-sm"
              onClick={() => setOpen(false)}
            >
              Solicitar cotización
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
