import { Category, PaymentMethod, TransactionType } from './types';

// Simple confidence-based classification for transactions
export function classifyWithConfidence(text: string): { category: Category; confidence: number; method: PaymentMethod } {
  const lowerText = text.toLowerCase();
  
  // Payment method detection
  let method: PaymentMethod = 'unknown';
  if (lowerText.includes('pix')) method = 'pix';
  else if (lowerText.includes('débito') || lowerText.includes('debit')) method = 'debit';
  else if (lowerText.includes('crédito') || lowerText.includes('credit')) method = 'credit';
  else if (lowerText.includes('boleto')) method = 'boleto';
  else if (lowerText.includes('ted')) method = 'ted';
  else if (lowerText.includes('doc')) method = 'doc';
  else if (lowerText.includes('dinheiro') || lowerText.includes('cash')) method = 'cash';

  // Category detection with confidence scoring
  const categoryScores: Record<Category, number> = {
    // Income categories
    salario: 0,
    pro_labore: 0,
    vendas: 0,
    servicos: 0,
    vendas_servicos: 0,
    renda_extra: 0,
    rendimentos_financeiros: 0,
    reembolsos: 0,
    transferencias_recebidas: 0,
    outros_recebimentos: 0,
    // Expense categories
    moradia: 0,
    telecomunicacoes: 0,
    energia: 0,
    agua_gas: 0,
    alimentacao: 0,
    transporte: 0,
    saude: 0,
    academia: 0,
    educacao: 0,
    lazer: 0,
    cartao_credito: 0,
    impostos: 0,
    impostos_taxas: 0,
    familia: 0,
    assinaturas: 0,
    investimentos: 0,
    transferencias_enviadas: 0,
    outros: 0,
  };

  // Income keywords
  if (lowerText.includes('salário') || lowerText.includes('salary')) categoryScores.salario += 10;
  if (lowerText.includes('pró-labore') || lowerText.includes('pro labore')) categoryScores.pro_labore += 10;
  if (lowerText.includes('venda') || lowerText.includes('sale')) categoryScores.vendas += 8;
  if (lowerText.includes('serviço') || lowerText.includes('service')) categoryScores.servicos += 8;
  if (lowerText.includes('freelance') || lowerText.includes('bico')) categoryScores.renda_extra += 8;
  if (lowerText.includes('dividendo') || lowerText.includes('rendimento')) categoryScores.rendimentos_financeiros += 8;
  if (lowerText.includes('reembolso') || lowerText.includes('refund')) categoryScores.reembolsos += 8;
  if (lowerText.includes('transferência recebida')) categoryScores.transferencias_recebidas += 8;

  // Expense keywords
  if (lowerText.includes('aluguel') || lowerText.includes('condomínio') || lowerText.includes('rent')) categoryScores.moradia += 10;
  if (lowerText.includes('internet') || lowerText.includes('vivo') || lowerText.includes('claro') || lowerText.includes('oi') || lowerText.includes('tim')) categoryScores.telecomunicacoes += 10;
  if (lowerText.includes('energia') || lowerText.includes('luz') || lowerText.includes('eletricidade')) categoryScores.energia += 10;
  if (lowerText.includes('água') || lowerText.includes('gás')) categoryScores.agua_gas += 10;
  if (lowerText.includes('mercado') || lowerText.includes('restaurante') || lowerText.includes('delivery') || lowerText.includes('comida') || lowerText.includes('food')) categoryScores.alimentacao += 10;
  if (lowerText.includes('combustível') || lowerText.includes('uber') || lowerText.includes('99') || lowerText.includes('táxi') || lowerText.includes('passagem')) categoryScores.transporte += 10;
  if (lowerText.includes('farmácia') || lowerText.includes('médico') || lowerText.includes('hospital') || lowerText.includes('saúde')) categoryScores.saude += 10;
  if (lowerText.includes('academia') || lowerText.includes('musculação') || lowerText.includes('gym')) categoryScores.academia += 10;
  if (lowerText.includes('curso') || lowerText.includes('escola') || lowerText.includes('educação')) categoryScores.educacao += 10;
  if (lowerText.includes('cinema') || lowerText.includes('viagem') || lowerText.includes('diversão') || lowerText.includes('lazer')) categoryScores.lazer += 10;
  if (lowerText.includes('cartão') || lowerText.includes('fatura')) categoryScores.cartao_credito += 10;
  if (lowerText.includes('imposto') || lowerText.includes('irpf') || lowerText.includes('inss')) categoryScores.impostos += 10;
  if (lowerText.includes('netflix') || lowerText.includes('spotify') || lowerText.includes('assinatura') || lowerText.includes('subscription')) categoryScores.assinaturas += 10;
  if (lowerText.includes('investimento') || lowerText.includes('ação') || lowerText.includes('fundo')) categoryScores.investimentos += 10;
  if (lowerText.includes('transferência enviada')) categoryScores.transferencias_enviadas += 10;

  // Find category with highest score
  let bestCategory: Category = 'outros';
  let bestScore = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat as Category;
    }
  }

  // Calculate confidence (0-1)
  const confidence = Math.min(bestScore / 10, 1);

  return { category: bestCategory, confidence, method };
}

// Classify a single transaction
export function classifyTransaction(text: string): { category: Category; confidence: number } {
  const result = classifyWithConfidence(text);
  return { category: result.category, confidence: result.confidence };
}

// Add category hint for future classification
export function addCategoryHint(term: string, category: Category): void {
  // This is a placeholder for storing hints in localStorage
  try {
    const hints = JSON.parse(localStorage.getItem('category_hints') || '{}');
    hints[term.toLowerCase()] = category;
    localStorage.setItem('category_hints', JSON.stringify(hints));
  } catch (e) {
    // Silently fail if localStorage is not available
  }
}

// Generate insights from transaction patterns
export function generateInsight(transactions: any[]): string {
  if (transactions.length === 0) return "Registre transações para receber insights.";

  const insights = [
    "Acompanhe seus gastos regularmente para identificar padrões.",
    "Categorize suas transações para melhor análise financeira.",
    "Defina metas e acompanhe seu progresso mensal.",
    "Revise suas despesas fixas para identificar oportunidades de economia.",
    "Mantenha um registro de todas as transações para relatórios precisos.",
  ];

  return insights[Math.floor(Math.random() * insights.length)];
}
