import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

interface Props {
  stockAlertCount?: number;
  workshop?: {
    businessName: string | null;
    logoUrl: string | null;
  };
}

export function MobileTopBar({ stockAlertCount = 0, workshop }: Props) {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0c100f] px-4 py-3.5 text-white">
      <div className="flex items-center gap-2.5 min-w-0">
        <MobileMenu />
        {workshop?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={workshop.logoUrl}
            alt={workshop.businessName ?? "Logo"}
            className="w-8 h-8 rounded-lg object-contain shrink-0"
          />
        ) : (
          <Logo variant="dark" compact />
        )}
        <span className="font-bold text-sm text-white truncate">
          {workshop?.businessName || "Rapid"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Link
          href="/guia"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white/70 hover:bg-white/10 hover:text-white transition"
          aria-label="Guía rápida"
        >
          <CircleHelp className="w-5 h-5" strokeWidth={2} />
        </Link>
        {stockAlertCount > 0 && (
          <Link
            href="/inventory?filter=low"
            className="flex h-10 items-center gap-1.5 rounded-xl bg-amber-500/15 px-3 text-amber-200 text-xs font-semibold ring-1 ring-amber-500/25"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{stockAlertCount > 99 ? "99+" : stockAlertCount}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
