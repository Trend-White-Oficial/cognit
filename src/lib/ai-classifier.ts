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

export function generateInsight(totalIncome: number, totalExpenses: number, expensesByCategory: Record<string, number>): string {
  const remaining = totalIncome - totalExpenses;
  const daysInMonth = 30;
  const today = new Date().getDate();
  const daysLeft = daysInMonth - today;
  const dailyBurn = totalExpenses / Math.max(today, 1);
  const projected = totalExpenses + dailyBurn * daysLeft;
  const projectedBalance = totalIncome - projected;

  const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];

  if (projectedBalance < 0) {
    return `⚠️ Atenção preventiva — No ritmo atual de despesas, o saldo projetado para o final do mês pode ficar negativo em R$ ${Math.abs(projectedBalance).toFixed(0)}. Deseja acompanhar esse padrão com mais atenção?`;
  }

  if (topCategory && topCategory[1] / totalExpenses > 0.35) {
    return `📊 Análise do mês — ${((topCategory[1] / totalExpenses) * 100).toFixed(0)}% das suas despesas estão concentradas em ${topCategory[0]}. Se mantiver esse padrão, o saldo final pode ser impactado.`;
  }

  return `✅ Projeção positiva — Com base no seu ritmo atual, o saldo projetado para o final do mês é de R$ ${projectedBalance.toFixed(0)}. Continue mantendo esse equilíbrio.`;
}
