import Link from "next/link";
import { Building2, LogOut, Users } from "lucide-react";
import { requirePlatformAdmin } from "@/lib/auth/guards";
import { logoutAction } from "@/app/(auth)/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePlatformAdmin();

  return (
    <div className="min-h-screen bg-rapid-bg">
      <header className="border-b border-rapid-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-rapid-green-dark">
              Rapid Admin
            </p>
            <p className="text-sm text-rapid-text-muted">
              {session.fullName ?? session.email}
            </p>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/admin" className="btn-secondary text-sm">
              Panel
            </Link>
            <Link href="/admin/companies" className="btn-secondary text-sm">
              <Building2 className="w-4 h-4" /> Empresas
            </Link>
            <Link href="/admin/users" className="btn-secondary text-sm">
              <Users className="w-4 h-4" /> Usuarios
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary text-sm">
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
