export type Role = "user" | "admin" | "trainer";
export type Goal = "perder_gordura" | "ganhar_musculo" | "manter" | "performance";
export type ExperienceLevel = "iniciante" | "intermediario" | "avancado";
export type EquipmentType =
  | "academia_maquinas"
  | "pesos_livres"
  | "casa"
  | "ao_ar_livre"
  | "misto";
export type FoodCategory =
  | "proteina"
  | "carboidrato"
  | "gordura"
  | "vegetal"
  | "fruta"
  | "laticinios"
  | "bebida"
  | "outro";
export type PeriodType = "semanal" | "mensal";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  role: Role;
  avatar_url: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  sex: "masculino" | "feminino" | "outro" | null;
  body_fat_pct: number | null;
  goal: Goal | null;
  experience_level: ExperienceLevel | null;
  equipment_type: EquipmentType | null;
  allergies: string[];
  disliked_foods: string[];
  injuries: string | null;
  available_days_week: number;
  training_days: number[] | null;
  must_have_foods: string[];
  monthly_budget_brl: number | null;
  prefers_free_weights: boolean;
  onboarding_completed: boolean;
  generation_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  is_active: boolean;
  plan_data: WorkoutPlanData;
  generated_at: string;
  created_at: string;
}

export interface NutritionPlan {
  id: string;
  user_id: string;
  is_active: boolean;
  plan_data: NutritionPlanData;
  generated_at: string;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id: string | null;
  day_index: number;
  session_date: string;
  completed: boolean;
  completed_at: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseSet {
  id: string;
  session_id: string;
  user_id: string;
  exercise_key: string;
  exercise_name: string;
  set_number: number;
  reps_performed: number | null;
  weight_kg: number | null;
  completed: boolean;
  notes: string | null; // JSON string para métricas de cardio: {"speed":6.5,"incline":8}
  logged_at: string;
}

export interface BodyWeightEntry {
  id: string;
  user_id: string;
  log_date: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  nutrition_plan_id: string | null;
  week_start_date: string;
  period_type: PeriodType;
  items: ShoppingCategory[];
  estimated_total_brl: number | null;
  created_at: string;
  updated_at: string;
}

// ── Plan JSON structures ──

export interface WorkoutPlanData {
  days: WorkoutDay[];
}

export interface WorkoutDay {
  day_index: number;
  label: string;
  focus: string;
  is_rest: boolean;
  rest_tip?: string;
  exercises: Exercise[];
}

export interface Exercise {
  exercise_key: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  technique_note: string;
  muscle_group: string;
  equipment: string;
}

export interface NutritionPlanData {
  daily_calories: number;
  macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  days: NutritionDay[];
}

export interface NutritionDay {
  day_index: number;
  label: string;
  total_calories: number;
  meals: Meal[];
}

export interface Meal {
  meal_key: string;
  name: string;
  time: string;
  total_calories: number;
  items: FoodItem[];
}

export interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  category: FoodCategory;
}

export interface ShoppingCategory {
  category: string;
  items: ShoppingItem[];
}

export interface ShoppingItem {
  name: string;
  quantity: string;
  checked: boolean;
  estimated_cost_brl: number;
}
