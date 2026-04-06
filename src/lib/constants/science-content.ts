export interface ScienceArticle {
  id: string;
  category: "treino" | "nutricao" | "recuperacao" | "comportamento";
  color: "ember" | "gold" | "success" | "chart-4";
  emoji: string;
  title: string;
  summary: string;
  detail: string;
}

export const SCIENCE_ARTICLES: ScienceArticle[] = [
  {
    id: "1",
    category: "treino",
    color: "ember",
    emoji: "💪",
    title: "Musculação é insubstituível para perda de gordura",
    summary: "Meta-análise 2025 com 6.934 participantes mostrou que musculação protege massa magra, aumenta perda de gordura e melhora força — resultados que cardio isolado não consegue.",
    detail: "Homens que combinaram musculação com dieta ganharam +0,8 kg de massa magra enquanto perdiam −8,9 kg de gordura. A taxa metabólica basal permanece elevada por 24-48h após o treino.",
  },
  {
    id: "2",
    category: "treino",
    color: "ember",
    emoji: "📅",
    title: "4x por semana é o ponto ideal de frequência",
    summary: "Estudo controlado: treinar 4+ vezes por semana foi a única frequência que reduziu significativamente gordura corporal (p=0,004) comparada a frequências menores.",
    detail: "Frequências menores (2-3x) são ótimas para manutenção e força, mas para recomposição corporal significativa, 4x semanais com boa recuperação é o sweet spot.",
  },
  {
    id: "3",
    category: "treino",
    color: "gold",
    emoji: "🔥",
    title: "Treino combinado supera cardio isolado",
    summary: "Network meta-análise da AHA com 81 estudos: treino combinado (musculação + cardio) é a modalidade mais eficaz para melhora cardiometabólica global em adultos.",
    detail: "A combinação não precisa ser no mesmo dia. Alternar dias de musculação com cardio moderado (LISS) oferece os benefícios de ambos sem comprometer a recuperação.",
  },
  {
    id: "4",
    category: "treino",
    color: "ember",
    emoji: "📈",
    title: "Sobrecarga progressiva é a chave do progresso",
    summary: "O músculo só cresce quando submetido a estresse progressivamente maior. Aumentar peso, repetições, séries ou diminuir descanso são formas de gerar sobrecarga.",
    detail: "A regra dos 2+2: quando você completa 2 séries com 2 repetições a mais que o alvo, aumente o peso em 2,5-5kg no próximo treino. Simples e eficaz.",
  },
  {
    id: "5",
    category: "nutricao",
    color: "gold",
    emoji: "🥩",
    title: "Proteína: 1,6–2,4g/kg/dia para hipertrofia",
    summary: "Kokura et al. 2024 (47 estudos, n=3.218): ingestão >1,3g/kg/dia resulta em aumento de massa muscular mesmo durante déficit calórico.",
    detail: "Distribua em 4-5 refeições de 25-40g cada. A síntese proteica muscular é maximizada com doses de 0,3-0,4g/kg por refeição. Whey e ovos têm o melhor perfil de aminoácidos.",
  },
  {
    id: "6",
    category: "nutricao",
    color: "gold",
    emoji: "⚖️",
    title: "Déficit de 500 kcal/dia é o ideal para perda de gordura",
    summary: "Déficit seguro e eficaz para perda de 0,5–1 kg por semana sem comprometer massa magra ou performance. Nunca abaixo de 1.500 kcal/dia para homens.",
    detail: "O estudo MATADOR mostrou que pausas na dieta a cada 2-4 semanas (diet breaks) melhoram resultados a longo prazo, reduzindo adaptação metabólica.",
  },
  {
    id: "7",
    category: "nutricao",
    color: "chart-4",
    emoji: "🫒",
    title: "Dieta mediterrânea preserva mais massa magra",
    summary: "PREDIMED-Plus (3 anos): dieta mediterrânea hipocalórica + exercício reduziu gordura visceral e preservou mais massa magra que outras dietas.",
    detail: "Pilares: azeite de oliva, peixes gordurosos (salmão, sardinha, atum), leguminosas, grãos integrais e vegetais coloridos. O padrão alimentar importa mais que alimentos individuais.",
  },
  {
    id: "8",
    category: "recuperacao",
    color: "success",
    emoji: "😴",
    title: "Sono: o anabolizante gratuito",
    summary: "Menos de 7h de sono reduz em 60% a síntese de hormônio do crescimento e aumenta o cortisol — sabotando todos os seus esforços na academia.",
    detail: "7-9 horas de sono por noite é fundamental. Melhore a qualidade: ambiente escuro e frio (18-20°C), horários regulares, sem telas 1h antes de dormir, cafeína apenas pela manhã.",
  },
  {
    id: "9",
    category: "recuperacao",
    color: "success",
    emoji: "💧",
    title: "Hidratação e performance",
    summary: "Desidratação de apenas 2% do peso corporal reduz performance em 10-20%. Água é o suplemento mais barato e eficaz que existe.",
    detail: "Beba 35ml/kg/dia como base. Em dias de treino intenso ou calor, adicione 500-750ml. A cor da urina é um bom indicador: amarelo claro = bem hidratado.",
  },
  {
    id: "10",
    category: "comportamento",
    color: "chart-4",
    emoji: "🧠",
    title: "Consistência > Perfeição",
    summary: "80% de consistência por 12 meses supera 100% de 'perfeição' por 2 meses seguido de abandono. O melhor plano é o que você consegue seguir.",
    detail: "Estudos de aderência mostram que planos muito restritivos ou intensos têm taxa de abandono de 70% em 3 meses. Prefira mudanças graduais e sustentáveis.",
  },
];
