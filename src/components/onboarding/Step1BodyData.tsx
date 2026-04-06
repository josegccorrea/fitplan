"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { OnboardingFormData } from "@/types/onboarding";

const schema = z.object({
  full_name: z.string().min(2, "Informe seu nome"),
  weight_kg: z.number().min(30, "Peso mínimo 30kg").max(300, "Peso máximo 300kg"),
  height_cm: z.number().min(100, "Altura mínima 100cm").max(250, "Altura máxima 250cm"),
  age: z.number().int().min(14, "Idade mínima 14 anos").max(90, "Idade máxima 90 anos"),
  sex: z.enum(["masculino", "feminino", "outro"]),
  body_fat_pct: z.number().min(3, "Mínimo 3%").max(60, "Máximo 60%"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues: Partial<OnboardingFormData>;
  onNext: (data: Partial<OnboardingFormData>) => void;
}

const sexOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
];

export function Step1BodyData({ defaultValues, onNext }: Props) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: defaultValues.full_name ?? "",
      weight_kg: defaultValues.weight_kg,
      height_cm: defaultValues.height_cm,
      age: defaultValues.age,
      sex: defaultValues.sex ?? "masculino",
      body_fat_pct: defaultValues.body_fat_pct,
    },
  });

  const selectedSex = watch("sex");

  return (
    <form onSubmit={handleSubmit(onNext)} className="slide-up space-y-6">
      <div>
        <h2 className="font-display text-2xl text-foreground mb-1">Dados corporais</h2>
        <p className="text-sm text-muted-foreground">
          A IA usa esses dados para calcular seu metabolismo e personalizar o plano.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Como você se chama?</label>
        <input
          {...register("full_name")}
          placeholder="Seu nome"
          className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
        />
        {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Peso (kg)</label>
          <input
            {...register("weight_kg", { valueAsNumber: true })}
            type="number"
            step="0.1"
            placeholder="75.0"
            inputMode="decimal"
            className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors font-mono"
          />
          {errors.weight_kg && <p className="text-xs text-destructive mt-1">{errors.weight_kg.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Altura (cm)</label>
          <input
            {...register("height_cm", { valueAsNumber: true })}
            type="number"
            placeholder="175"
            inputMode="numeric"
            className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors font-mono"
          />
          {errors.height_cm && <p className="text-xs text-destructive mt-1">{errors.height_cm.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Idade</label>
          <input
            {...register("age", { valueAsNumber: true })}
            type="number"
            placeholder="28"
            inputMode="numeric"
            className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors font-mono"
          />
          {errors.age && <p className="text-xs text-destructive mt-1">{errors.age.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">% Gordura (est.)</label>
          <input
            {...register("body_fat_pct", { valueAsNumber: true })}
            type="number"
            step="0.5"
            placeholder="20"
            inputMode="decimal"
            className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors font-mono"
          />
          {errors.body_fat_pct && <p className="text-xs text-destructive mt-1">{errors.body_fat_pct.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Sexo biológico</label>
        <div className="grid grid-cols-3 gap-2">
          {sexOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("sex", opt.value as "masculino" | "feminino" | "outro")}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                selectedSex === opt.value
                  ? "bg-ember border-ember text-white"
                  : "bg-surface2 border-border text-muted-foreground hover:border-ember/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface2 border border-border/50 rounded-xl p-3 text-xs text-muted-foreground">
        💡 Não sabe seu % de gordura? Use uma estimativa: homens magros ~12%, médios ~20%; mulheres magras ~20%, médias ~28%.
      </div>

      <button
        type="submit"
        className="w-full bg-ember hover:bg-ember-hover text-white font-semibold rounded-xl py-3 text-sm transition-colors"
      >
        Continuar →
      </button>
    </form>
  );
}
