import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-rapid-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileTopBar />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 pb-24 lg:pb-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
