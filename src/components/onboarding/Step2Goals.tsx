"use client";

import { useState } from "react";
import { TrendingDown, Dumbbell, Scale, Zap } from "lucide-react";
import type { OnboardingFormData } from "@/types/onboarding";
import type { Goal } from "@/types/database";

interface Props {
  defaultValues: Partial<OnboardingFormData>;
  onNext: (data: Partial<OnboardingFormData>) => void;
  onBack: () => void;
}

const goals: { value: Goal; icon: React.ReactNode; label: string; description: string; color: string }[] = [
  {
    value: "perder_gordura",
    icon: <TrendingDown className="w-6 h-6" />,
    label: "Perder Gordura",
    description: "Déficit calórico controlado, preservando massa magra",
    color: "text-chart-1",
  },
  {
    value: "ganhar_musculo",
    icon: <Dumbbell className="w-6 h-6" />,
    label: "Ganhar Músculo",
    description: "Superávit limpo para hipertrofia máxima",
    color: "text-chart-2",
  },
  {
    value: "manter",
    icon: <Scale className="w-6 h-6" />,
    label: "Manutenção",
    description: "Manter o corpo atual com mais saúde e força",
    color: "text-chart-3",
  },
  {
    value: "performance",
    icon: <Zap className="w-6 h-6" />,
    label: "Performance",
    description: "Foco em força, resistência e capacidade atlética",
    color: "text-chart-4",
  },
];

export function Step2Goals({ defaultValues, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<Goal | null>(defaultValues.goal ?? null);
  const [error, setError] = useState(false);

  function handleNext() {
    if (!selected) { setError(true); return; }
    onNext({ goal: selected });
  }

  return (
    <div className="slide-up space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground mb-1">Qual é seu objetivo?</h2>
        <p className="text-sm text-muted-foreground">
          A IA vai ajustar calorias, macros e volume de treino para o seu objetivo.
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <button
            key={goal.value}
            type="button"
            onClick={() => { setSelected(goal.value); setError(false); }}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              selected === goal.value
                ? "border-ember bg-ember/10"
                : "border-border bg-surface2 hover:border-border/80"
            }`}
          >
            <div className={`${goal.color} flex-shrink-0`}>{goal.icon}</div>
            <div>
              <div className={`font-semibold text-sm ${selected === goal.value ? "text-foreground" : "text-foreground"}`}>
                {goal.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{goal.description}</div>
            </div>
            {selected === goal.value && (
              <div className="ml-auto w-5 h-5 rounded-full bg-ember flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">Selecione um objetivo para continuar.</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar
        </button>
        <button type="button" onClick={handleNext} className="flex-1 bg-ember hover:bg-ember-hover text-white font-semibold rounded-xl py-3 text-sm transition-colors">
          Continuar →
        </button>
      </div>
    </div>
  );
}
