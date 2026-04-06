"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NutritionPlan } from "@/types/database";

export function useNutritionPlan() {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("nutrition_plans")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error) setError(error.message);
      else setPlan(data as NutritionPlan);
      setLoading(false);
    }
    fetch();
  }, []);

  return { plan, loading, error };
}
