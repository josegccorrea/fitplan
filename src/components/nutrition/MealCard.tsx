"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Meal } from "@/types/database";

interface Props {
  meal: Meal;
  defaultOpen?: boolean;
}

const categoryColors: Record<string, string> = {
  proteina: "text-ember",
  carboidrato: "text-gold",
  gordura: "text-chart-4",
  vegetal: "text-chart-3",
  fruta: "text-chart-2",
  laticinios: "text-chart-5",
  outro: "text-muted-foreground",
};

const mealEmojis: Record<string, string> = {
  cafe_da_manha: "☕",
  almoco: "🍽️",
  lanche: "🍎",
  jantar: "🌙",
  ceia: "🌛",
  pre_treino: "⚡",
  pos_treino: "💪",
};

export function MealCard({ meal, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const emoji = mealEmojis[meal.meal_key] ?? "🥗";

  const totalProtein = meal.items.reduce((sum, i) => sum + i.protein_g, 0);
  const totalCarbs = meal.items.reduce((sum, i) => sum + i.carbs_g, 0);
  const totalFat = meal.items.reduce((sum, i) => sum + i.fat_g, 0);

  return (
    <div className={cn("rounded-xl border overflow-hidden", open ? "border-ember/30" : "border-border")}>
      <button
        className="w-full flex items-center gap-3 p-3.5 text-left bg-surface2 hover:bg-surface2/80 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-xl flex-shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{meal.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {meal.time} · {meal.total_calories} kcal
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs font-mono text-ember">{Math.round(totalProtein)}g P</span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="bg-background/50 px-3.5 pb-3.5 pt-2">
          <ul className="space-y-1.5 mb-3">
            {meal.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={cn("text-xs mt-0.5 flex-shrink-0", categoryColors[item.category] ?? "text-muted-foreground")}>▸</span>
                <div className="flex-1">
                  <span className="text-foreground">{item.name}</span>
                  <span className="text-muted-foreground ml-1.5 text-xs">{item.quantity}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{item.calories}kcal</span>
              </li>
            ))}
          </ul>

          {/* Macro summary */}
          <div className="flex gap-2 pt-2 border-t border-border">
            {[
              { label: "Prot", val: Math.round(totalProtein), color: "text-ember" },
              { label: "Carb", val: Math.round(totalCarbs), color: "text-gold" },
              { label: "Gord", val: Math.round(totalFat), color: "text-chart-4" },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex-1 bg-surface2 rounded-lg p-2 text-center">
                <div className={cn("text-xs font-mono font-bold", color)}>{val}g</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
