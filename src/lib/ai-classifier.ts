import { Category, CategoryHint } from './types';

const KEYWORD_MAP: Record<string, Category> = {
  // Telecomunicações
  vivo: 'telecomunicacoes', claro: 'telecomunicacoes', tim: 'telecomunicacoes',
  oi: 'telecomunicacoes', net: 'telecomunicacoes', gvt: 'telecomunicacoes',
  internet: 'telecomunicacoes', fibra: 'telecomunicacoes', telefone: 'telecomunicacoes', celular: 'telecomunicacoes',
  // Moradia
  aluguel: 'moradia', 'condomínio': 'moradia', condominio: 'moradia', iptu: 'moradia',
  // Energia
  luz: 'energia', energia: 'energia', enel: 'energia', cemig: 'energia', cpfl: 'energia', eletropaulo: 'energia',
  // Água/Gás
  'água': 'agua_gas', agua: 'agua_gas', saae: 'agua_gas', sabesp: 'agua_gas',
  'gás': 'agua_gas', gas: 'agua_gas',
  // Alimentação
  mercado: 'alimentacao', supermercado: 'alimentacao', ifood: 'alimentacao',
  restaurante: 'alimentacao', lanche: 'alimentacao', padaria: 'alimentacao',
  delivery: 'alimentacao', ubereats: 'alimentacao', 'uber eats': 'alimentacao',
  lanchonete: 'alimentacao', 'açougue': 'alimentacao', acougue: 'alimentacao',
  feira: 'alimentacao', hortifruti: 'alimentacao',
  // Transporte
  uber: 'transporte', '99': 'transporte', gasolina: 'transporte',
  'combustível': 'transporte', combustivel: 'transporte', estacionamento: 'transporte',
  'ônibus': 'transporte', onibus: 'transporte', 'metrô': 'transporte', metro: 'transporte',
  'pedágio': 'transporte', pedagio: 'transporte', ipva: 'transporte', oficina: 'transporte',
  // Lazer
  cinema: 'lazer', show: 'lazer', bar: 'lazer', viagem: 'lazer',
  parque: 'lazer', teatro: 'lazer', jogo: 'lazer',
  // Saúde
  'farmácia': 'saude', farmacia: 'saude', 'médico': 'saude', medico: 'saude',
  hospital: 'saude', academia: 'saude', gym: 'saude', smartfit: 'saude',
  dentista: 'saude', consulta: 'saude', exame: 'saude', 'plano de saúde': 'saude',
  // Educação
  curso: 'educacao', livro: 'educacao', escola: 'educacao', faculdade: 'educacao',
  udemy: 'educacao', alura: 'educacao',
  // Investimentos
  investimento: 'investimentos', tesouro: 'investimentos',
  'ações': 'investimentos', acoes: 'investimentos',
  'poupança': 'investimentos', poupanca: 'investimentos',
  cdb: 'investimentos', fundo: 'investimentos',
  // Assinaturas
  netflix: 'assinaturas', spotify: 'assinaturas', disney: 'assinaturas',
  hbo: 'assinaturas', amazon: 'assinaturas', prime: 'assinaturas',
  youtube: 'assinaturas', 'google one': 'assinaturas', icloud: 'assinaturas',
  deezer: 'assinaturas', globoplay: 'assinaturas',
  mensalidade: 'assinaturas', assinatura: 'assinaturas',
  // Rendimentos / Income
  'salário': 'salario', salario: 'salario', 'pro labore': 'salario', folha: 'salario',
  freelance: 'renda_extra', freela: 'renda_extra', bico: 'renda_extra', 'premiação': 'renda_extra',
  rendimento: 'rendimentos_financeiros', dividendo: 'rendimentos_financeiros',
  juros: 'rendimentos_financeiros', cdi: 'rendimentos_financeiros',
  reembolso: 'reembolsos',
  'serviço': 'vendas_servicos', servico: 'vendas_servicos', venda: 'vendas_servicos', nota: 'vendas_servicos',
  // Impostos
  imposto: 'impostos_taxas', taxa: 'impostos_taxas', darf: 'impostos_taxas',
  // Família
  mesada: 'familia',
};

const BANK_NAMES = ['nubank', 'inter', 'santander', 'itau', 'itaú', 'bradesco', 'c6', 'xp', 'neon', 'pan', 'original'];

let categoryHints: CategoryHint[] = [];

export function loadCategoryHints(hints: CategoryHint[]) {
  categoryHints = hints;
}

export function getCategoryHints(): CategoryHint[] {
  return categoryHints;
}

export function addCategoryHint(term: string, category: Category) {
  const normalized = term.toLowerCase().trim();
  const existing = categoryHints.find(h => h.term === normalized && h.category === category);
  if (existing) {
    existing.count++;
  } else {
    categoryHints.push({ term: normalized, category, count: 1 });
  }
}

export function classifyTransaction(description: string): Category {
  const lower = description.toLowerCase();
  const matchedHints = categoryHints
    .filter(h => lower.includes(h.term))
    .sort((a, b) => b.count - a.count);
  if (matchedHints.length > 0) return matchedHints[0].category;
  if (lower.includes('fatura')) {
    for (const bank of BANK_NAMES) {
      if (lower.includes(bank)) return 'cartao_credito';
    }
  }
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'outros';
}

export function classifyWithConfidence(description: string): { category: Category; confidence: number } {
  const lower = description.toLowerCase();
  const matchedHints = categoryHints
    .filter(h => lower.includes(h.term))
    .sort((a, b) => b.count - a.count);
  if (matchedHints.length > 0) {
    const confidence = Math.min(0.7 + matchedHints[0].count * 0.05, 0.95);
    return { category: matchedHints[0].category, confidence };
  }
  if (lower.includes('fatura')) {
    for (const bank of BANK_NAMES) {
      if (lower.includes(bank)) return { category: 'cartao_credito', confidence: 0.85 };
    }
  }
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return { category, confidence: 0.82 };
  }
  return { category: 'outros', confidence: 0.3 };
}

export function parseQuickInput(input: string): { description: string; value: number; category: Category } | null {
  const match1 = input.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:reais|r\$)?$/i);
  const match2 = input.match(/^(\d+(?:[.,]\d+)?)\s*(?:reais|r\$)?\s+(.+)$/i);
  let description = '';
  let value = 0;
  if (match1) {
    description = match1[1].trim();
    value = parseFloat(match1[2].replace(',', '.'));
  } else if (match2) {
    value = parseFloat(match2[1].replace(',', '.'));
    description = match2[2].trim();
  } else {
    return null;
  }
  const category = classifyTransaction(description);
  return { description, value, category };
}

// ── 30+ Smart Insight Messages ──

const INSIGHT_MESSAGES = {
  deficit_critical: [
    (v: string) => `🔴 Alerta: no ritmo atual, seu saldo pode fechar o mês em -${v}. Vamos frear algumas despesas?`,
    (v: string) => `⚠️ Projeção negativa de ${v}. Talvez seja hora de pausar compras não essenciais.`,
    (v: string) => `😬 Se nada mudar, o mês fecha com déficit de ${v}. Quer revisar suas categorias?`,
    (v: string) => `🚨 Sinal vermelho: projeção de -${v} até o fim do mês. Que tal rever assinaturas?`,
  ],
  deficit_mild: [
    (v: string) => `⚡ Atenção: saldo projetado levemente negativo (${v}). Pequenos ajustes resolvem.`,
    (v: string) => `📉 Ritmo apertado — faltam ${v} para equilibrar. Uma despesa a menos já ajuda.`,
  ],
  top_category_high: [
    (cat: string, pct: string) => `📊 ${pct}% dos seus gastos estão em ${cat}. Concentração alta — vale monitorar.`,
    (cat: string, pct: string) => `🎯 ${cat} domina com ${pct}% das saídas. Está dentro do planejado?`,
    (cat: string, pct: string) => `💡 Quase metade dos seus gastos (${pct}%) vai para ${cat}. Normal para você?`,
    (cat: string, pct: string) => `📋 Categoria ${cat} lidera com ${pct}% do total. Se puder reduzir 10%, já faz diferença.`,
  ],
  positive_strong: [
    (v: string) => `🟢 Parabéns! Projeção de +${v} no final do mês. Continue assim!`,
    (v: string) => `✅ Ótimo ritmo — saldo projetado de +${v}. Que tal investir a sobra?`,
    (v: string) => `💪 Mês saudável! Projeção positiva de ${v}. Considere reforçar sua reserva.`,
    (v: string) => `🌟 Finanças equilibradas — saldo projetado: +${v}. Isso é consistência.`,
  ],
  positive_moderate: [
    (v: string) => `📊 Projeção equilibrada: +${v}. Não é folga, mas está controlado.`,
    (v: string) => `⚖️ Saldo projetado de +${v}. Espaço curto, mas no azul.`,
    (v: string) => `🧮 Mês apertado, mas positivo: +${v}. Cada real economizado conta.`,
  ],
  no_expenses: [
    () => `📭 Nenhuma despesa registrada ainda este mês. Comece a registrar para ter análises.`,
    () => `🆕 Mês novo, histórico limpo. Registre seus gastos para o Cognit analisar.`,
  ],
  no_income: [
    () => `💰 Nenhuma receita registrada ainda. Registre seu salário para projeções mais precisas.`,
    () => `📥 Sem entradas este mês. Cadastre suas receitas para ver o panorama completo.`,
  ],
  savings_tip: [
    () => `💡 Dica: lançamentos recorrentes ajudam o Cognit a projetar meses futuros automaticamente.`,
    () => `🧠 Sabia que categorizar corretamente melhora suas análises? O Cognit aprende com você.`,
    () => `📌 Lembre-se: a conferência mensal ajuda a manter tudo organizado. Use o botão no topo.`,
    () => `🎯 Metas financeiras criam compromisso. Já cadastrou as suas?`,
    () => `📊 Relatórios contábeis (DRE e Balanço) ficam mais úteis quanto mais dados você registra.`,
  ],
  weekend: [
    () => `🌴 Final de semana é quando mais gastamos com lazer. Fique de olho!`,
    () => `☕ Fim de semana: bom momento para revisar a semana financeira.`,
  ],
  month_end: [
    () => `📅 Fim do mês chegando — hora de conferir recorrências e dívidas.`,
    () => `🗓️ Últimos dias do mês. Já revisou se todas as contas foram pagas?`,
  ],
  month_start: [
    () => `🚀 Novo mês! Registre seu salário e despesas fixas para começar organizado.`,
    () => `📋 Início de mês: boa hora para cadastrar recorrências e revisar metas.`,
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateInsight(
  totalIncome: number,
  totalExpenses: number,
  expensesByCategory: Record<string, number>,
  fmt?: (v: number) => string
): string {
  const format = fmt || ((v: number) => `R$ ${Math.abs(v).toFixed(0)}`);
  const today = new Date().getDate();
  const dayOfWeek = new Date().getDay();
  const daysInMonth = 30;
  const daysLeft = daysInMonth - today;
  const dailyBurn = totalExpenses / Math.max(today, 1);
  const projected = totalExpenses + dailyBurn * daysLeft;
  const projectedBalance = totalIncome - projected;

  const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];

  // No data cases
  if (totalIncome === 0 && totalExpenses === 0) {
    return pickRandom(INSIGHT_MESSAGES.no_expenses);
  }
  if (totalIncome === 0 && totalExpenses > 0) {
    return pickRandom(INSIGHT_MESSAGES.no_income);
  }
  if (totalExpenses === 0 && totalIncome > 0) {
    return `✅ Receita de ${format(totalIncome)} registrada, sem saídas ainda. Ótimo começo de mês!`;
  }

  // Time-based contextual messages (30% chance)
  if (Math.random() < 0.3) {
    if (today <= 5) return pickRandom(INSIGHT_MESSAGES.month_start);
    if (today >= 26) return pickRandom(INSIGHT_MESSAGES.month_end);
    if (dayOfWeek === 0 || dayOfWeek === 6) return pickRandom(INSIGHT_MESSAGES.weekend);
    return pickRandom(INSIGHT_MESSAGES.savings_tip);
  }

  // Deficit projections
  if (projectedBalance < -500) {
    return pickRandom(INSIGHT_MESSAGES.deficit_critical)(format(Math.abs(projectedBalance)));
  }
  if (projectedBalance < 0) {
    return pickRandom(INSIGHT_MESSAGES.deficit_mild)(format(Math.abs(projectedBalance)));
  }

  // Category concentration
  if (topCategory && totalExpenses > 0 && topCategory[1] / totalExpenses > 0.35) {
    const pct = ((topCategory[1] / totalExpenses) * 100).toFixed(0);
    return pickRandom(INSIGHT_MESSAGES.top_category_high)(topCategory[0], pct);
  }

  // Positive projections
  if (projectedBalance > totalIncome * 0.3) {
    return pickRandom(INSIGHT_MESSAGES.positive_strong)(format(projectedBalance));
  }
  return pickRandom(INSIGHT_MESSAGES.positive_moderate)(format(projectedBalance));
}
