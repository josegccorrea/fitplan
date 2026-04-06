import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildWorkoutPrompt, buildNutritionPrompt } from "@/lib/claude/prompts";
import { WorkoutPlanSchema, NutritionPlanSchema } from "@/lib/claude/schemas";
import type { OnboardingFormData } from "@/types/onboarding";

export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function callClaude(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8096,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = message.content.find((c) => c.type === "text");
  return textContent?.text ?? "";
}

function extractJSON(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON não encontrado na resposta");
  return JSON.parse(jsonMatch[0]);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("generation_count")
      .eq("id", user.id)
      .single();

    if ((profile?.generation_count ?? 0) >= 10) {
      return NextResponse.json(
        { error: "Limite de gerações atingido (10)." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as OnboardingFormData;

    // Chamada 1: plano de treino (~5-8s)
    const workoutRaw = await callClaude(buildWorkoutPrompt(body));
    const workoutParsed = extractJSON(workoutRaw) as { workout_plan: unknown };
    const validatedWorkout = WorkoutPlanSchema.parse(workoutParsed.workout_plan);

    // Chamada 2: plano alimentar (~5-8s)
    const nutritionRaw = await callClaude(buildNutritionPrompt(body));
    const nutritionParsed = extractJSON(nutritionRaw) as { nutrition_plan: unknown };
    const validatedNutrition = NutritionPlanSchema.parse(nutritionParsed.nutrition_plan);

    // Desativa planos antigos
    await supabase.from("workout_plans").update({ is_active: false }).eq("user_id", user.id);
    await supabase.from("nutrition_plans").update({ is_active: false }).eq("user_id", user.id);

    // Insere novos planos
    const { data: workoutPlan, error: wpError } = await supabase
      .from("workout_plans")
      .insert({ user_id: user.id, plan_data: validatedWorkout, is_active: true })
      .select()
      .single();

    if (wpError) throw wpError;

    const { data: nutritionPlan, error: npError } = await supabase
      .from("nutrition_plans")
      .insert({ user_id: user.id, plan_data: validatedNutrition, is_active: true })
      .select()
      .single();

    if (npError) throw npError;

    // Atualiza perfil
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: body.full_name,
        weight_kg: body.weight_kg,
        height_cm: body.height_cm,
        age: body.age,
        sex: body.sex,
        body_fat_pct: body.body_fat_pct,
        goal: body.goal,
        experience_level: body.experience_level,
        equipment_type: body.equipment_type,
        training_days: body.training_days ?? null,
        available_days_week: body.training_days?.length ?? body.available_days_week,
        allergies: body.allergies,
        disliked_foods: body.disliked_foods,
        injuries: body.injuries,
        must_have_foods: body.must_have_foods,
        monthly_budget_brl: body.monthly_budget_brl,
        prefers_free_weights: body.prefers_free_weights,
        onboarding_completed: true,
        generation_count: (profile?.generation_count ?? 0) + 1,
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      workout_plan_id: workoutPlan.id,
      nutrition_plan_id: nutritionPlan.id,
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    const message = error instanceof Error ? error.message : "Erro ao gerar plano";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
