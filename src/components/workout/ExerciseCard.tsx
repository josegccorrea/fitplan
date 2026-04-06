"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RestTimer } from "./RestTimer";
import type { Exercise } from "@/types/database";

interface Props {
  exercise: Exercise;
  index: number;
  getSet: (exerciseKey: string, setNumber: number) => { weight_kg: string; reps_performed: string; completed: boolean };
  updateSetLocal: (exerciseKey: string, setNumber: number, field: "weight_kg" | "reps_performed", value: string) => void;
  logSet: (exerciseKey: string, exerciseName: string, setNumber: number, weightKg: string, reps: string) => Promise<void>;
  isComplete: boolean;
}

export function ExerciseCard({ exercise, index, getSet, updateSetLocal, logSet, isComplete }: Props) {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<{ restSeconds: number } | null>(null);

  async function handleCompleteSet(setNumber: number) {
    const s = getSet(exercise.exercise_key, setNumber);
    await logSet(exercise.exercise_key, exercise.name, setNumber, s.weight_kg, s.reps_performed);
    setTimer({ restSeconds: exercise.rest_seconds });
  }

  return (
    <>
      {timer && (
        <RestTimer
          seconds={timer.restSeconds}
          onDone={() => setTimer(null)}
          onSkip={() => setTimer(null)}
        />
      )}

      <div className={cn(
        "rounded-xl border overflow-hidden transition-all",
        isComplete ? "border-success/40 bg-success/5" : "border-border bg-surface2"
      )}>
        {/* Header */}
        <button
          className="w-full flex items-center gap-3 p-3.5 text-left"
          onClick={() => setOpen(!open)}
        >
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold",
            isComplete ? "bg-success/20 text-success" : "bg-surface text-ember"
          )}>
            {isComplete ? "✓" : index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{exercise.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {exercise.sets}× {exercise.reps} · {exercise.rest_seconds}s descanso
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">{exercise.muscle_group}</span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </div>
        </button>

        {/* Body */}
        {open && (
          <div className="px-3.5 pb-3.5 space-y-3">
            {/* Technique note */}
            <div className="bg-ember/8 border border-ember/20 rounded-lg p-2.5 text-xs text-muted-foreground leading-relaxed">
              💡 <span className="text-foreground font-medium">Técnica:</span> {exercise.technique_note}
            </div>

            {/* Sets */}
            <div className="space-y-2">
              {Array.from({ length: exercise.sets }, (_, i) => i + 1).map((setNum) => {
                const setData = getSet(exercise.exercise_key, setNum);
                return (
                  <div key={setNum} className={cn(
                    "flex items-center gap-2 p-2 rounded-lg",
                    setData.completed ? "bg-success/10" : "bg-surface/50"
                  )}>
                    <span className="text-xs font-mono font-bold text-muted-foreground w-8 flex-shrink-0">
                      S{setNum}
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="kg"
                      inputMode="decimal"
                      value={setData.weight_kg}
                      onChange={(e) => updateSetLocal(exercise.exercise_key, setNum, "weight_kg", e.target.value)}
                      className="w-16 bg-background border border-border rounded-lg px-2 py-1.5 text-center text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
                    />
                    <span className="text-xs text-muted-foreground flex-shrink-0">kg</span>
                    <input
                      type="number"
                      placeholder="reps"
                      inputMode="numeric"
                      value={setData.reps_performed}
                      onChange={(e) => updateSetLocal(exercise.exercise_key, setNum, "reps_performed", e.target.value)}
                      className="w-16 bg-background border border-border rounded-lg px-2 py-1.5 text-center text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
                    />
                    <span className="text-xs text-muted-foreground flex-shrink-0">rep</span>
                    <button
                      onClick={() => handleCompleteSet(setNum)}
                      className="ml-auto flex-shrink-0"
                    >
                      {setData.completed
                        ? <CheckCircle2 className="w-5 h-5 text-success" />
                        : <Circle className="w-5 h-5 text-muted-foreground hover:text-ember transition-colors" />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
