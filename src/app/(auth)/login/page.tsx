"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flame, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError("E-mail ou senha incorretos.");
      return;
    }

    router.push("/treino");
    router.refresh();
  }

  return (
    <div className="fade-in">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-ember flex items-center justify-center ember-glow">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl text-foreground tracking-wide">
            FitPlan
          </h1>
          <p className="text-xs text-muted-foreground">Treino & Nutrição com IA</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display text-xl text-foreground mb-1">Entrar</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Continue sua jornada de transformação.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              E-mail
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Senha
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-surface2 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ember transition-colors"
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-ember hover:bg-ember-hover text-white font-semibold rounded-xl py-2.5 text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Não tem conta?{" "}
        <Link href="/register" className="text-ember hover:text-ember-hover transition-colors font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
