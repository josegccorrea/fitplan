import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "user") redirect("/treino");

  return (
    <div className="min-h-dvh bg-background">
      <header className="bg-surface border-b border-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-foreground">FitPlan Admin</h1>
            <p className="text-xs text-muted-foreground">Painel de gerenciamento</p>
          </div>
          <span className="text-xs bg-ember/20 text-ember border border-ember/30 rounded-full px-2.5 py-1 font-semibold uppercase tracking-wide">
            {profile.role}
          </span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
