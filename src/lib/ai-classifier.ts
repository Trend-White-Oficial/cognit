import { Category } from './types';

const KEYWORD_MAP: Record<string, Category> = {
  aluguel: 'moradia',
  condomínio: 'moradia',
  condominio: 'moradia',
  iptu: 'moradia',
  mercado: 'alimentacao',
  supermercado: 'alimentacao',
  ifood: 'alimentacao',
  restaurante: 'alimentacao',
  lanche: 'alimentacao',
  padaria: 'alimentacao',
  delivery: 'alimentacao',
  uber: 'transporte',
  gasolina: 'transporte',
  combustível: 'transporte',
  estacionamento: 'transporte',
  ônibus: 'transporte',
  metrô: 'transporte',
  cinema: 'lazer',
  show: 'lazer',
  bar: 'lazer',
  viagem: 'lazer',
  parque: 'lazer',
  farmácia: 'saude',
  farmacia: 'saude',
  médico: 'saude',
  medico: 'saude',
  hospital: 'saude',
  academia: 'saude',
  curso: 'educacao',
  livro: 'educacao',
  escola: 'educacao',
  faculdade: 'educacao',
  investimento: 'investimentos',
  tesouro: 'investimentos',
  ações: 'investimentos',
  poupança: 'investimentos',
  netflix: 'assinaturas',
  spotify: 'assinaturas',
  disney: 'assinaturas',
  hbo: 'assinaturas',
  amazon: 'assinaturas',
  salário: 'outros',
  salario: 'outros',
  freelance: 'outros',
};

export function classifyTransaction(description: string): Category {
  const lower = description.toLowerCase();
  for (const [keyword, category] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'outros';
}

export function parseQuickInput(input: string): { description: string; value: number; category: Category } | null {
  // Try to parse "iFood 45 reais" or "45 mercado" patterns
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
