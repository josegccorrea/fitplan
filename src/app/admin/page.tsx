import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Dumbbell } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, goal, experience_level, onboarding_completed, created_at, weight_kg")
    .order("created_at", { ascending: false })
    .limit(100);

  const users = profiles ?? [];
  const completed = users.filter((u) => u.onboarding_completed).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total usuários", value: users.length, icon: Users, color: "text-ember" },
          { label: "Com plano ativo", value: completed, icon: Dumbbell, color: "text-success" },
          { label: "Sem onboarding", value: users.length - completed, icon: Users, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface2 border border-border rounded-xl p-3 text-center">
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <div className="font-mono text-xl font-bold text-foreground">{value}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-foreground">Usuários</h2>
        </div>
        <div className="divide-y divide-border">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/admin/usuario/${user.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-ember/20 border border-ember/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-ember">
                  {(user.full_name || user.email)[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {user.full_name || "Sem nome"}
                </div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {user.onboarding_completed ? (
                  <span className="text-[10px] font-semibold bg-success/20 text-success border border-success/30 rounded-full px-2 py-0.5">
                    Ativo
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5">
                    Pendente
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
