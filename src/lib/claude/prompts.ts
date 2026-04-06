import type { OnboardingFormData } from "@/types/onboarding";
import { calcBMI, calcTDEE } from "@/lib/utils/formatters";

const goalDescriptions: Record<string, string> = {
  perder_gordura:
    "PERDER GORDURA: déficit calórico de 400-500 kcal abaixo do TDEE. Priorizar proteína alta para preservar massa magra.",
  ganhar_musculo:
    "GANHAR MÚSCULO: superávit limpo de 300-400 kcal acima do TDEE. Carboidratos suficientes para treino e recuperação.",
  manter:
    "MANUTENÇÃO: calorias iguais ao TDEE. Manter composição corporal atual.",
  performance:
    "PERFORMANCE: +200 kcal acima do TDEE, foco em carboidratos peri-treino para energia máxima.",
};

const equipmentDescriptions: Record<string, string> = {
  academia_maquinas: "academia com máquinas (leg press, peck deck, pulley, etc.)",
  pesos_livres: "academia com pesos livres (barras, halteres, kettlebells)",
  casa: "em casa sem equipamentos (peso corporal, móveis como suporte)",
  ao_ar_livre: "ao ar livre (calçada, parque, barras fixas)",
  misto: "academia mista com máquinas e pesos livres",
};

const levelDescriptions: Record<string, string> = {
  iniciante: "INICIANTE (0-1 ano): 3 séries por exercício, movimentos compostos básicos, descanso 90-120s, progressão por adição de peso semana a semana",
  intermediario: "INTERMEDIÁRIO (1-3 anos): 3-4 séries, variação de exercícios, periodização ondulatória, descanso 60-90s",
  avancado: "AVANÇADO (3+ anos): 4-5 séries, técnicas especiais (drop-set, bi-set, pausa), descanso 45-60s, volume alto",
};

export function buildPlanGenerationPrompt(data: OnboardingFormData): string {
  const bmi = calcBMI(data.weight_kg, data.height_cm).toFixed(1);
  const tdee = calcTDEE(data.weight_kg, data.height_cm, data.age, data.sex);
  const restDays = 7 - data.available_days_week;

  return `Você é um personal trainer e nutricionista certificado com 15 anos de experiência científica.
Crie planos ALTAMENTE PERSONALIZADOS para este usuário. Responda APENAS com JSON válido, sem markdown, sem texto fora do JSON.

## PERFIL DO USUÁRIO
- Nome: ${data.full_name}
- Peso: ${data.weight_kg}kg | Altura: ${data.height_cm}cm | Idade: ${data.age} anos | Sexo: ${data.sex}
- Gordura corporal estimada: ${data.body_fat_pct}% | IMC: ${bmi} | TDEE estimado: ${tdee} kcal/dia

## OBJETIVO
${goalDescriptions[data.goal]}

## NÍVEL E EQUIPAMENTO
- ${levelDescriptions[data.experience_level]}
- Equipamento: ${equipmentDescriptions[data.equipment_type]}
- Preferência: ${data.prefers_free_weights ? "PESOS LIVRES (priorizar sobre máquinas)" : "MÁQUINAS (priorizar sobre pesos livres)"}

## DISPONIBILIDADE
- Dias de treino por semana: ${data.available_days_week} (os outros ${restDays} são descanso)
- Distribua os treinos estrategicamente ao longo da semana (não coloque todos seguidos)

## RESTRIÇÕES ALIMENTARES
- Alergias/intolerâncias: ${data.allergies.length > 0 ? data.allergies.join(", ") : "nenhuma"}
- Alimentos que não gosta: ${data.disliked_foods.length > 0 ? data.disliked_foods.join(", ") : "nenhum"}
- Lesões/restrições físicas: ${data.injuries || "nenhuma"}

## PREFERÊNCIAS ALIMENTARES
- Alimentos obrigatórios no cardápio: ${data.must_have_foods.length > 0 ? data.must_have_foods.join(", ") : "nenhum"}
- Orçamento mensal para alimentação: R$ ${data.monthly_budget_brl} (aprox. R$ ${(data.monthly_budget_brl / 30).toFixed(0)}/dia)
  → Priorize alimentos acessíveis e disponíveis em supermercados brasileiros

## REGRAS PARA O PLANO DE TREINO
1. Crie EXATAMENTE 7 dias (day_index 0=segunda a 6=domingo)
2. ${data.available_days_week} dias com treino, ${restDays} dias de descanso
3. Cada exercício deve ter: nome em português, séries, repetições (pode ser range "8-12"),
   tempo de descanso em segundos, nota técnica importante, grupo muscular, equipamento
4. exercise_key em snake_case sem acentos (ex: "supino_reto_barra")
5. Para dias de descanso: is_rest=true, exercises=[]
6. Varie os grupos musculares para máxima recuperação
7. Inclua cardio apenas quando fizer sentido (não é obrigatório todo dia)
8. Para casa sem equipamento: use apenas peso corporal (flexão, agachamento, prancha, etc.)

## REGRAS PARA O PLANO ALIMENTAR
1. Crie 7 dias distintos de alimentação (não repita os mesmos dias)
2. Calorias baseadas no objetivo:
   - perder_gordura: ${tdee - 450} kcal (déficit de 450 kcal)
   - ganhar_musculo: ${tdee + 350} kcal (superávit de 350 kcal)
   - manter: ${tdee} kcal
   - performance: ${tdee + 200} kcal
3. Proteína: mínimo 1.8g/kg = ${Math.round(data.weight_kg * 1.8)}g/dia
4. Cada dia: 4-6 refeições com nome, horário e itens detalhados
5. NUNCA use alimentos das alergias ou lista de não gosta
6. SEMPRE inclua os alimentos obrigatórios quando possível
7. Use alimentos do mercado brasileiro: frango, patinho, ovos, arroz, feijão, batata-doce,
   mandioca, frutas tropicais, iogurte grego, whey protein, etc.
8. Respeite o orçamento: prefira cortes baratos de proteína, ovos, leguminosas

## FORMATO OBRIGATÓRIO DO JSON

{
  "workout_plan": {
    "days": [
      {
        "day_index": 0,
        "label": "Segunda-feira",
        "focus": "string — ex: Peito e Tríceps",
        "is_rest": false,
        "rest_tip": null,
        "exercises": [
          {
            "exercise_key": "supino_reto_barra",
            "name": "Supino Reto com Barra",
            "sets": 4,
            "reps": "8-12",
            "rest_seconds": 90,
            "technique_note": "Desça a barra até tocar levemente o peito, empurre para cima mantendo os pés no chão.",
            "muscle_group": "Peito",
            "equipment": "Barra + Banco"
          }
        ]
      },
      {
        "day_index": 2,
        "label": "Quarta-feira",
        "focus": "Descanso Ativo",
        "is_rest": true,
        "rest_tip": "Caminhada leve de 20-30 minutos ou alongamento geral. O crescimento muscular acontece durante o descanso!",
        "exercises": []
      }
    ]
  },
  "nutrition_plan": {
    "daily_calories": 2200,
    "macros": {
      "protein_g": 180,
      "carbs_g": 220,
      "fat_g": 65
    },
    "days": [
      {
        "day_index": 0,
        "label": "Segunda-feira",
        "total_calories": 2200,
        "meals": [
          {
            "meal_key": "cafe_da_manha",
            "name": "Café da Manhã",
            "time": "07:00",
            "total_calories": 480,
            "items": [
              {
                "name": "Ovos mexidos",
                "quantity": "3 unidades",
                "calories": 210,
                "protein_g": 18,
                "carbs_g": 2,
                "fat_g": 14,
                "category": "proteina"
              }
            ]
          }
        ]
      }
    ]
  }
}`;
}
