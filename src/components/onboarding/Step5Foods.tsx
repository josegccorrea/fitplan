"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { OnboardingFormData } from "@/types/onboarding";

const schema = z.object({
  monthly_budget_brl: z.number().min(200, "Mínimo R$ 200").max(10000, "Máximo R$ 10.000"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues: Partial<OnboardingFormData>;
  onNext: (data: Partial<OnboardingFormData>) => void;
  onBack: () => void;
}

const budgetPresets = [
  { label: "R$ 400", value: 400 },
  { label: "R$ 600", value: 600 },
  { label: "R$ 800", value: 800 },
  { label: "R$ 1.200", value: 1200 },
];

export function Step5Foods({ defaultValues, onNext, onBack }: Props) {
  const [mustHave, setMustHave] = useState<string[]>(defaultValues.must_have_foods ?? []);
  const [input, setInput] = useState("");

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { monthly_budget_brl: defaultValues.monthly_budget_brl ?? 600 },
  });

  const budget = watch("monthly_budget_brl");

  function addTag() {
    const t = input.trim();
    if (t && !mustHave.includes(t)) setMustHave(prev => [...prev, t]);
    setInput("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  }

  function onSubmit(data: FormData) {
    onNext({ must_have_foods: mustHave, monthly_budget_brl: data.monthly_budget_brl });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="slide-up space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground mb-1">Preferências alimentares</h2>
        <p className="text-sm text-muted-foreground">
          Informe o que não pode faltar no seu cardápio e seu orçamento mensal.
        </p>
      </div>

      {/* Must-have foods */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Alimentos que não podem faltar
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          A IA vai priorizar esses alimentos no seu cardápio. Deixe vazio se não tiver preferência.
        </p>
        <div className="bg-surface2 border border-border rounded-xl p-2 min-h-[52px] flex flex-wrap gap-1.5 focus-within:border-ember transition-colors">
          {mustHave.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-border/60 text-foreground text-xs rounded-lg px-2 py-1">
              {tag}
              <button type="button" onClick={() => setMustHave(prev => prev.filter(t => t !== tag))}>
                <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            onBlur={addTag}
            placeholder={mustHave.length === 0 ? "Ex: arroz, feijão, frango, ovos..." : ""}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Orçamento mensal com alimentação:{" "}
          <span className="text-ember font-mono">
            R$ {Number(budget || 0).toLocaleString("pt-BR")}
          </span>
        </label>
        <div className="flex gap-2 mb-3">
          {budgetPresets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setValue("monthly_budget_brl", p.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                Number(budget) === p.value
                  ? "bg-ember border-ember text-white"
                  : "bg-surface2 border-border text-muted-foreground hover:border-ember/50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          {...register("monthly_budget_brl", { valueAsNumber: true })}
          type="number"
          placeholder="Ou digite o valor"
          inputMode="numeric"
          className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors font-mono"
        />
        {errors.monthly_budget_brl && (
          <p className="text-xs text-destructive mt-1">{errors.monthly_budget_brl.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          ← Voltar
        </button>
        <button type="submit" className="flex-1 bg-ember hover:bg-ember-hover text-white font-semibold rounded-xl py-3 text-sm transition-colors">
          Continuar →
        </button>
      </div>
    </form>
  );
}
