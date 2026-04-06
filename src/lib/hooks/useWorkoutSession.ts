"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutSession, ExerciseSet } from "@/types/database";

interface SetState {
  weight_kg: string;
  reps_performed: string;
  completed: boolean;
}

type SetMap = Record<string, SetState>; // key: `${exerciseKey}_${setNumber}`

export function useWorkoutSession(dayIndex: number, workoutPlanId?: string) {
  const supabase = createClient();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sets, setSets] = useState<SetMap>({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Try to find existing session for today + dayIndex
      const { data: existing } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("session_date", today)
        .eq("day_index", dayIndex)
        .single();

      if (existing) {
        setSession(existing as WorkoutSession);
        // Load existing sets
        const { data: existingSets } = await supabase
          .from("exercise_sets")
          .select("*")
          .eq("session_id", existing.id);

        if (existingSets) {
          const map: SetMap = {};
          (existingSets as ExerciseSet[]).forEach((s) => {
            map[`${s.exercise_key}_${s.set_number}`] = {
              weight_kg: s.weight_kg?.toString() ?? "",
              reps_performed: s.reps_performed?.toString() ?? "",
              completed: s.completed,
            };
          });
          setSets(map);
        }
      }

      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayIndex, today]);

  async function ensureSession(): Promise<WorkoutSession> {
    if (session) return session;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: user.id,
        workout_plan_id: workoutPlanId ?? null,
        day_index: dayIndex,
        session_date: today,
      })
      .select()
      .single();

    if (error) throw error;
    const newSession = data as WorkoutSession;
    setSession(newSession);
    return newSession;
  }

  const logSet = useCallback(async (
    exerciseKey: string,
    exerciseName: string,
    setNumber: number,
    weightKg: string,
    repsPerformed: string,
  ) => {
    const s = await ensureSession();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upsert the set
    await supabase.from("exercise_sets").upsert(
      {
        session_id: s.id,
        user_id: user.id,
        exercise_key: exerciseKey,
        exercise_name: exerciseName,
        set_number: setNumber,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        reps_performed: repsPerformed ? parseInt(repsPerformed) : null,
        completed: true,
      },
      { onConflict: "session_id,exercise_key,set_number" }
    );

    const key = `${exerciseKey}_${setNumber}`;
    setSets((prev) => ({
      ...prev,
      [key]: { weight_kg: weightKg, reps_performed: repsPerformed, completed: true },
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, workoutPlanId, dayIndex, today]);

  const updateSetLocal = useCallback((exerciseKey: string, setNumber: number, field: "weight_kg" | "reps_performed", value: string) => {
    const key = `${exerciseKey}_${setNumber}`;
    setSets((prev) => ({
      ...prev,
      [key]: { ...prev[key] ?? { weight_kg: "", reps_performed: "", completed: false }, [field]: value },
    }));
  }, []);

  async function completeWorkout() {
    if (!session) return;
    await supabase
      .from("workout_sessions")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", session.id);
    setSession((s) => s ? { ...s, completed: true } : null);
  }

  function getSet(exerciseKey: string, setNumber: number): SetState {
    return sets[`${exerciseKey}_${setNumber}`] ?? { weight_kg: "", reps_performed: "", completed: false };
  }

  function isExerciseComplete(exerciseKey: string, totalSets: number): boolean {
    return Array.from({ length: totalSets }, (_, i) => i + 1).every(
      (sn) => sets[`${exerciseKey}_${sn}`]?.completed
    );
  }

  return {
    session,
    loading,
    getSet,
    updateSetLocal,
    logSet,
    completeWorkout,
    isExerciseComplete,
  };
}
