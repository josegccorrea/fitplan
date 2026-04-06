import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { buildPlanGenerationPrompt } from "@/lib/claude/prompts";
import { GeneratedPlansSchema } from "@/lib/claude/schemas";
import type { OnboardingFormData } from "@/types/onboarding";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

async function callClaude(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const textContent = message.content.find((c) => c.type === "text");
  return textContent?.text ?? "";
}

function extractJSON(text: string): unknown {
  // Try to find JSON object in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Nenhum JSON encontrado na resposta");
  return JSON.parse(jsonMatch[0]);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Check rate limiting (max 3 generations per day)
    const { data: profile } = await supabase
      .from("profiles")
      .select("generation_count")
      .eq("id", user.id)
      .single();

    if ((profile?.generation_count ?? 0) >= 10) {
      return NextResponse.json(
        { error: "Limite de gerações atingido (10). Tente novamente amanhã." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as OnboardingFormData;

    // Build prompt and call Claude
    const prompt = buildPlanGenerationPrompt(body);
    let rawResponse = await callClaude(prompt);

    // Parse and validate
    let parsed: unknown;
    try {
      parsed = extractJSON(rawResponse);
    } catch {
      // Retry once with correction hint
      const retryPrompt = `${prompt}\n\n⚠️ ATENÇÃO: Sua resposta anterior não era JSON válido. Responda APENAS com o JSON, sem nenhum texto antes ou depois.`;
      rawResponse = await callClaude(retryPrompt);
      parsed = extractJSON(rawResponse);
    }

    const validated = GeneratedPlansSchema.parse(parsed);

    // Save to Supabase inside a transaction-like sequence
    // Deactivate old plans
    await supabase
      .from("workout_plans")
      .update({ is_active: false })
      .eq("user_id", user.id);

    await supabase
      .from("nutrition_plans")
      .update({ is_active: false })
      .eq("user_id", user.id);

    // Insert new plans
    const { data: workoutPlan, error: wpError } = await supabase
      .from("workout_plans")
      .insert({
        user_id: user.id,
        plan_data: validated.workout_plan,
        is_active: true,
      })
      .select()
      .single();

    if (wpError) throw wpError;

    const { data: nutritionPlan, error: npError } = await supabase
      .from("nutrition_plans")
      .insert({
        user_id: user.id,
        plan_data: validated.nutrition_plan,
        is_active: true,
      })
      .select()
      .single();

    if (npError) throw npError;

    // Update profile with onboarding data and mark complete
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
        available_days_week: body.available_days_week,
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
    const message =
      error instanceof Error ? error.message : "Erro ao gerar plano";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
