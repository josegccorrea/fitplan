import type { OnboardingFormData } from "@/types/onboarding";
import { calcBMI, calcTDEE } from "@/lib/utils/formatters";

export function buildWorkoutPrompt(data: OnboardingFormData): string {
  const bmi = calcBMI(data.weight_kg, data.height_cm).toFixed(1);
  const restDays = 7 - data.available_days_week;

  const equipmentMap: Record<string, string> = {
    academia_maquinas: "academia com máquinas",
    pesos_livres: "academia pesos livres",
    casa: "casa sem equipamento",
    ao_ar_livre: "ar livre/parque",
    misto: "academia mista",
  };

  const levelMap: Record<string, string> = {
    iniciante: "iniciante (0-1 ano): 3 séries, compostos básicos, descanso 90-120s",
    intermediario: "intermediário (1-3 anos): 3-4 séries, variação de exercícios, descanso 60-90s",
    avancado: "avançado (3+ anos): 4-5 séries, técnicas especiais, descanso 45-60s",
  };

  return `Personal trainer especializado. Responda APENAS com JSON válido, sem texto adicional.

USUÁRIO: ${data.full_name}, ${data.weight_kg}kg, ${data.height_cm}cm, ${data.age}a, ${data.sex}, ${data.body_fat_pct}% gordura, IMC ${bmi}
OBJETIVO: ${data.goal}
NÍVEL: ${levelMap[data.experience_level]}
EQUIPAMENTO: ${equipmentMap[data.equipment_type]}
PREFERÊNCIA: ${data.prefers_free_weights ? "pesos livres" : "máquinas"}
DIAS/SEMANA: ${data.available_days_week} treinos, ${restDays} descansos
LESÕES: ${data.injuries || "nenhuma"}

REGRAS:
- Exatamente 7 dias (day_index 0=seg a 6=dom)
- ${data.available_days_week} dias treino, ${restDays} dias is_rest=true (exercises=[])
- Máximo 5 exercícios por dia de treino
- exercise_key em snake_case sem acentos
- technique_note: 1 frase curta (máx 12 palavras)
- Distribua os dias de treino na semana (não todos seguidos)
- Para casa: apenas peso corporal

JSON obrigatório:
{"workout_plan":{"days":[{"day_index":0,"label":"Segunda-feira","focus":"Peito e Tríceps","is_rest":false,"rest_tip":null,"exercises":[{"exercise_key":"supino_reto","name":"Supino Reto","sets":4,"reps":"8-12","rest_seconds":90,"technique_note":"Desça até o peito, empurre explodindo.","muscle_group":"Peito"}]},{"day_index":1,"label":"Terça-feira","focus":"Descanso","is_rest":true,"rest_tip":"Caminhada leve ou alongamento.","exercises":[]}]}}`;
}

export function buildNutritionPrompt(data: OnboardingFormData): string {
  const tdee = calcTDEE(data.weight_kg, data.height_cm, data.age, data.sex);

  const calorieTargets: Record<string, number> = {
    perder_gordura: tdee - 450,
    ganhar_musculo: tdee + 350,
    manter: tdee,
    performance: tdee + 200,
  };

  const targetCalories = calorieTargets[data.goal] ?? tdee;
  const minProtein = Math.round(data.weight_kg * 1.8);

  return `Nutricionista especializado. Responda APENAS com JSON válido, sem texto adicional.

USUÁRIO: ${data.weight_kg}kg, objetivo: ${data.goal}
CALORIAS ALVO: ${targetCalories} kcal/dia
PROTEÍNA MÍNIMA: ${minProtein}g/dia
ALERGIAS: ${data.allergies.length > 0 ? data.allergies.join(", ") : "nenhuma"}
NÃO GOSTA: ${data.disliked_foods.length > 0 ? data.disliked_foods.join(", ") : "nenhum"}
OBRIGATÓRIOS: ${data.must_have_foods.length > 0 ? data.must_have_foods.join(", ") : "nenhum"}
ORÇAMENTO: R$ ${data.monthly_budget_brl}/mês (R$ ${(data.monthly_budget_brl / 30).toFixed(0)}/dia)

REGRAS:
- Exatamente 7 dias (day_index 0 a 6)
- Exatamente 4 refeições por dia: café da manhã, almoço, lanche, jantar
- Máximo 4 itens por refeição
- Use alimentos do mercado brasileiro acessíveis (frango, ovos, arroz, feijão, batata-doce, etc.)
- NUNCA use alimentos das alergias ou da lista de não gosta
- Inclua os alimentos obrigatórios quando possível
- Respeite o orçamento (prefira cortes baratos)
- meal_key em snake_case sem acentos

JSON obrigatório:
{"nutrition_plan":{"daily_calories":${targetCalories},"macros":{"protein_g":${minProtein},"carbs_g":${Math.round((targetCalories * 0.4) / 4)},"fat_g":${Math.round((targetCalories * 0.25) / 9)}},"days":[{"day_index":0,"label":"Segunda-feira","total_calories":${targetCalories},"meals":[{"meal_key":"cafe_da_manha","name":"Café da Manhã","time":"07:00","total_calories":500,"items":[{"name":"Ovos mexidos","quantity":"3 unidades","calories":210,"protein_g":18,"carbs_g":2,"fat_g":14,"category":"proteina"}]}]}]}}`;
}
