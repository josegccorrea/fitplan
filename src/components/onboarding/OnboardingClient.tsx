"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { STEP_COUNT } from "@/types/onboarding";
import type { OnboardingFormData } from "@/types/onboarding";
import { Step1BodyData } from "./Step1BodyData";
import { Step2Goals } from "./Step2Goals";
import { Step3Experience } from "./Step3Experience";
import { Step4Restrictions } from "./Step4Restrictions";
import { Step5Foods } from "./Step5Foods";
import { Step6Preferences } from "./Step6Preferences";
import { GeneratingPlan } from "./GeneratingPlan";

const STORAGE_KEY = "fitplan_onboarding";

function loadSaved(): Partial<OnboardingFormData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

interface Props {
  initialStep: number;
}

export function OnboardingClient({ initialStep }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>(loadSaved);

  function handleStepData(data: Partial<OnboardingFormData>) {
    const merged = { ...formData, ...data };
    setFormData(merged);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  function goNext() {
    const next = step + 1;
    if (next > STEP_COUNT) return;
    setStep(next);
    router.push(`/onboarding/step/${next}`);
  }

  function goBack() {
    const prev = step - 1;
    if (prev < 1) return;
    setStep(prev);
    router.push(`/onboarding/step/${prev}`);
  }

  async function handleFinish(lastData: Partial<OnboardingFormData>) {
    const final = { ...formData, ...lastData } as OnboardingFormData;
    setFormData(final);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(final),
      });

      if (!res.ok) {
        let errorMsg = "Erro ao gerar plano";
        try {
          const err = await res.json();
          errorMsg = err.error ?? errorMsg;
        } catch {
          const text = await res.text().catch(() => "");
          if (text.toLowerCase().includes("timeout") || res.status === 504) {
            errorMsg = "A geração demorou muito. Tente novamente.";
          }
        }
        throw new Error(errorMsg);
      }

      sessionStorage.removeItem(STORAGE_KEY);
      router.push("/treino");
    } catch (error) {
      console.error(error);
      setGenerating(false);
      alert(
        error instanceof Error
          ? error.message
          : "Erro inesperado. Tente novamente."
      );
    }
  }

  if (generating) {
    return <GeneratingPlan name={formData.full_name ?? ""} />;
  }

  const progressPct = ((step - 1) / STEP_COUNT) * 100;

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-ember flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-lg text-foreground tracking-wide">
                FitPlan
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {step}/{STEP_COUNT}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-ember rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {step === 1 && (
          <Step1BodyData
            defaultValues={formData}
            onNext={(data) => { handleStepData(data); goNext(); }}
          />
        )}
        {step === 2 && (
          <Step2Goals
            defaultValues={formData}
            onNext={(data) => { handleStepData(data); goNext(); }}
            onBack={goBack}
          />
        )}
        {step === 3 && (
          <Step3Experience
            defaultValues={formData}
            onNext={(data) => { handleStepData(data); goNext(); }}
            onBack={goBack}
          />
        )}
        {step === 4 && (
          <Step4Restrictions
            defaultValues={formData}
            onNext={(data) => { handleStepData(data); goNext(); }}
            onBack={goBack}
          />
        )}
        {step === 5 && (
          <Step5Foods
            defaultValues={formData}
            onNext={(data) => { handleStepData(data); goNext(); }}
            onBack={goBack}
          />
        )}
        {step === 6 && (
          <Step6Preferences
            defaultValues={formData}
            onFinish={handleFinish}
            onBack={goBack}
          />
        )}
      </main>
    </div>
  );
}
