"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutPlan } from "@/types/database";

export function useWorkoutPlan() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error) setError(error.message);
      else setPlan(data as WorkoutPlan);
      setLoading(false);
    }
    fetch();
  }, []);

  return { plan, loading, error };
}
