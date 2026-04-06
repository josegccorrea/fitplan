"use client";

import { useState } from "react";
import type { OnboardingFormData } from "@/types/onboarding";
import type { ExperienceLevel, EquipmentType } from "@/types/database";

interface Props {
  defaultValues: Partial<OnboardingFormData>;
  onNext: (data: Partial<OnboardingFormData>) => void;
  onBack: () => void;
}

const levels: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "iniciante", label: "Iniciante", description: "0 a 1 ano de treino" },
  { value: "intermediario", label: "Intermediário", description: "1 a 3 anos de treino" },
  { value: "avancado", label: "Avançado", description: "3+ anos de treino consistente" },
];

const equipments: { value: EquipmentType; emoji: string; label: string; description: string }[] = [
  { value: "academia_maquinas", emoji: "🏋️", label: "Academia com Máquinas", description: "Leg press, peck deck, pulley, etc." },
  { value: "pesos_livres", emoji: "💪", label: "Pesos Livres", description: "Barras, halteres, kettlebells" },
  { value: "misto", emoji: "⚡", label: "Academia Mista", description: "Máquinas + pesos livres" },
  { value: "casa", emoji: "🏠", label: "Em Casa", description: "Sem equipamentos / peso corporal" },
  { value: "ao_ar_livre", emoji: "🌳", label: "Ao Ar Livre", description: "Parque, barras fixas, calçada" },
];

const WEEK_DAYS = [
  { index: 0, short: "Seg", full: "Segunda" },
  { index: 1, short: "Ter", full: "Terça" },
  { index: 2, short: "Qua", full: "Quarta" },
  { index: 3, short: "Qui", full: "Quinta" },
  { index: 4, short: "Sex", full: "Sexta" },
  { index: 5, short: "Sáb", full: "Sábado" },
  { index: 6, short: "Dom", full: "Domingo" },
];

const DEFAULT_TRAINING_DAYS = [1, 3, 5]; // Ter, Qui, Sáb

export function Step3Experience({ defaultValues, onNext, onBack }: Props) {
  const [level, setLevel] = useState<ExperienceLevel | null>(defaultValues.experience_level ?? null);
  const [equipment, setEquipment] = useState<EquipmentType | null>(defaultValues.equipment_type ?? null);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    defaultValues.training_days ?? DEFAULT_TRAINING_DAYS
  );
  const [errors, setErrors] = useState({ level: false, equipment: false, days: false });

  function toggleDay(index: number) {
    setSelectedDays((prev) => {
      if (prev.includes(index)) {
        if (prev.length <= 2) return prev; // mínimo 2 dias
        return prev.filter((d) => d !== index);
      } else {
        if (prev.length >= 6) return prev; // máximo 6 dias
        return [...prev, index].sort((a, b) => a - b);
      }
    });
    setErrors((e) => ({ ...e, days: false }));
  }

  function handleNext() {
    const errs = {
      level: !level,
      equipment: !equipment,
      days: selectedDays.length < 2,
    };
    setErrors(errs);
    if (errs.level || errs.equipment || errs.days) return;
    onNext({
      experience_level: level!,
      equipment_type: equipment!,
      training_days: selectedDays,
      available_days_week: selectedDays.length,
    });
  }

  return (
    <div className="slide-up space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground mb-1">Experiência e equipamentos</h2>
        <p className="text-sm text-muted-foreground">Seu nível define o volume e técnicas do treino.</p>
      </div>

      {/* Level */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Nível de experiência</label>
        <div className="space-y-2">
          {levels.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => { setLevel(l.value); setErrors(e => ({ ...e, level: false })); }}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                level === l.value ? "border-ember bg-ember/10" : "border-border bg-surface2 hover:border-border/60"
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-foreground">{l.label}</div>
                <div className="text-xs text-muted-foreground">{l.description}</div>
              </div>
              {level === l.value && <div className="w-4 h-4 rounded-full bg-ember" />}
            </button>
          ))}
        </div>
        {errors.level && <p className="text-xs text-destructive mt-1">Selecione seu nível</p>}
      </div>

      {/* Equipment */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Onde você treina?</label>
        <div className="grid grid-cols-1 gap-2">
          {equipments.map((eq) => (
            <button
              key={eq.value}
              type="button"
              onClick={() => { setEquipment(eq.value); setErrors(e => ({ ...e, equipment: false })); }}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                equipment === eq.value ? "border-ember bg-ember/10" : "border-border bg-surface2 hover:border-border/60"
              }`}
            >
              <span className="text-2xl">{eq.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{eq.label}</div>
                <div className="text-xs text-muted-foreground">{eq.description}</div>
              </div>
              {equipment === eq.value && <div className="w-4 h-4 rounded-full bg-ember flex-shrink-0" />}
            </button>
          ))}
        </div>
        {errors.equipment && <p className="text-xs text-destructive mt-1">Selecione onde treina</p>}
      </div>

      {/* Training Days */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">
          Quais dias você vai treinar?
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          {selectedDays.length} dia{selectedDays.length !== 1 ? "s" : ""} selecionado{selectedDays.length !== 1 ? "s" : ""} · mín. 2, máx. 6
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEK_DAYS.map((day) => {
            const isSelected = selectedDays.includes(day.index);
            return (
              <button
                key={day.index}
                type="button"
                onClick={() => toggleDay(day.index)}
                className={`flex flex-col items-center py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-ember border-ember text-white"
                    : "bg-surface2 border-border text-muted-foreground hover:border-ember/50"
                }`}
              >
                {day.short}
              </button>
            );
          })}
        </div>
        {errors.days && <p className="text-xs text-destructive mt-1">Selecione pelo menos 2 dias</p>}
      </div>

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
