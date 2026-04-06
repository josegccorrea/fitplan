import type { Goal, ExperienceLevel, EquipmentType } from "./database";

export interface OnboardingFormData {
  // Step 1 — Dados corporais
  full_name: string;
  weight_kg: number;
  height_cm: number;
  age: number;
  sex: "masculino" | "feminino" | "outro";
  body_fat_pct: number;

  // Step 2 — Objetivo
  goal: Goal;

  // Step 3 — Experiência e equipamento
  experience_level: ExperienceLevel;
  equipment_type: EquipmentType;
  available_days_week: number;

  // Step 4 — Restrições
  allergies: string[];
  disliked_foods: string[];
  injuries: string;

  // Step 5 — Alimentos e orçamento
  must_have_foods: string[];
  monthly_budget_brl: number;

  // Step 6 — Preferência
  prefers_free_weights: boolean;
}

export const STEP_COUNT = 6;
