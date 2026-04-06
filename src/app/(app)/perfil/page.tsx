"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, RefreshCw, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const goalLabels: Record<string, string> = {
  perder_gordura: "Perder Gordura",
  ganhar_musculo: "Ganhar Músculo",
  manter: "Manutenção",
  performance: "Performance",
};

const levelLabels: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data as Profile);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleRegeneratePlan() {
    const supabase = createClient();
    await supabase.from("profiles").update({ onboarding_completed: false }).eq("id", profile!.id);
    router.push("/onboarding/step/1");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-ember" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="font-display text-2xl text-foreground">Perfil</h1>
        <p className="text-xs text-muted-foreground">{profile.email}</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-surface2 border border-border rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-ember/20 border border-ember/30 flex items-center justify-center">
          <User className="w-6 h-6 text-ember" />
        </div>
        <div>
          <div className="font-semibold text-foreground">{profile.full_name || "Usuário"}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {profile.goal ? goalLabels[profile.goal] : "—"} · {profile.experience_level ? levelLabels[profile.experience_level] : "—"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Peso", value: profile.weight_kg ? `${profile.weight_kg}kg` : "—" },
          { label: "Altura", value: profile.height_cm ? `${profile.height_cm}cm` : "—" },
          { label: "Idade", value: profile.age ? `${profile.age} anos` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface2 border border-border rounded-xl p-3 text-center">
            <div className="font-mono font-bold text-foreground text-sm">{value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Plano info */}
      <div className="bg-surface2 border border-border rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Seu Plano Atual</h3>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Objetivo</span>
            <span className="text-foreground">{profile.goal ? goalLabels[profile.goal] : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Nível</span>
            <span className="text-foreground">{profile.experience_level ? levelLabels[profile.experience_level] : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span>Dias/semana</span>
            <span className="text-foreground">{profile.available_days_week}x por semana</span>
          </div>
          <div className="flex justify-between">
            <span>Orçamento alimentar</span>
            <span className="text-foreground">
              {profile.monthly_budget_brl ? `R$ ${profile.monthly_budget_brl}/mês` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={handleRegeneratePlan}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-ember/40 bg-ember/10 text-ember font-semibold text-sm hover:bg-ember/20 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Regenerar Meu Plano com IA
      </button>

      <div className="bg-surface2 border border-border/50 rounded-xl p-3 text-xs text-muted-foreground">
        Você pode regenerar seu plano a qualquer momento para ajustar com novas metas, peso ou condições físicas.
        {profile.generation_count > 0 && ` (${profile.generation_count} geração${profile.generation_count > 1 ? "ções" : ""} feita${profile.generation_count > 1 ? "s" : ""})`}
      </div>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 font-medium text-sm transition-colors"
      >
        {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        Sair da conta
      </button>
    </div>
  );
}
