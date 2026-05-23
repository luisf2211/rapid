"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Logo } from "./Logo";

export function MobileTopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-rapid-black text-white px-4 py-3 flex items-center justify-between border-b border-white/5">
      <Logo variant="dark" />
      <Link
        href="/work-orders/new"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rapid-green text-rapid-black font-semibold text-xs"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
        Nueva
      </Link>
    </header>
  );
}
