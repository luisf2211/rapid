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
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-rapid-border bg-white/95 backdrop-blur-md px-4 py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <MobileMenu />
        {workshop?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={workshop.logoUrl}
            alt={workshop.businessName ?? "Logo"}
            className="w-7 h-7 rounded-lg object-contain shrink-0"
          />
        ) : (
          <Logo variant="light" compact />
        )}
        <span className="font-semibold text-sm text-rapid-text truncate">
          {workshop?.businessName || "Rapid"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {stockAlertCount > 0 && (
          <Link
            href="/inventory?filter=low"
            className="flex h-8 items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 text-amber-700 text-xs font-semibold border border-amber-200"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{stockAlertCount > 99 ? "99+" : stockAlertCount}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
