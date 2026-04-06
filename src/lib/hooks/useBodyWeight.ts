"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BodyWeightEntry } from "@/types/database";

export function useBodyWeight() {
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("body_weight_log")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: true })
        .limit(180);

      setEntries((data as BodyWeightEntry[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const addEntry = useCallback(async (weightKg: number, logDate: string, notes?: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("body_weight_log")
      .upsert({ user_id: user.id, log_date: logDate, weight_kg: weightKg, notes: notes ?? null },
        { onConflict: "user_id,log_date" })
      .select()
      .single();

    if (!error && data) {
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.log_date !== logDate);
        return [...filtered, data as BodyWeightEntry].sort((a, b) =>
          a.log_date.localeCompare(b.log_date)
        );
      });
    }
  }, []);

  return { entries, loading, addEntry };
}
