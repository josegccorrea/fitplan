"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const messages = [
  "Analisando seus dados corporais...",
  "Calculando metabolismo basal e TDEE...",
  "Criando divisão de treino personalizada...",
  "Selecionando exercícios para seu equipamento...",
  "Calculando macros e calorias...",
  "Montando cardápio com seus alimentos favoritos...",
  "Ajustando volumes e intensidades...",
  "Finalizando seu plano personalizado...",
];

interface Props {
  name: string;
}

export function GeneratingPlan({ name }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 3500);
    const dotTimer = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 500);
    return () => {
      clearInterval(msgTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center max-w-sm mx-auto fade-in">
        {/* Animated logo */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-ember/20 border border-ember/30 flex items-center justify-center mx-auto">
            <Flame className="w-10 h-10 text-ember flame-pulse" />
          </div>
          {/* Outer ring */}
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl border-2 border-ember/20 animate-ping" style={{ animationDuration: "2s" }} />
        </div>

        <h2 className="font-display text-2xl text-foreground mb-2">
          {name ? `Criando seu plano, ${name.split(" ")[0]}!` : "Criando seu plano!"}
        </h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Nossa IA está analisando seus dados e criando um plano de treino e alimentação 100% personalizado.
        </p>

        {/* Progress message */}
        <div className="bg-surface2 border border-border rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            {messages[msgIndex]}{".".repeat(dots)}
          </p>
        </div>

        {/* Progress bar (indeterminate) */}
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-ember rounded-full"
            style={{
              width: "40%",
              animation: "progress-slide 2s ease-in-out infinite alternate",
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Isso pode levar até 30 segundos ☕
        </p>
      </div>

      <style>{`
        @keyframes progress-slide {
          from { transform: translateX(-100%); }
          to { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
