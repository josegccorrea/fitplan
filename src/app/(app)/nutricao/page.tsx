"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useNutritionPlan } from "@/lib/hooks/useNutritionPlan";
import { MacroRing } from "@/components/nutrition/MacroRing";
import { MealCard } from "@/components/nutrition/MealCard";
import { jsDayToIndex } from "@/lib/utils/formatters";

const DAY_LABELS_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function NutricaoPage() {
  const { plan, loading } = useNutritionPlan();
  const todayIndex = jsDayToIndex(new Date().getDay());
  const [activeDayIndex, setActiveDayIndex] = useState(todayIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-ember" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Nenhum plano alimentar encontrado.</p>
      </div>
    );
  }

  const { plan_data } = plan;
  const activeDay = plan_data.days.find((d) => d.day_index === activeDayIndex) ?? plan_data.days[0];

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Plano Alimentar</h1>
          <p className="text-xs text-muted-foreground">
            {plan_data.daily_calories} kcal/dia médio
          </p>
        </div>
        <Link
          href="/nutricao/lista-compras"
          className="flex items-center gap-1.5 bg-surface2 border border-border rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-ember/50 transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Lista
        </Link>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {plan_data.days.map((day) => (
          <button
            key={day.day_index}
            onClick={() => setActiveDayIndex(day.day_index)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              activeDayIndex === day.day_index
                ? "bg-ember border-ember text-white"
                : "bg-surface2 border-border text-muted-foreground hover:border-ember/40"
            }`}
          >
            {DAY_LABELS_SHORT[day.day_index]}
          </button>
        ))}
      </div>

      {/* Active day content */}
      {activeDay && (
        <div className="space-y-3">
          {/* Daily summary */}
          <div className="bg-surface2 border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-foreground text-sm">{activeDay.label}</h2>
                <p className="text-xs text-muted-foreground">{activeDay.total_calories} kcal no dia</p>
              </div>
            </div>
            <MacroRing
              calories={activeDay.total_calories}
              protein={activeDay.meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.protein_g, 0), 0)}
              carbs={activeDay.meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.carbs_g, 0), 0)}
              fat={activeDay.meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.fat_g, 0), 0)}
            />
          </div>

          {/* Meals */}
          {activeDay.meals.map((meal, i) => (
            <MealCard key={meal.meal_key} meal={meal} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
