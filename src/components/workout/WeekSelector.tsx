"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { getDayShortName } from "@/lib/utils/formatters";
import type { WorkoutDay } from "@/types/database";

interface Props {
  days: WorkoutDay[];
  activeDayIndex: number;
}

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function WeekSelector({ days, activeDayIndex }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {days.map((day) => {
        const isActive = day.day_index === activeDayIndex;
        const isRest = day.is_rest;

        return (
          <Link
            key={day.day_index}
            href={`/treino/${day.day_index}`}
            className={cn(
              "flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all",
              isActive
                ? "border-ember bg-ember/10"
                : isRest
                ? "border-border bg-surface2/50"
                : "border-border bg-surface2"
            )}
          >
            <span className={cn(
              "text-[10px] font-bold tracking-widest uppercase",
              isActive ? "text-ember" : "text-muted-foreground"
            )}>
              {DAY_LABELS[day.day_index]}
            </span>
            <span className={cn(
              "text-xs font-semibold",
              isActive ? "text-ember" : isRest ? "text-muted-foreground/60" : "text-foreground"
            )}>
              {isRest ? "🌿" : getDayShortName(day.day_index)}
            </span>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              isRest ? "bg-transparent" : isActive ? "bg-ember" : "bg-muted-foreground/40"
            )} />
          </Link>
        );
      })}
    </div>
  );
}
