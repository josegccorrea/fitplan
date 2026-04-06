/** Format a number as BRL currency */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Format a date in pt-BR locale */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", options).format(d);
}

/** Format a weight value (e.g. 75.5) */
export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)}kg`;
}

/** Get short day name in pt-BR */
export function getDayShortName(dayIndex: number): string {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  return days[dayIndex] ?? "";
}

/** Get full day name in pt-BR */
export function getDayFullName(dayIndex: number): string {
  const days = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ];
  return days[dayIndex] ?? "";
}

/** Convert JS getDay() (0=Sun) to app day_index (0=Mon) */
export function jsDayToIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Format duration in seconds to MM:SS */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Calculate BMI */
export function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

/** Estimate TDEE using Mifflin-St Jeor */
export function calcTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: "masculino" | "feminino" | "outro",
  activityFactor = 1.55 // Moderate activity
): number {
  let bmr: number;
  if (sex === "masculino") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  return Math.round(bmr * activityFactor);
}
