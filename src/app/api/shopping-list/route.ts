import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NutritionPlanData, ShoppingCategory, ShoppingItem } from "@/types/database";

const CATEGORY_MAP: Record<string, string> = {
  proteina: "Proteínas",
  carboidrato: "Carboidratos",
  gordura: "Gorduras e Oleaginosas",
  vegetal: "Vegetais e Legumes",
  fruta: "Frutas",
  laticinios: "Laticínios",
  outro: "Outros",
};

const PRICE_ESTIMATES: Record<string, number> = {
  proteina: 12,
  carboidrato: 4,
  gordura: 8,
  vegetal: 5,
  fruta: 6,
  laticinios: 9,
  outro: 6,
};

function aggregateShoppingList(
  planData: NutritionPlanData,
  multiplier: number
): ShoppingCategory[] {
  const items: Record<string, { category: string; quantities: string[]; priceEstimate: number }> = {};

  for (const day of planData.days) {
    for (const meal of day.meals) {
      for (const item of meal.items) {
        const key = item.name.toLowerCase().trim();
        if (!items[key]) {
          items[key] = {
            category: CATEGORY_MAP[item.category] ?? "Outros",
            quantities: [],
            priceEstimate: PRICE_ESTIMATES[item.category] ?? 6,
          };
        }
        items[key].quantities.push(item.quantity);
      }
    }
  }

  // Group by category
  const grouped: Record<string, ShoppingItem[]> = {};

  for (const [name, data] of Object.entries(items)) {
    if (!grouped[data.category]) grouped[data.category] = [];
    grouped[data.category].push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      quantity: `${multiplier}x semana`,
      checked: false,
      estimated_cost_brl: data.priceEstimate * multiplier,
    });
  }

  return Object.entries(grouped).map(([category, items]) => ({ category, items }));
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { period_type = "semanal" } = await request.json();
    const multiplier = period_type === "mensal" ? 4 : 1;

    // Get active nutrition plan
    const { data: plan } = await supabase
      .from("nutrition_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!plan) {
      return NextResponse.json({ error: "Plano alimentar não encontrado" }, { status: 404 });
    }

    const planData = plan.plan_data as NutritionPlanData;
    const items = aggregateShoppingList(planData, multiplier);
    const estimatedTotal = items.reduce(
      (sum, cat) => sum + cat.items.reduce((s, i) => s + i.estimated_cost_brl, 0),
      0
    );

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // Upsert shopping list
    const { data: list, error } = await supabase
      .from("shopping_lists")
      .upsert(
        {
          user_id: user.id,
          nutrition_plan_id: plan.id,
          week_start_date: weekStartStr,
          period_type,
          items,
          estimated_total_brl: estimatedTotal,
        },
        { onConflict: "user_id,week_start_date,period_type" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, list });
  } catch (error) {
    console.error("Error generating shopping list:", error);
    return NextResponse.json({ error: "Erro ao gerar lista" }, { status: 500 });
  }
}
