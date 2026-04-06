"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import type { OnboardingFormData } from "@/types/onboarding";

interface Props {
  defaultValues: Partial<OnboardingFormData>;
  onNext: (data: Partial<OnboardingFormData>) => void;
  onBack: () => void;
}

function TagInput({
  label,
  placeholder,
  hint,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  hint: string;
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <p className="text-xs text-muted-foreground mb-2">{hint}</p>
      <div className="bg-surface2 border border-border rounded-xl p-2 min-h-[52px] flex flex-wrap gap-1.5 focus-within:border-ember transition-colors">
        {value.map((tag) => (
          <span key={tag} className="flex items-center gap-1 bg-border/60 text-foreground text-xs rounded-lg px-2 py-1">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}>
              <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
  );
}

export function Step4Restrictions({ defaultValues, onNext, onBack }: Props) {
  const [allergies, setAllergies] = useState<string[]>(defaultValues.allergies ?? []);
  const [disliked, setDisliked] = useState<string[]>(defaultValues.disliked_foods ?? []);
  const [injuries, setInjuries] = useState(defaultValues.injuries ?? "");

  function handleNext() {
    onNext({ allergies, disliked_foods: disliked, injuries });
  }

  return (
    <div className="slide-up space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground mb-1">Restrições</h2>
        <p className="text-sm text-muted-foreground">
          A IA vai evitar esses alimentos e adaptar o treino às suas limitações.
        </p>
      </div>

      <TagInput
        label="Alergias e intolerâncias"
        placeholder="Ex: glúten, lactose, amendoim..."
        hint="Pressione Enter ou vírgula para adicionar. Deixe vazio se não tiver."
        value={allergies}
        onChange={setAllergies}
      />

      <TagInput
        label="Alimentos que não gosta"
        placeholder="Ex: couve, fígado, atum..."
        hint="Esses alimentos não vão aparecer no seu cardápio."
        value={disliked}
        onChange={setDisliked}
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Lesões ou limitações físicas
        </label>
        <textarea
          value={injuries}
          onChange={(e) => setInjuries(e.target.value)}
          placeholder="Ex: dor no joelho esquerdo, hérnia lombar L4-L5... Deixe vazio se não tiver."
          rows={3}
          className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors resize-none"
        />
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
