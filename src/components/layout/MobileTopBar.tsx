import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "./Logo";

interface Props {
  stockAlertCount?: number;
}

export function MobileTopBar({ stockAlertCount = 0 }: Props) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-rapid-black text-white px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
      <Logo variant="dark" />
      {stockAlertCount > 0 && (
        <Link
          href="/inventory?filter=low"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-100 text-xs font-semibold"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{stockAlertCount > 99 ? "99+" : stockAlertCount}</span>
        </Link>
      )}
    </header>
  );
}
