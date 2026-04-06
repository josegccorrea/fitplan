"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RestTimer } from "./RestTimer";
import type { Exercise } from "@/types/database";
import type { SetState } from "@/lib/hooks/useWorkoutSession";

// ── Cardio detection ──────────────────────────────────────────────────────────

type CardioType = "esteira" | "bicicleta" | "remo" | "corda" | "generico";

function detectCardioType(exercise: Exercise): CardioType | null {
  if (exercise.muscle_group !== "cardiovascular") return null;
  const n = `${exercise.name} ${exercise.equipment ?? ""}`.toLowerCase();
  if (n.includes("esteira") || n.includes("treadmill")) return "esteira";
  if (n.includes("bicicleta") || n.includes("bike") || n.includes("spinning")) return "bicicleta";
  if (n.includes("remo") || n.includes("row")) return "remo";
  if (n.includes("corda") || n.includes("jump rope") || n.includes("pular")) return "corda";
  return "generico";
}

interface CardioField {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  inputMode: "decimal" | "numeric";
  step?: string;
}

const CARDIO_CONFIG: Record<CardioType, { fields: CardioField[] }> = {
  esteira: {
    fields: [
      { key: "incline", label: "Inclinação", unit: "%",    placeholder: "8",   inputMode: "decimal", step: "0.5" },
      { key: "speed",   label: "Velocidade", unit: "km/h", placeholder: "6.5", inputMode: "decimal", step: "0.1" },
    ],
  },
  bicicleta: {
    fields: [
      { key: "resistance", label: "Carga", unit: "nível", placeholder: "8",  inputMode: "numeric" },
      { key: "rpm",        label: "RPM",   unit: "rpm",   placeholder: "80", inputMode: "numeric" },
    ],
  },
  remo: {
    fields: [
      { key: "resistance", label: "Nível", unit: "1-10",  placeholder: "6",    inputMode: "numeric" },
      { key: "pace",       label: "Pace",  unit: "/500m", placeholder: "2:15", inputMode: "decimal" },
    ],
  },
  corda: {
    fields: [
      { key: "rounds", label: "Rounds", unit: "rds", placeholder: "10", inputMode: "numeric" },
    ],
  },
  generico: {
    fields: [
      { key: "pse", label: "Esforço", unit: "PSE 1-10", placeholder: "7", inputMode: "numeric" },
    ],
  },
};

function formatLastCardio(notes: string | null, reps: number | null): string {
  try {
    const parsed = notes ? (JSON.parse(notes) as Record<string, string | number>) : {};
    const parts: string[] = [];
    if (parsed.incline !== undefined) parts.push(`${parsed.incline}%`);
    if (parsed.speed !== undefined) parts.push(`${parsed.speed}km/h`);
    if (parsed.resistance !== undefined) parts.push(`carga ${parsed.resistance}`);
    if (parsed.rpm !== undefined) parts.push(`${parsed.rpm}rpm`);
    if (parsed.rounds !== undefined) parts.push(`${parsed.rounds} rounds`);
    if (parsed.pse !== undefined) parts.push(`PSE ${parsed.pse}`);
    if (reps) parts.push(`${reps}min`);
    return parts.join(" · ") || "";
  } catch {
    return reps ? `${reps}min` : "";
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  exercise: Exercise;
  index: number;
  getSet: (exerciseKey: string, setNumber: number) => SetState;
  updateSetLocal: (exerciseKey: string, setNumber: number, field: "weight_kg" | "reps_performed" | "notes", value: string) => void;
  logSet: (exerciseKey: string, exerciseName: string, setNumber: number, weightKg: string, reps: string, notes?: string) => Promise<void>;
  isComplete: boolean;
  lastSet?: { weight_kg: number | null; reps_performed: number | null; notes: string | null };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExerciseCard({ exercise, index, getSet, updateSetLocal, logSet, isComplete, lastSet }: Props) {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<{ restSeconds: number } | null>(null);

  const cardioType = detectCardioType(exercise);
  const isCardio = cardioType !== null;
  const cardioConfig = cardioType ? CARDIO_CONFIG[cardioType] : null;
  const totalSets = isCardio ? 1 : exercise.sets;

  async function handleCompleteSet(setNum: number) {
    const s = getSet(exercise.exercise_key, setNum);
    await logSet(exercise.exercise_key, exercise.name, setNum, s.weight_kg, s.reps_performed, s.notes || undefined);
    if (!isCardio) setTimer({ restSeconds: exercise.rest_seconds });
  }

  function getCardioField(setNum: number, fieldKey: string): string {
    const s = getSet(exercise.exercise_key, setNum);
    try {
      const parsed = s.notes ? (JSON.parse(s.notes) as Record<string, string>) : {};
      return parsed[fieldKey] ?? "";
    } catch { return ""; }
  }

  function updateCardioField(setNum: number, fieldKey: string, value: string) {
    const s = getSet(exercise.exercise_key, setNum);
    let current: Record<string, string> = {};
    try { current = s.notes ? JSON.parse(s.notes) : {}; } catch { /* ignore */ }
    current[fieldKey] = value;
    updateSetLocal(exercise.exercise_key, setNum, "notes", JSON.stringify(current));
  }

  const lastHint = lastSet
    ? isCardio
      ? formatLastCardio(lastSet.notes, lastSet.reps_performed)
      : [lastSet.weight_kg ? `${lastSet.weight_kg}kg` : null, lastSet.reps_performed ? `${lastSet.reps_performed} rep` : null].filter(Boolean).join(" × ")
    : null;

  return (
    <>
      {timer && <RestTimer seconds={timer.restSeconds} onDone={() => setTimer(null)} onSkip={() => setTimer(null)} />}

      <div className={cn(
        "rounded-xl border overflow-hidden transition-all",
        isComplete ? "border-success/40 bg-success/5" : "border-border bg-surface2"
      )}>
        {/* Header */}
        <button className="w-full flex items-center gap-3 p-3.5 text-left" onClick={() => setOpen(!open)}>
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold",
            isComplete ? "bg-success/20 text-success" : isCardio ? "bg-chart-4/20 text-chart-4" : "bg-surface text-ember"
          )}>
            {isComplete ? "✓" : isCardio ? "🏃" : index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{exercise.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isCardio ? exercise.reps : `${exercise.sets}× ${exercise.reps} · ${exercise.rest_seconds}s descanso`}
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
            {/* Technique */}
            <div className="bg-ember/8 border border-ember/20 rounded-lg p-2.5 text-xs text-muted-foreground leading-relaxed">
              💡 <span className="text-foreground font-medium">Técnica:</span> {exercise.technique_note}
            </div>

            {/* Last session hint */}
            {lastHint && (
              <div className="bg-surface/50 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="text-chart-3">↩</span>
                <span>Última sessão: <span className="text-foreground font-medium">{lastHint}</span></span>
              </div>
            )}

            {/* Sets */}
            <div className="space-y-2">
              {Array.from({ length: totalSets }, (_, i) => i + 1).map((setNum) => {
                const setData = getSet(exercise.exercise_key, setNum);
                return (
                  <div key={setNum} className={cn("rounded-lg p-2.5", setData.completed ? "bg-success/10" : "bg-surface/50")}>
                    {/* Row: label + complete button */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-muted-foreground w-8 flex-shrink-0">
                        {isCardio ? "🏃" : `S${setNum}`}
                      </span>
                      <span className="text-xs text-muted-foreground flex-1">
                        {isCardio ? "Registrar sessão aeróbica" : `Série ${setNum}`}
                      </span>
                      <button onClick={() => handleCompleteSet(setNum)} className="flex-shrink-0">
                        {setData.completed
                          ? <CheckCircle2 className="w-5 h-5 text-success" />
                          : <Circle className="w-5 h-5 text-muted-foreground hover:text-ember transition-colors" />}
                      </button>
                    </div>

                    {/* Cardio inputs */}
                    {isCardio && cardioConfig && (
                      <div className={cn("grid gap-2", cardioConfig.fields.length === 2 ? "grid-cols-3" : "grid-cols-2")}>
                        {cardioConfig.fields.map((field) => (
                          <div key={field.key} className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground text-center">{field.label}</span>
                            <input
                              type="number"
                              step={field.step ?? "1"}
                              placeholder={field.placeholder}
                              inputMode={field.inputMode}
                              value={getCardioField(setNum, field.key)}
                              onChange={(e) => updateCardioField(setNum, field.key, e.target.value)}
                              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-center text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
                            />
                            <span className="text-[10px] text-muted-foreground text-center">{field.unit}</span>
                          </div>
                        ))}
                        {/* Duration */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-muted-foreground text-center">Duração</span>
                          <input
                            type="number"
                            placeholder="15"
                            inputMode="numeric"
                            value={setData.reps_performed}
                            onChange={(e) => updateSetLocal(exercise.exercise_key, setNum, "reps_performed", e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-center text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
                          />
                          <span className="text-[10px] text-muted-foreground text-center">min</span>
                        </div>
                      </div>
                    )}

                    {/* Força inputs */}
                    {!isCardio && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number" step="0.5" placeholder="kg" inputMode="decimal"
                          value={setData.weight_kg}
                          onChange={(e) => updateSetLocal(exercise.exercise_key, setNum, "weight_kg", e.target.value)}
                          className="w-16 bg-background border border-border rounded-lg px-2 py-1.5 text-center text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
                        />
                        <span className="text-xs text-muted-foreground flex-shrink-0">kg</span>
                        <input
                          type="number" placeholder="reps" inputMode="numeric"
                          value={setData.reps_performed}
                          onChange={(e) => updateSetLocal(exercise.exercise_key, setNum, "reps_performed", e.target.value)}
                          className="w-16 bg-background border border-border rounded-lg px-2 py-1.5 text-center text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
                        />
                        <span className="text-xs text-muted-foreground flex-shrink-0">rep</span>
                      </div>
                    )}
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
