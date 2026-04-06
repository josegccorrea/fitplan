import type { OnboardingFormData } from "@/types/onboarding";
import { calcBMI, calcTDEE } from "@/lib/utils/formatters";

export function buildWorkoutPrompt(data: OnboardingFormData): string {
  const bmi = calcBMI(data.weight_kg, data.height_cm).toFixed(1);
  const restDays = 7 - data.available_days_week;

  const equipment: Record<string, string> = {
    academia_maquinas: "máquinas",
    pesos_livres: "pesos livres",
    casa: "casa",
    ao_ar_livre: "ar livre",
    misto: "misto",
  };

  const level: Record<string, string> = {
    iniciante: "iniciante:3series,90-120s",
    intermediario: "intermediario:3-4series,60-90s",
    avancado: "avancado:4-5series,45-60s",
  };

  return `Personal trainer. JSON APENAS, sem texto extra.

PERFIL:peso=${data.weight_kg}kg,altura=${data.height_cm}cm,idade=${data.age},sexo=${data.sex},gordura=${data.body_fat_pct}%,IMC=${bmi}
OBJETIVO:${data.goal}|NIVEL:${level[data.experience_level]}|EQUIP:${equipment[data.equipment_type]}|PREF:${data.prefers_free_weights ? "livres" : "maquinas"}
DIAS:${data.available_days_week}treinos,${restDays}descansos|LESOES:${data.injuries || "nenhuma"}

REGRAS(SIGA EXATAMENTE):
1. 7 dias(0=seg,1=ter,2=qua,3=qui,4=sex,5=sab,6=dom)
2. ${data.available_days_week} dias treino, ${restDays} dias is_rest=true,exercises=[]
3. MAX 4 exercicios/dia treino
4. exercise_key: snake_case s/acento
5. technique_note: MAX 8 palavras
6. rest_tip: MAX 8 palavras ou null
7. Distribua treinos(nao todos seguidos)
8. Casa=apenas peso corporal

FORMATO(complete todos os 7 dias):
{"workout_plan":{"days":[{"day_index":0,"label":"Segunda-feira","focus":"Peito","is_rest":false,"rest_tip":null,"exercises":[{"exercise_key":"supino_reto","name":"Supino Reto","sets":4,"reps":"8-12","rest_seconds":90,"technique_note":"Desça lento, suba explosivo.","muscle_group":"Peito"}]},{"day_index":1,"label":"Terça-feira","focus":"Descanso","is_rest":true,"rest_tip":"Caminhada leve 20min.","exercises":[]}]}}`;
}

export function buildNutritionPrompt(data: OnboardingFormData): string {
  const tdee = calcTDEE(data.weight_kg, data.height_cm, data.age, data.sex);

  const calorieTargets: Record<string, number> = {
    perder_gordura: tdee - 450,
    ganhar_musculo: tdee + 350,
    manter: tdee,
    performance: tdee + 200,
  };

  const kcal = calorieTargets[data.goal] ?? tdee;
  const prot = Math.round(data.weight_kg * 1.8);
  const carbs = Math.round((kcal * 0.4) / 4);
  const fat = Math.round((kcal * 0.25) / 9);

  return `Nutricionista. JSON APENAS, sem texto extra.

PERFIL:peso=${data.weight_kg}kg,objetivo=${data.goal},kcal=${kcal},prot_min=${prot}g
ALERGIAS:${data.allergies.join(",") || "nenhuma"}|NAO_GOSTA:${data.disliked_foods.join(",") || "nenhum"}
OBRIGATORIOS:${data.must_have_foods.join(",") || "nenhum"}|ORCAMENTO:R$${(data.monthly_budget_brl / 30).toFixed(0)}/dia

REGRAS(SIGA EXATAMENTE):
1. 7 dias(0=seg a 6=dom)
2. 3 refeicoes/dia: cafe(07:00), almoco(12:00), jantar(19:00)
3. MAX 3 itens/refeicao
4. Use alimentos brasileiros baratos(frango,ovos,arroz,feijao,batata-doce)
5. NUNCA use alimentos das alergias/nao_gosta
6. Nomes curtos(max 3 palavras)
7. meal_key: snake_case

FORMATO(complete todos os 7 dias):
{"nutrition_plan":{"daily_calories":${kcal},"macros":{"protein_g":${prot},"carbs_g":${carbs},"fat_g":${fat}},"days":[{"day_index":0,"label":"Segunda-feira","total_calories":${kcal},"meals":[{"meal_key":"cafe_da_manha","name":"Café da Manhã","time":"07:00","total_calories":450,"items":[{"name":"Ovos mexidos","quantity":"3 und","calories":210,"protein_g":18,"carbs_g":2,"fat_g":14,"category":"proteina"}]},{"meal_key":"almoco","name":"Almoço","time":"12:00","total_calories":700,"items":[{"name":"Frango grelhado","quantity":"150g","calories":250,"protein_g":45,"carbs_g":0,"fat_g":5,"category":"proteina"}]},{"meal_key":"jantar","name":"Jantar","time":"19:00","total_calories":550,"items":[{"name":"Patinho moído","quantity":"150g","calories":280,"protein_g":38,"carbs_g":0,"fat_g":12,"category":"proteina"}]}]}]}}`;
}
