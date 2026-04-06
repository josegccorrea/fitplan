"use client";

import { useEffect, useRef, useState } from "react";
import { X, SkipForward } from "lucide-react";
import { formatDuration } from "@/lib/utils/formatters";

interface Props {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}

export function RestTimer({ seconds, onDone, onSkip }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / seconds;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          // Send notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("FitPlan — Hora de treinar! 💪", {
              body: "Seu descanso acabou. Próxima série!",
              icon: "/icons/icon-192.png",
            });
          }
          onDone();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="text-center max-w-xs w-full fade-in">
        <h3 className="font-display text-xl text-foreground mb-6">Descanso</h3>

        {/* SVG Ring Timer */}
        <div className="relative w-36 h-36 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#2E2E3E"
              strokeWidth="6"
            />
            {/* Progress ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#F04E23"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-3xl font-bold text-foreground">
              {formatDuration(remaining)}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Próxima série em breve...
        </p>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
          <button
            onClick={onSkip}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-ember hover:bg-ember-hover text-white text-sm font-semibold transition-colors"
          >
            <SkipForward className="w-4 h-4" /> Pular
          </button>
        </div>
      </div>
    </div>
  );
}
