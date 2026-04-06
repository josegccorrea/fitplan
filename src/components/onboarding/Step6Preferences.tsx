"use client";

import { useState } from "react";
import { Dumbbell, Cpu } from "lucide-react";
import type { OnboardingFormData } from "@/types/onboarding";

interface Props {
  defaultValues: Partial<OnboardingFormData>;
  onFinish: (data: Partial<OnboardingFormData>) => void;
  onBack: () => void;
}

export function Step6Preferences({ defaultValues, onFinish, onBack }: Props) {
  const [prefersFree, setPrefersFree] = useState<boolean>(
    defaultValues.prefers_free_weights ?? true
  );

  return (
    <div className="slide-up space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground mb-1">Preferência de treino</h2>
        <p className="text-sm text-muted-foreground">
          Última etapa! Isso define quais exercícios a IA vai priorizar.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setPrefersFree(true)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
            prefersFree ? "border-ember bg-ember/10" : "border-border bg-surface2"
          }`}
        >
          <div className={`${prefersFree ? "text-ember" : "text-muted-foreground"}`}>
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Pesos Livres</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Barras, halteres e kettlebells. Mais funcional, maior amplitude de movimento.
            </div>
          </div>
          {prefersFree && <div className="ml-auto w-5 h-5 rounded-full bg-ember flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
        </button>

        <button
          type="button"
          onClick={() => setPrefersFree(false)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
            !prefersFree ? "border-ember bg-ember/10" : "border-border bg-surface2"
          }`}
        >
          <div className={`${!prefersFree ? "text-ember" : "text-muted-foreground"}`}>
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Máquinas</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Mais seguro para iniciantes, isola músculos com mais precisão.
            </div>
          </div>
          {!prefersFree && <div className="ml-auto w-5 h-5 rounded-full bg-ember flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
        </button>
      </div>

      <div className="bg-surface2 border border-border/50 rounded-xl p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          ✨ <strong className="text-foreground">Quase lá!</strong> Ao clicar em "Gerar Plano", nossa IA vai criar um plano de treino e alimentação 100% personalizado para você. O processo leva cerca de 30 segundos.
        </p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar
        </button>
        <button
          type="button"
          onClick={() => onFinish({ prefers_free_weights: prefersFree })}
          className="flex-[2] bg-ember hover:bg-ember-hover text-white font-bold rounded-xl py-3 text-sm transition-colors ember-glow"
        >
          ✨ Gerar Meu Plano
        </button>
      </div>
    </div>
  );
}
