import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Profile, WorkoutPlan, NutritionPlan } from "@/types/database";

interface Props {
  params: Promise<{ userId: string }>;
}

const goalLabels: Record<string, string> = {
  perder_gordura: "Perder Gordura",
  ganhar_musculo: "Ganhar Músculo",
  manter: "Manutenção",
  performance: "Performance",
};

export default async function AdminUserPage({ params }: Props) {
  const { userId } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: workout }, { data: nutrition }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("workout_plans").select("*").eq("user_id", userId).eq("is_active", true).single(),
    supabase.from("nutrition_plans").select("*").eq("user_id", userId).eq("is_active", true).single(),
  ]);

  if (!profile) notFound();

  const p = profile as Profile;
  const wp = workout as WorkoutPlan | null;
  const np = nutrition as NutritionPlan | null;

  return (
    <div className="space-y-4">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="bg-surface2 border border-border rounded-xl p-4">
        <h2 className="font-display text-xl text-foreground mb-3">{p.full_name || "Sem nome"}</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["E-mail", p.email],
            ["Objetivo", p.goal ? goalLabels[p.goal] : "—"],
            ["Peso", p.weight_kg ? `${p.weight_kg}kg` : "—"],
            ["Altura", p.height_cm ? `${p.height_cm}cm` : "—"],
            ["Idade", p.age ? `${p.age} anos` : "—"],
            ["Nível", p.experience_level ?? "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-muted-foreground">{label}: </span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {wp && (
        <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">Plano de Treino</h3>
          </div>
          <div className="p-4 space-y-2">
            {wp.plan_data.days.map((day) => (
              <div key={day.day_index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{day.label}</span>
                <span className={`text-xs font-medium ${day.is_rest ? "text-muted-foreground" : "text-foreground"}`}>
                  {day.is_rest ? "Descanso" : `${day.focus} (${day.exercises.length} ex.)`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {np && (
        <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground">Plano Alimentar</h3>
            <p className="text-xs text-muted-foreground">
              {np.plan_data.daily_calories} kcal/dia · {np.plan_data.macros.protein_g}g proteína
            </p>
          </div>
          <div className="p-4 space-y-2">
            {np.plan_data.days.slice(0, 3).map((day) => (
              <div key={day.day_index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{day.label}</span>
                <span className="text-foreground">{day.total_calories} kcal · {day.meals.length} refeições</span>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">... e mais {np.plan_data.days.length - 3} dias</p>
          </div>
        </div>
      )}
    </div>
  );
}
