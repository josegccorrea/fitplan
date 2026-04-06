"use client";

import { useState } from "react";
import { Loader2, Plus, Flame, Dumbbell, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { useBodyWeight } from "@/lib/hooks/useBodyWeight";
import { useStreak } from "@/lib/hooks/useStreak";
import { formatDate, formatWeight } from "@/lib/utils/formatters";

export default function ProgressoPage() {
  const { entries, loading, addEntry } = useBodyWeight();
  const { streak } = useStreak();
  const [newWeight, setNewWeight] = useState("");
  const [saving, setSaving] = useState(false);

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
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9999B3" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "#9999B3" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}kg`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A1A24", border: "1px solid #2E2E3E", borderRadius: "8px", fontSize: 12 }}
                labelStyle={{ color: "#9999B3" }}
                itemStyle={{ color: "#F04E23" }}
                formatter={(v) => [`${v}kg`, "Peso"]}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#F04E23"
                strokeWidth={2}
                dot={{ fill: "#F04E23", r: 3 }}
                activeDot={{ r: 5 }}
              />
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
            type="number"
            step="0.1"
            placeholder="Ex: 78.5"
            inputMode="decimal"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
          />
          <span className="flex items-center text-sm text-muted-foreground">kg</span>
          <button
            onClick={handleAddWeight}
            disabled={saving || !newWeight}
            className="flex items-center gap-1.5 bg-ember hover:bg-ember-hover text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Salvar
          </button>
        </div>
      </div>

      {/* Weight history */}
      {entries.length > 0 && (
        <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Histórico</h3>
          </div>
          <div className="divide-y divide-border max-h-48 overflow-y-auto">
            {[...entries].reverse().map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-sm text-muted-foreground">
                  {formatDate(entry.log_date, { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {formatWeight(entry.weight_kg)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
