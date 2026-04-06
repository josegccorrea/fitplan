import type { OnboardingFormData } from "@/types/onboarding";
import { calcBMI, calcTDEE } from "@/lib/utils/formatters";

const DAY_NAMES = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

export function buildWorkoutPrompt(data: OnboardingFormData): string {
  const bmi = calcBMI(data.weight_kg, data.height_cm).toFixed(1);
  const trainingDays = data.training_days ?? [1, 3, 5];
  const restDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !trainingDays.includes(d));

  const equipment: Record<string, string> = {
    academia_maquinas: "academia com máquinas (leg press, pulley, peck deck, smith, cabo)",
    pesos_livres: "pesos livres (barras olímpicas, halteres, kettlebells)",
    casa: "casa — APENAS exercícios com peso corporal (flexão, agachamento, afundo, prancha, barra fixa)",
    ao_ar_livre: "ao ar livre (barras fixas, peso corporal, corrida)",
    misto: "academia mista (máquinas + pesos livres combinados)",
  };

  const levelGuide: Record<string, string> = {
    iniciante: "3 séries por exercício, descanso 90-120s, foco em técnica, cargas moderadas",
    intermediario: "3-4 séries por exercício, descanso 60-90s, sobrecarga progressiva",
    avancado: "4-5 séries por exercício, descanso 45-60s, técnicas avançadas (drop-set, super-set)",
  };

  const trainingDaysList = trainingDays
    .map((d) => `${d} (${DAY_NAMES[d]})`)
    .join(", ");
  const restDaysList = restDays
    .map((d) => `${d} (${DAY_NAMES[d]})`)
    .join(", ");

  return `Você é um personal trainer especializado. Responda APENAS com JSON válido, sem texto extra, sem markdown.

### PERFIL DO USUÁRIO
- Nome: ${data.full_name}
- Peso: ${data.weight_kg}kg | Altura: ${data.height_cm}cm | IMC: ${bmi}
- Idade: ${data.age} anos | Sexo: ${data.sex}
- % Gordura estimado: ${data.body_fat_pct}%
- Objetivo: ${data.goal}
- Nível: ${data.experience_level} — ${levelGuide[data.experience_level]}
- Equipamento disponível: ${equipment[data.equipment_type]}
- Preferência: ${data.prefers_free_weights ? "pesos livres quando possível" : "máquinas quando possível"}
- Lesões/restrições: ${data.injuries || "nenhuma"}

### DIAS DA SEMANA (índices 0=Seg a 6=Dom)
- DIAS DE TREINO RESISTIDO: ${trainingDaysList}
- DIAS DE DESCANSO ATIVO: ${restDaysList}

### PRINCÍPIOS CIENTÍFICOS — APLICAR OBRIGATORIAMENTE
1. SOBRECARGA PROGRESSIVA: Em cada technique_note, mencione a "regra dos 2+2": quando completar todas as séries com 2 repetições extras, aumente 2,5-5kg.
2. GRUPOS MUSCULARES: Não treinar o mesmo grupo muscular em dias consecutivos (respeit 48h de recuperação).
3. ESTRUTURA POR DIA DE TREINO: 1-2 exercícios compostos (agachamento, supino, levantamento, remada) + 2-3 isolamentos + 1 exercício cardiovascular ao final.
4. CARDIO EM TODOS OS DIAS:
   - Dias de treino resistido: adicionar 1 exercício cardiovascular ao FINAL da sessão (10-15 min HIIT ou esteira inclinada), com muscle_group "cardiovascular"
   - Dias de descanso (is_rest=true): no rest_tip, indicar cardio leve LISS 20-30 min (caminhada, bicicleta, natação)
5. FREQUÊNCIA: Distribuição ótima é 4x/semana para recomposição corporal; respeite os dias escolhidos pelo usuário.
6. RECUPERAÇÃO: Nos dias de descanso, rest_tip deve mencionar sono 7-9h e hidratação 35ml/kg de peso.

### REGRAS DE GERAÇÃO
1. Gere exatamente 7 dias (day_index 0 a 6)
2. Dias de treino (${trainingDaysList}): is_rest=false, 5-6 exercícios (sendo o último sempre cardiovascular)
3. Dias de descanso (${restDaysList}): is_rest=true, exercises=[], rest_tip com orientação de cardio LISS + recuperação
4. exercise_key: snake_case sem acentos (ex: "supino_reto", "agachamento_livre")
5. technique_note: máximo 12 palavras, incluir dica de sobrecarga progressiva
6. reps: string como "8-12" ou "12-15" ou "30s"
7. rest_seconds: número inteiro
8. equipment: nome do equipamento usado (ex: "barra", "halter", "máquina", "peso corporal")
9. ${data.equipment_type === "casa" ? "OBRIGATÓRIO: apenas exercícios com peso corporal — sem equipamentos" : "Use os equipamentos disponíveis"}

### FORMATO DE SAÍDA (JSON exato)
{"workout_plan":{"days":[{"day_index":0,"label":"Segunda-feira","focus":"Peito e Tríceps","is_rest":false,"rest_tip":null,"exercises":[{"exercise_key":"supino_reto","name":"Supino Reto com Barra","sets":4,"reps":"8-12","rest_seconds":90,"technique_note":"Regra 2+2: 2 reps extras = aumente 2,5kg.","muscle_group":"Peito","equipment":"barra"},{"exercise_key":"supino_inclinado_halter","name":"Supino Inclinado com Halteres","sets":3,"reps":"10-12","rest_seconds":75,"technique_note":"Cotovelhos a 45°, desça controlado.","muscle_group":"Peito","equipment":"halter"},{"exercise_key":"crucifixo_maquina","name":"Crucifixo na Máquina","sets":3,"reps":"12-15","rest_seconds":60,"technique_note":"Foco na contração final do peito.","muscle_group":"Peito","equipment":"máquina"},{"exercise_key":"triceps_pulley","name":"Tríceps no Pulley","sets":3,"reps":"12-15","rest_seconds":60,"technique_note":"Cotovelhos fixos, estenda completamente.","muscle_group":"Tríceps","equipment":"cabo"},{"exercise_key":"triceps_testa","name":"Tríceps Testa","sets":3,"reps":"10-12","rest_seconds":60,"technique_note":"Desça até testa, suba explosivo.","muscle_group":"Tríceps","equipment":"barra"},{"exercise_key":"esteira_inclinada","name":"Esteira Inclinada","sets":1,"reps":"12min","rest_seconds":0,"technique_note":"Inclinação 8-10%, ritmo moderado constante.","muscle_group":"cardiovascular","equipment":"esteira"}]},{"day_index":1,"label":"Terça-feira","focus":"Descanso Ativo","is_rest":true,"rest_tip":"Caminhada 25 min + sono 8h + beba 2,5L água.","exercises":[]}]}}`;
}

export function buildNutritionPrompt(data: OnboardingFormData): string {
  const tdee = calcTDEE(data.weight_kg, data.height_cm, data.age, data.sex);

  const calorieTargets: Record<string, number> = {
    perder_gordura: tdee - 500,
    ganhar_musculo: tdee + 350,
    manter: tdee,
    performance: tdee + 200,
  };

  const kcal = calorieTargets[data.goal] ?? tdee;

  // Macros balanceados: proteína fixa, gordura 25%, carboidrato fecha a conta
  const prot = Math.round(data.weight_kg * 2.0);
  const protKcal = prot * 4;
  const fatKcal = Math.round(kcal * 0.25);
  const fat = Math.round(fatKcal / 9);
  const carbs = Math.round((kcal - protKcal - fatKcal) / 4);

  const dailyBudget = (data.monthly_budget_brl / 30).toFixed(0);

  return `Você é um nutricionista esportivo especializado em culinária brasileira. Responda APENAS com JSON válido, sem texto extra, sem markdown.

### PERFIL DO USUÁRIO
- Peso: ${data.weight_kg}kg | Objetivo: ${data.goal}
- Meta calórica diária: ${kcal} kcal
- Macros alvo: proteína ${prot}g (${protKcal} kcal) | gordura ${fat}g (${fatKcal} kcal) | carboidratos ${carbs}g (${kcal - protKcal - fatKcal} kcal)
- Alergias: ${data.allergies.join(", ") || "nenhuma"}
- Não gosta de: ${data.disliked_foods.join(", ") || "nenhum"}
- Alimentos obrigatórios: ${data.must_have_foods.join(", ") || "nenhum"}
- Orçamento: R$${dailyBudget}/dia

### PRINCÍPIOS CIENTÍFICOS — APLICAR OBRIGATORIAMENTE
1. PROTEÍNA: Distribua ${prot}g de proteína em 4 refeições (meta 25-40g por refeição). Fontes: frango, atum, ovos, carne magra, whey, iogurte grego.
2. VARIEDADE MEDITERRÂNEA: Inclua ao menos 1 item vegetal (salada, legumes, folhas verdes, tomate, abobrinha, brócolis, cenoura) no almoço E no jantar.
3. DEFICIT SEGURO: Meta de ${kcal} kcal/dia (deficit de ${data.goal === "perder_gordura" ? "500" : "0"} kcal). Nunca abaixo de 1500 kcal para homens, 1300 para mulheres.
4. LEGUMINOSAS: Inclua feijão, lentilha ou grão-de-bico ao menos 1x/dia (fibras + proteína vegetal).
5. GORDURAS BOAS: Use azeite de oliva como tempero no almoço/jantar.
6. HIDRATAÇÃO: O lanche da tarde deve incluir um item de hidratação (água de coco, chá verde, água com limão).

### REGRAS DE GERAÇÃO
1. Gere exatamente 7 dias (day_index 0 a 6)
2. Cada dia tem EXATAMENTE 4 refeições:
   - Café da Manhã: 07:00 (meal_key: "cafe_da_manha")
   - Almoço: 12:00 (meal_key: "almoco")
   - Lanche da Tarde: 16:00 (meal_key: "lanche_tarde")
   - Jantar: 20:00 (meal_key: "jantar")
3. Máximo 3 itens por refeição
4. NUNCA use alimentos das listas de alergias ou não_gosta
5. Inclua os alimentos obrigatórios distribuídos ao longo da semana
6. Nomes dos alimentos: máximo 3 palavras, em português brasileiro
7. meal_key: snake_case sem acentos
8. quantity: formato "150g", "2 und", "1 xíc", "200ml"
9. As calorias dos itens de cada refeição devem somar o total_calories da refeição
10. A soma dos total_calories das 4 refeições deve ser próxima de ${kcal} kcal
11. Use alimentos baratos e acessíveis: frango, ovos, arroz, feijão, batata-doce, atum, iogurte, banana, aveia, espinafre

### DISTRIBUIÇÃO CALÓRICA SUGERIDA
- Café da manhã: ~${Math.round(kcal * 0.22)} kcal
- Almoço: ~${Math.round(kcal * 0.35)} kcal
- Lanche da tarde: ~${Math.round(kcal * 0.13)} kcal
- Jantar: ~${Math.round(kcal * 0.30)} kcal

### FORMATO DE SAÍDA (JSON exato)
{"nutrition_plan":{"daily_calories":${kcal},"macros":{"protein_g":${prot},"carbs_g":${carbs},"fat_g":${fat}},"days":[{"day_index":0,"label":"Segunda-feira","total_calories":${kcal},"meals":[{"meal_key":"cafe_da_manha","name":"Café da Manhã","time":"07:00","total_calories":${Math.round(kcal * 0.22)},"items":[{"name":"Ovos mexidos","quantity":"3 und","calories":210,"protein_g":18,"carbs_g":2,"fat_g":14,"category":"proteina"},{"name":"Aveia com banana","quantity":"50g + 1 und","calories":220,"protein_g":6,"carbs_g":45,"fat_g":3,"category":"carboidrato"}]},{"meal_key":"almoco","name":"Almoço","time":"12:00","total_calories":${Math.round(kcal * 0.35)},"items":[{"name":"Frango grelhado","quantity":"150g","calories":250,"protein_g":45,"carbs_g":0,"fat_g":5,"category":"proteina"},{"name":"Arroz integral","quantity":"150g","calories":195,"protein_g":4,"carbs_g":42,"fat_g":1,"category":"carboidrato"},{"name":"Salada verde","quantity":"100g","calories":25,"protein_g":2,"carbs_g":4,"fat_g":0,"category":"vegetal"}]},{"meal_key":"lanche_tarde","name":"Lanche da Tarde","time":"16:00","total_calories":${Math.round(kcal * 0.13)},"items":[{"name":"Iogurte grego","quantity":"170g","calories":130,"protein_g":17,"carbs_g":8,"fat_g":3,"category":"laticinios"},{"name":"Água de coco","quantity":"300ml","calories":60,"protein_g":1,"carbs_g":14,"fat_g":0,"category":"outro"}]},{"meal_key":"jantar","name":"Jantar","time":"20:00","total_calories":${Math.round(kcal * 0.30)},"items":[{"name":"Patinho moído","quantity":"150g","calories":280,"protein_g":38,"carbs_g":0,"fat_g":12,"category":"proteina"},{"name":"Batata-doce","quantity":"150g","calories":130,"protein_g":2,"carbs_g":30,"fat_g":0,"category":"carboidrato"},{"name":"Brócolis refogado","quantity":"100g","calories":55,"protein_g":4,"carbs_g":8,"fat_g":2,"category":"vegetal"}]}]}]}}`;
}
