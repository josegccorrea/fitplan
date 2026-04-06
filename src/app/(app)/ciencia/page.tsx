"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SCIENCE_ARTICLES } from "@/lib/constants/science-content";
import { cn } from "@/lib/utils/cn";

type Category = "all" | "treino" | "nutricao" | "recuperacao" | "comportamento";

const categoryLabels: Record<string, string> = {
  all: "Todos",
  treino: "Treino",
  nutricao: "Nutrição",
  recuperacao: "Recuperação",
  comportamento: "Comportamento",
};

const colorMap: Record<string, string> = {
  ember: "border-ember text-ember bg-ember/5",
  gold: "border-gold text-gold bg-gold/5",
  success: "border-success text-success bg-success/5",
  "chart-4": "border-chart-4 text-chart-4 bg-chart-4/5",
};

export default function CienciaPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = activeCategory === "all"
    ? SCIENCE_ARTICLES
    : SCIENCE_ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="font-display text-2xl text-foreground">Base Científica</h1>
        <p className="text-xs text-muted-foreground">Síntese de 30+ estudos (2021–2025)</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {(Object.keys(categoryLabels) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              activeCategory === cat
                ? "bg-ember border-ember text-white"
                : "bg-surface2 border-border text-muted-foreground hover:border-ember/40"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-2.5">
        {filtered.map((article) => (
          <div
            key={article.id}
            className={cn(
              "rounded-xl border-l-4 bg-surface2 border-r border-t border-b border-r-border border-t-border border-b-border overflow-hidden",
              article.color === "ember" && "border-l-ember",
              article.color === "gold" && "border-l-gold",
              article.color === "success" && "border-l-success",
              article.color === "chart-4" && "border-l-chart-4"
            )}
          >
            <button
              className="w-full flex items-start gap-3 p-3.5 text-left"
              onClick={() => setOpenId(openId === article.id ? null : article.id)}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{article.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mb-1",
                  colorMap[article.color]?.split(" ")[1] ?? "text-ember"
                )}>
                  {categoryLabels[article.category]}
                </div>
                <div className="text-sm font-semibold text-foreground leading-tight">{article.title}</div>
                {openId !== article.id && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</div>
                )}
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 mt-1",
                openId === article.id && "rotate-180"
              )} />
            </button>

            {openId === article.id && (
              <div className="px-3.5 pb-3.5">
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{article.summary}</p>
                <div className={cn(
                  "rounded-lg p-3 text-xs leading-relaxed border",
                  colorMap[article.color] ?? colorMap.ember
                )}>
                  {article.detail}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
