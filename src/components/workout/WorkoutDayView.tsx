"use client";

import { useState } from "react";
import { CheckCircle2, Leaf } from "lucide-react";
import { WeekSelector } from "./WeekSelector";
import { ExerciseCard } from "./ExerciseCard";
import { useWorkoutSession } from "@/lib/hooks/useWorkoutSession";
import type { WorkoutPlan } from "@/types/database";
import { cn } from "@/lib/utils/cn";

interface Props {
  plan: WorkoutPlan;
  activeDayIndex: number;
}

export function WorkoutDayView({ plan, activeDayIndex }: Props) {
  const days = plan.plan_data.days;
  const today = days.find((d) => d.day_index === activeDayIndex);
  const [finished, setFinished] = useState(false);

  const { getSet, updateSetLocal, logSet, isExerciseComplete, completeWorkout, session, lastSets } =
    useWorkoutSession(activeDayIndex, plan.id);

  async function handleFinishWorkout() {
    await completeWorkout();
    setFinished(true);
  }

  if (!today) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Dia não encontrado no plano.
      </div>
    );
  }

  // Completion screen
  if (finished || session?.completed) {
    return (
      <div className="slide-up">
        <WeekSelector days={days} activeDayIndex={activeDayIndex} />
        <div className="mt-6 text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-2xl text-foreground mb-2">Treino Concluído! 🎉</h2>
          <p className="text-sm text-muted-foreground">
            Ótimo trabalho! Seu progresso foi salvo automaticamente.
          </p>
        </div>
      </div>
    );
  }

  // Rest day
  if (today.is_rest) {
    return (
      <div className="slide-up space-y-4">
        <WeekSelector days={days} activeDayIndex={activeDayIndex} />
        <div className="bg-surface2 border border-border rounded-2xl p-6 text-center mt-4">
          <Leaf className="w-12 h-12 text-chart-3 mx-auto mb-3" />
          <h2 className="font-display text-2xl text-chart-3 mb-2">Descanso Ativo</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {today.rest_tip ?? "Hoje é dia de recuperação. O crescimento muscular acontece durante o descanso!"}
          </p>
          <div className="bg-chart-3/10 border border-chart-3/20 rounded-xl p-3 text-xs text-muted-foreground">
            💡 Uma caminhada leve de 20-30 minutos ou alongamento é ótimo para a recuperação.
          </div>
        </div>
      </div>
    );
  }

  const allComplete = today.exercises.every((ex) => {
    const isCardio = ex.muscle_group === "cardiovascular";
    return isExerciseComplete(ex.exercise_key, isCardio ? 1 : ex.sets);
  });

  return (
    <div className="slide-up space-y-4">
      <WeekSelector days={days} activeDayIndex={activeDayIndex} />

      <div>
        <h1 className="font-display text-2xl text-foreground">{today.label}</h1>
        <p className="text-sm text-muted-foreground">{today.focus}</p>
      </div>

      {/* Exercises */}
      <div className="space-y-2.5">
        {today.exercises.map((exercise, i) => (
          <ExerciseCard
            key={exercise.exercise_key}
            exercise={exercise}
            index={i}
            getSet={getSet}
            updateSetLocal={updateSetLocal}
            logSet={logSet}
            isComplete={isExerciseComplete(exercise.exercise_key, exercise.sets)}
            lastSet={lastSets[exercise.exercise_key]}
          />
        ))}
      </div>

      {/* Finish button */}
      <button
        onClick={handleFinishWorkout}
        disabled={!allComplete}
        className={cn(
          "w-full py-3.5 rounded-xl font-bold text-sm transition-all",
          allComplete
            ? "bg-success hover:bg-success/90 text-background ember-glow"
            : "bg-surface2 border border-border text-muted-foreground cursor-not-allowed"
        )}
      >
        {allComplete ? "✅ Finalizar Treino" : `Complete todas as séries para finalizar`}
      </button>
    </div>
  );
}
