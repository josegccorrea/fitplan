import Link from "next/link";
import { Flame, Dumbbell, UtensilsCrossed, TrendingUp, Sparkles } from "lucide-react";

const features = [
  { icon: Sparkles, label: "Plano 100% personalizado por IA", desc: "Claude AI cria seu treino e dieta baseados no seu perfil único" },
  { icon: Dumbbell, label: "Registro de cargas em tempo real", desc: "Log de pesos por série com timer de descanso integrado" },
  { icon: UtensilsCrossed, label: "Cardápio semanal completo", desc: "7 dias de refeições com macros calculados e lista de compras" },
  { icon: TrendingUp, label: "Gráficos de evolução", desc: "Acompanhe peso corporal e progressão de cargas ao longo do tempo" },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="px-4 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-ember flex items-center justify-center ember-glow">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl text-foreground tracking-wide">FitPlan</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5">
            Entrar
          </Link>
          <Link href="/register" className="bg-ember hover:bg-ember-hover text-white text-sm font-semibold rounded-xl px-3 py-2 transition-colors">
            Começar grátis
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 max-w-lg mx-auto w-full">
        <div className="slide-up space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-ember/20 border border-ember/30 flex items-center justify-center mx-auto ember-glow">
            <Flame className="w-8 h-8 text-ember flame-pulse" />
          </div>

          <div>
            <h1 className="font-display text-4xl text-foreground leading-tight mb-3">
              Seu Plano de Treino<br />
              <span className="text-ember">Gerado por IA</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Responda 6 perguntas. A IA cria um plano personalizado de treino e alimentação baseado em ciência, adaptado ao seu corpo, objetivo e rotina.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Link href="/register" className="w-full bg-ember hover:bg-ember-hover text-white font-bold rounded-xl py-3.5 text-sm transition-colors ember-glow">
              ✨ Criar meu plano grátis
            </Link>
            <Link href="/login" className="w-full border border-border text-muted-foreground hover:text-foreground rounded-xl py-3.5 text-sm font-medium transition-colors">
              Já tenho conta — Entrar
            </Link>
          </div>
        </div>

        <div className="w-full mt-10 space-y-2.5">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 bg-surface2 border border-border rounded-xl p-3.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-ember/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-ember" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
