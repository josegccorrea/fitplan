"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useStreak } from "@/lib/hooks/useStreak";

export function TopBar() {
  const { streak } = useStreak();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/treino" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ember flex items-center justify-center ember-glow">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display text-xl text-foreground tracking-wide">FitPlan</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 bg-surface2 border border-border rounded-full px-3 py-1.5">
          <Flame className={`w-3.5 h-3.5 ${streak > 0 ? "text-gold flame-pulse" : "text-muted-foreground"}`} />
          <span className={`text-xs font-mono font-bold ${streak > 0 ? "text-gold" : "text-muted-foreground"}`}>
            {streak} {streak === 1 ? "dia" : "dias"}
          </span>
        </div>
      </div>
    </header>
  );
}
