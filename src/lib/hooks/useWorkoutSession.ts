"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutSession, ExerciseSet } from "@/types/database";

export interface SetState {
  weight_kg: string;
  reps_performed: string;
  notes: string; // JSON string para cardio
  completed: boolean;
}

type SetMap = Record<string, SetState>; // key: `${exerciseKey}_${setNumber}`

export type LastSetMap = Record<string, {
  weight_kg: number | null;
  reps_performed: number | null;
  notes: string | null;
}>;

function buildStorageKey(today: string, dayIndex: number) {
  return `fitplan_wk_${today}_${dayIndex}`;
}

function loadFromStorage(key: string): SetMap | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SetMap) : null;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, sets: SetMap) {
  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(key, JSON.stringify(sets));
    }
  } catch {
    // ignore storage errors
  }
}

export function useWorkoutSession(dayIndex: number, workoutPlanId?: string) {
  const supabase = createClient();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sets, setSets] = useState<SetMap>({});
  const [lastSets, setLastSets] = useState<LastSetMap>({});
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const storageKey = buildStorageKey(today, dayIndex);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // 1. Restaurar imediatamente do sessionStorage (in-progress sets)
      const cached = loadFromStorage(storageKey);
      if (cached) setSets(cached);

      // 2. Carregar sessão de hoje do Supabase
      const { data: existing } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("session_date", today)
        .eq("day_index", dayIndex)
        .maybeSingle();

      if (existing) {
        setSession(existing as WorkoutSession);
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
              notes: s.notes ?? "",
              completed: s.completed,
            };
          });
          // Merge: Supabase sobrescreve cached para sets completados
          setSets((prev) => {
            const merged = { ...prev, ...map };
            saveToStorage(storageKey, merged);
            return merged;
          });
        }
      }

      // 3. Carregar última sessão completada (referência de carga)
      const { data: lastSession } = await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("day_index", dayIndex)
        .eq("completed", true)
        .lt("session_date", today)
        .order("session_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastSession) {
        const { data: lastSetData } = await supabase
          .from("exercise_sets")
          .select("exercise_key, set_number, weight_kg, reps_performed, notes")
          .eq("session_id", lastSession.id)
          .eq("completed", true);

        if (lastSetData) {
          const map: LastSetMap = {};
          (lastSetData as ExerciseSet[]).forEach((s) => {
            // Guardar set_number 1 como referência principal
            const key = s.exercise_key;
            if (!map[key] || s.set_number === 1) {
              map[key] = {
                weight_kg: s.weight_kg,
                reps_performed: s.reps_performed,
                notes: s.notes,
              };
            }
          });
          setLastSets(map);
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
    notes?: string,
  ) => {
    const s = await ensureSession();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("exercise_sets").upsert(
      {
        session_id: s.id,
        user_id: user.id,
        exercise_key: exerciseKey,
        exercise_name: exerciseName,
        set_number: setNumber,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        reps_performed: repsPerformed ? parseInt(repsPerformed) : null,
        notes: notes ?? null,
        completed: true,
      },
      { onConflict: "session_id,exercise_key,set_number" }
    );

    const key = `${exerciseKey}_${setNumber}`;
    setSets((prev) => {
      const next = {
        ...prev,
        [key]: { weight_kg: weightKg, reps_performed: repsPerformed, notes: notes ?? "", completed: true },
      };
      saveToStorage(storageKey, next);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, workoutPlanId, dayIndex, today, storageKey]);

  const updateSetLocal = useCallback((
    exerciseKey: string,
    setNumber: number,
    field: "weight_kg" | "reps_performed" | "notes",
    value: string,
  ) => {
    const key = `${exerciseKey}_${setNumber}`;
    setSets((prev) => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key] ?? { weight_kg: "", reps_performed: "", notes: "", completed: false },
          [field]: value,
        },
      };
      saveToStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  async function completeWorkout() {
    if (!session) return;
    await supabase
      .from("workout_sessions")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", session.id);
    setSession((s) => s ? { ...s, completed: true } : null);
    // Limpar cache do dia após finalizar
    try { sessionStorage.removeItem(storageKey); } catch { /* ignore */ }
  }

  function getSet(exerciseKey: string, setNumber: number): SetState {
    return sets[`${exerciseKey}_${setNumber}`] ?? {
      weight_kg: "",
      reps_performed: "",
      notes: "",
      completed: false,
    };
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
    lastSets,
  };
}
