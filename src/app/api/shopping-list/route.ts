import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { NutritionPlanData, ShoppingCategory, ShoppingItem } from "@/types/database";

export const maxDuration = 30;

const CATEGORY_MAP: Record<string, string> = {
  proteina: "Proteínas",
  carboidrato: "Carboidratos",
  gordura: "Gorduras e Oleaginosas",
  vegetal: "Vegetais e Legumes",
  fruta: "Frutas",
  laticinios: "Laticínios",
  outro: "Outros",
};

// Preço estimado por 100g ou 100ml ou 1 unidade, em BRL
const PRICE_PER_UNIT: Record<string, { per: number; unit: "100g" | "100ml" | "und" }> = {
  proteina:    { per: 3.5,  unit: "100g"  },
  carboidrato: { per: 0.8,  unit: "100g"  },
  gordura:     { per: 2.5,  unit: "100g"  },
  vegetal:     { per: 0.9,  unit: "100g"  },
  fruta:       { per: 1.2,  unit: "100g"  },
  laticinios:  { per: 2.0,  unit: "100g"  },
  outro:       { per: 1.5,  unit: "100ml" },
};

interface ParsedQuantity {
  amount: number;
  unit: string; // normalized: g, ml, und, xíc, etc.
}

function parseQuantity(q: string): ParsedQuantity | null {
  const normalized = q.trim().toLowerCase();
  // Match: "150g", "3 und", "1.5kg", "200ml", "2L", "1 xíc", "3 fatias"
  const match = normalized.match(
    /^([\d.,]+)\s*(kg|g|ml|l|und\.?|unid\.?|un\.?|xíc\.?|xic\.?|fatia[s]?|porç[aã]o|copo[s]?|colher[es]?)/i
  );
  if (!match) return null;

  let amount = parseFloat(match[1].replace(",", "."));
  let unit = match[2].toLowerCase().replace(/\.$/, "");

  // Normalize aliases
  if (unit === "kg")  { amount *= 1000; unit = "g"; }
  if (unit === "l")   { amount *= 1000; unit = "ml"; }
  if (unit === "unid" || unit === "un") unit = "und";
  if (unit === "xic") unit = "xíc";
  if (unit === "copos") unit = "copo";
  if (unit === "fatias") unit = "fatia";

  return { amount, unit };
}

function formatQuantity(amount: number, unit: string): string {
  if (unit === "g" && amount >= 1000) {
    const kg = amount / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(1)}kg`;
  }
  if (unit === "ml" && amount >= 1000) {
    const L = amount / 1000;
    return `${Number.isInteger(L) ? L : L.toFixed(1)}L`;
  }
  const rounded = unit === "und" || unit === "fatia" || unit === "copo"
    ? Math.ceil(amount)
    : Math.round(amount);
  return `${rounded} ${unit}`;
}

function estimateCost(amount: number, unit: string, categoryKey: string): number {
  const price = PRICE_PER_UNIT[categoryKey];
  if (!price) return 2;

  if (price.unit === "100g" && unit === "g") {
    return (amount / 100) * price.per;
  }
  if (price.unit === "100ml" && unit === "ml") {
    return (amount / 100) * price.per;
  }
  if (price.unit === "und" && unit === "und") {
    return amount * price.per;
  }
  // Fallback: flat estimate
  return price.per * 2;
}

function aggregateShoppingList(
  planData: NutritionPlanData,
  multiplier: number
): ShoppingCategory[] {
  // key: "itemName||unit" → accumulated data
  const items: Record<string, {
    displayName: string;
    category: string;
    categoryKey: string;
    totalAmount: number;
    unit: string;
    unparsedCount: number;
  }> = {};

  for (const day of planData.days) {
    for (const meal of day.meals) {
      for (const item of meal.items) {
        const displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase();
        const parsed = parseQuantity(item.quantity);

        // Key by name + unit to handle same food in different units
        const unit = parsed?.unit ?? "und";
        const key = `${item.name.toLowerCase().trim()}||${unit}`;

        if (!items[key]) {
          items[key] = {
            displayName,
            category: CATEGORY_MAP[item.category] ?? "Outros",
            categoryKey: item.category,
            totalAmount: 0,
            unit,
            unparsedCount: 0,
          };
        }

        if (parsed) {
          items[key].totalAmount += parsed.amount;
        } else {
          items[key].unparsedCount += 1;
        }
      }
    }
  }

  // Group by category, apply multiplier
  const grouped: Record<string, ShoppingItem[]> = {};

  for (const data of Object.values(items)) {
    if (!grouped[data.category]) grouped[data.category] = [];

    const weeklyAmount = data.totalAmount > 0 ? data.totalAmount : data.unparsedCount;
    const totalAmount = weeklyAmount * multiplier;
    const quantityStr = formatQuantity(totalAmount, data.unit);
    const cost = estimateCost(weeklyAmount * multiplier, data.unit, data.categoryKey);

    grouped[data.category].push({
      name: data.displayName,
      quantity: quantityStr,
      checked: false,
      estimated_cost_brl: Math.round(cost * 100) / 100,
    });
  }

  // Sort categories in a logical order
  const categoryOrder = [
    "Proteínas", "Carboidratos", "Vegetais e Legumes",
    "Frutas", "Laticínios", "Gorduras e Oleaginosas", "Outros",
  ];

  return categoryOrder
    .filter((cat) => grouped[cat])
    .map((cat) => ({ category: cat, items: grouped[cat] }));
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
    const categories = aggregateShoppingList(planData, multiplier);
    const estimatedTotal = categories.reduce(
      (sum, cat) => sum + cat.items.reduce((s, i) => s + i.estimated_cost_brl, 0),
      0
    );

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const { data: list, error } = await supabase
      .from("shopping_lists")
      .upsert(
        {
          user_id: user.id,
          nutrition_plan_id: plan.id,
          week_start_date: weekStartStr,
          period_type,
          items: categories,
          estimated_total_brl: Math.round(estimatedTotal * 100) / 100,
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
