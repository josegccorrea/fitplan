import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <TopBar />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
