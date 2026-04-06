"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Flame, Dumbbell, TrendingUp, ChevronDown } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { useBodyWeight } from "@/lib/hooks/useBodyWeight";
import { useStreak } from "@/lib/hooks/useStreak";
import { formatDate, formatWeight } from "@/lib/utils/formatters";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

// ── Workout history types ──────────────────────────────────────────────────────

interface ExerciseHistoryEntry {
  date: string;
  weight_kg: number | null;
  reps_performed: number | null;
  notes: string | null;
}

interface ExerciseHistory {
  exercise_key: string;
  exercise_name: string;
  entries: ExerciseHistoryEntry[]; // últimas 5 sessões
  isCardio: boolean;
}

function formatSetLabel(e: ExerciseHistoryEntry, isCardio: boolean): string {
  if (isCardio) {
    try {
      const parsed = e.notes ? (JSON.parse(e.notes) as Record<string, string | number>) : {};
      const parts: string[] = [];
      if (parsed.incline !== undefined) parts.push(`${parsed.incline}%`);
      if (parsed.speed !== undefined) parts.push(`${parsed.speed}km/h`);
      if (parsed.resistance !== undefined) parts.push(`carga ${parsed.resistance}`);
      if (parsed.rpm !== undefined) parts.push(`${parsed.rpm}rpm`);
      if (parsed.pse !== undefined) parts.push(`PSE ${parsed.pse}`);
      if (e.reps_performed) parts.push(`${e.reps_performed}min`);
      return parts.join(" · ") || "—";
    } catch { return e.reps_performed ? `${e.reps_performed}min` : "—"; }
  }
  const w = e.weight_kg ? `${e.weight_kg}kg` : null;
  const r = e.reps_performed ? `${e.reps_performed} rep` : null;
  return [w, r].filter(Boolean).join(" × ") || "—";
}

function useExerciseHistory() {
  const [history, setHistory] = useState<ExerciseHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Busca todos os sets de exercícios completados, com data da sessão
      const { data } = await supabase
        .from("exercise_sets")
        .select("exercise_key, exercise_name, weight_kg, reps_performed, notes, workout_sessions!inner(session_date, completed)")
        .eq("user_id", user.id)
        .eq("completed", true)
        .eq("workout_sessions.completed", true)
        .eq("set_number", 1) // só S1 como referência de evolução
        .order("exercise_key")
        .limit(200);

      if (!data) { setLoading(false); return; }

      // Agrupar por exercise_key, pegar últimas 5 datas únicas
      const grouped: Record<string, ExerciseHistory> = {};
      for (const row of data as Array<{
        exercise_key: string;
        exercise_name: string;
        weight_kg: number | null;
        reps_performed: number | null;
        notes: string | null;
        workout_sessions: { session_date: string };
      }>) {
        const key = row.exercise_key;
        if (!grouped[key]) {
          grouped[key] = {
            exercise_key: key,
            exercise_name: row.exercise_name,
            entries: [],
            isCardio: false,
          };
        }
        // Verificar se já temos essa data
        const date = row.workout_sessions.session_date;
        const alreadyHas = grouped[key].entries.some((e) => e.date === date);
        if (!alreadyHas && grouped[key].entries.length < 5) {
          grouped[key].entries.push({
            date,
            weight_kg: row.weight_kg,
            reps_performed: row.reps_performed,
            notes: row.notes,
          });
          // Detectar cardio pelo nome do exercício
          if (row.notes && row.notes.includes("incline") || row.notes?.includes("speed") || row.notes?.includes("rpm")) {
            grouped[key].isCardio = true;
          }
        }
      }

      // Filtrar só exercícios com ≥ 2 entradas, ordenar por data da última sessão (mais recente primeiro)
      const result = Object.values(grouped)
        .filter((ex) => ex.entries.length >= 2)
        .sort((a, b) => {
          const la = a.entries[a.entries.length - 1]?.date ?? "";
          const lb = b.entries[b.entries.length - 1]?.date ?? "";
          return lb.localeCompare(la);
        })
        .slice(0, 8);

      setHistory(result);
      setLoading(false);
    }
    load();
  }, []);

  return { history, loading };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProgressoPage() {
  const { entries, loading, addEntry } = useBodyWeight();
  const { streak } = useStreak();
  const { history, loading: historyLoading } = useExerciseHistory();
  const [newWeight, setNewWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [openExercise, setOpenExercise] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const chartData = entries.map((e) => ({
    date: formatDate(e.log_date, { day: "2-digit", month: "short" }),
    peso: e.weight_kg,
  }));

  const latest = entries[entries.length - 1];
  const previous = entries[entries.length - 2];
  const diff = latest && previous ? latest.weight_kg - previous.weight_kg : null;

  async function handleAddWeight() {
    if (!newWeight || parseFloat(newWeight) <= 0) return;
    setSaving(true);
    await addEntry(parseFloat(newWeight), today);
    setNewWeight("");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-ember" />
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="font-display text-2xl text-foreground">Progresso</h1>
        <p className="text-xs text-muted-foreground">Histórico de evolução</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface2 border border-border rounded-xl p-3 text-center">
          <Flame className={`w-4 h-4 mx-auto mb-1 ${streak > 0 ? "text-gold" : "text-muted-foreground"}`} />
          <div className="font-mono text-xl font-bold text-foreground">{streak}</div>
          <div className="text-[10px] text-muted-foreground">dias seguidos</div>
        </div>
        <div className="bg-surface2 border border-border rounded-xl p-3 text-center">
          <TrendingUp className="w-4 h-4 mx-auto mb-1 text-ember" />
          <div className="font-mono text-xl font-bold text-foreground">
            {latest ? formatWeight(latest.weight_kg) : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground">peso atual</div>
        </div>
        <div className="bg-surface2 border border-border rounded-xl p-3 text-center">
          <Dumbbell className="w-4 h-4 mx-auto mb-1 text-chart-3" />
          <div className={`font-mono text-xl font-bold ${diff === null ? "text-foreground" : diff < 0 ? "text-chart-3" : "text-ember"}`}>
            {diff === null ? "—" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg`}
          </div>
          <div className="text-[10px] text-muted-foreground">variação</div>
        </div>
      </div>

      {/* Weight chart */}
      <div className="bg-surface2 border border-border rounded-xl p-4">
        <h2 className="font-semibold text-sm text-foreground mb-3">Peso Corporal</h2>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E3E" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9999B3" }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#9999B3" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A1A24", border: "1px solid #2E2E3E", borderRadius: "8px", fontSize: 12 }}
                labelStyle={{ color: "#9999B3" }}
                itemStyle={{ color: "#F04E23" }}
                formatter={(v) => [`${v}kg`, "Peso"]}
              />
              <Line type="monotone" dataKey="peso" stroke="#F04E23" strokeWidth={2} dot={{ fill: "#F04E23", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
            Registre pelo menos 2 pesos para ver o gráfico
          </div>
        )}
      </div>

      {/* Add weight form */}
      <div className="bg-surface2 border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Registrar Peso de Hoje</h3>
        <div className="flex gap-2">
          <input
            type="number" step="0.1" placeholder="Ex: 78.5" inputMode="decimal"
            value={newWeight} onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
          />
          <span className="flex items-center text-sm text-muted-foreground">kg</span>
          <button
            onClick={handleAddWeight} disabled={saving || !newWeight}
            className="flex items-center gap-1.5 bg-ember hover:bg-ember-hover text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </div>

      {/* Exercise history */}
      <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Evolução de Cargas</h3>
          {historyLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        </div>

        {!historyLoading && history.length === 0 ? (
          <div className="px-3.5 py-6 text-center text-xs text-muted-foreground">
            Complete pelo menos 2 treinos para ver a evolução de cargas.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((ex) => {
              const isOpen = openExercise === ex.exercise_key;
              const sorted = [...ex.entries].sort((a, b) => b.date.localeCompare(a.date));
              const latest = sorted[0];
              return (
                <div key={ex.exercise_key}>
                  <button
                    className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-surface/50 transition-colors"
                    onClick={() => setOpenExercise(isOpen ? null : ex.exercise_key)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{ex.exercise_name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Última: <span className="text-ember font-medium">{formatSetLabel(latest, ex.isCardio)}</span>
                        {" · "}{ex.entries.length} sessões
                      </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform flex-shrink-0", isOpen && "rotate-180")} />
                  </button>

                  {isOpen && (
                    <div className="px-3.5 pb-3 space-y-1.5">
                      {sorted.map((entry) => (
                        <div key={entry.date} className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0">
                          <span className="text-muted-foreground">
                            {formatDate(entry.date, { weekday: "short", day: "numeric", month: "short" })}
                          </span>
                          <span className="font-mono font-semibold text-foreground">
                            {formatSetLabel(entry, ex.isCardio)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weight history */}
      {entries.length > 0 && (
        <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Histórico de Peso</h3>
          </div>
          <div className="divide-y divide-border max-h-48 overflow-y-auto">
            {[...entries].reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-sm text-muted-foreground">
                  {formatDate(entry.log_date, { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className="text-sm font-mono font-bold text-foreground">{formatWeight(entry.weight_kg)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
