import { z } from "zod";

const FoodCategoryEnum = z.enum([
  "proteina",
  "carboidrato",
  "gordura",
  "vegetal",
  "fruta",
  "laticinios",
  "bebida",
  "outro",
]).catch("outro");

const FoodItemSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  category: FoodCategoryEnum,
});

const MealSchema = z.object({
  meal_key: z.string(),
  name: z.string(),
  time: z.string(),
  total_calories: z.number(),
  items: z.array(FoodItemSchema),
});

const NutritionDaySchema = z.object({
  day_index: z.number().int().min(0).max(6),
  label: z.string(),
  total_calories: z.number(),
  meals: z.array(MealSchema),
});

export const NutritionPlanSchema = z.object({
  daily_calories: z.number(),
  macros: z.object({
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
  }),
  days: z.array(NutritionDaySchema).length(7),
});

const ExerciseSchema = z.object({
  exercise_key: z.string(),
  name: z.string(),
  sets: z.number().int().min(1),
  reps: z.string(),
  rest_seconds: z.number().int().min(0),
  technique_note: z.string().optional().default(""),
  muscle_group: z.string(),
  equipment: z.string().optional().default(""),
});

const WorkoutDaySchema = z.object({
  day_index: z.number().int().min(0).max(6),
  label: z.string(),
  focus: z.string(),
  is_rest: z.boolean(),
  rest_tip: z.string().nullable().optional(),
  exercises: z.array(ExerciseSchema),
});

export const WorkoutPlanSchema = z.object({
  days: z.array(WorkoutDaySchema).length(7),
});

export const GeneratedPlansSchema = z.object({
  workout_plan: WorkoutPlanSchema,
  nutrition_plan: NutritionPlanSchema,
});

export type GeneratedPlans = z.infer<typeof GeneratedPlansSchema>;
