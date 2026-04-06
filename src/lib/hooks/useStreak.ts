"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreak() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("workout_sessions")
        .select("session_date")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("session_date", { ascending: false })
        .limit(60);

      if (!data || data.length === 0) { setLoading(false); return; }

      // Calculate streak
      const dates = new Set(data.map((s) => s.session_date));
      let count = 0;
      const today = new Date();

      for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        if (dates.has(dateStr)) {
          count++;
        } else if (i > 0) {
          break;
        }
      }

      setStreak(count);
      setLoading(false);
    }

    fetchStreak();
  }, []);

  return { streak, loading };
}
