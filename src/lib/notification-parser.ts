import { ParsedTransaction, Category, PaymentMethod, TransactionType } from './types';
import { classifyTransaction } from './ai-classifier';

function extractAmount(text: string): number | null {
  // Match R$ 1.234,56 or R$ 250,00 or 250.00 or 1234,56
  const match = text.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)/);
  if (match) {
    return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
  }
  // Fallback: bare number with comma
  const match2 = text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
  if (match2) {
    return parseFloat(match2[1].replace(/\./g, '').replace(',', '.'));
  }
  // Bare number with dot decimal
  const match3 = text.match(/(\d+\.\d{2})/);
  if (match3) return parseFloat(match3[1]);
  return null;
}

function extractDate(text: string): string {
  // dd/mm/aaaa
  const m1 = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
  // dd/mm (assume current year)
  const m2 = text.match(/(\d{2})\/(\d{2})/);
  if (m2) {
    const year = new Date().getFullYear();
    return `${year}-${m2[2]}-${m2[1]}`;
  }
  return new Date().toISOString().split('T')[0];
}

function extractTime(text: string): string {
  const m = text.match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  return '';
}

function detectMethod(text: string): PaymentMethod {
  const lower = text.toLowerCase();
  if (lower.includes('pix')) return 'pix';
  if (lower.includes('ted')) return 'ted';
  if (lower.includes('doc')) return 'doc';
  if (lower.includes('débito') || lower.includes('debito')) return 'debit';
  if (lower.includes('crédito') || lower.includes('credito') || lower.includes('cartão') || lower.includes('cartao') || lower.includes('fatura')) return 'credit';
  if (lower.includes('boleto')) return 'boleto';
  if (lower.includes('dinheiro') || lower.includes('espécie')) return 'cash';
  return 'pix';
}

function detectType(text: string): TransactionType {
  const lower = text.toLowerCase();
  if (lower.includes('recebid') || lower.includes('salário') || lower.includes('salario') || lower.includes('ted recebida') || lower.includes('pix recebido') || lower.includes('entrada') || lower.includes('rendimento')) {
    return 'income';
  }
  if (lower.includes('transferência') || lower.includes('transferencia') || lower.includes('transfer')) {
    return 'transfer';
  }
  return 'expense';
}

function cleanDescription(text: string): string {
  // Remove amount, date patterns, and method keywords to get a clean description
  let clean = text
    .replace(/R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?/g, '')
    .replace(/\d{2}\/\d{2}(?:\/\d{4})?/g, '')
    .replace(/\d{1,2}:\d{2}/g, '')
    .replace(/\b(?:PIX|TED|DOC)\b/gi, '')
    .replace(/\b(?:recebido|recebida|enviado|enviada|pago|paga|compra|débito|crédito|fatura|cartão)\b/gi, '')
    .replace(/\bde\b/gi, '')
    .replace(/\bno valor\b/gi, '')
    .replace(/\bàs\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^\s*[-–—]\s*/, '');
  
  // Capitalize first letter
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean || 'Transação';
}

function detectCategory(text: string, description: string): { category: Category; confidence: number } {
  const aiCategory = classifyTransaction(text + ' ' + description);
  if (aiCategory !== 'outros') {
    return { category: aiCategory, confidence: 0.85 };
  }

  const lower = text.toLowerCase();
  // Extra keywords
  if (lower.includes('salário') || lower.includes('salario')) return { category: 'outros', confidence: 0.9 };
  if (lower.includes('mercado') || lower.includes('padaria') || lower.includes('supermercado')) return { category: 'alimentacao', confidence: 0.9 };
  if (lower.includes('academia')) return { category: 'saude', confidence: 0.8 };
  if (lower.includes('nubank') || lower.includes('inter') || lower.includes('fatura')) return { category: 'outros', confidence: 0.5 };

  return { category: 'outros', confidence: 0.3 };
}

export function parseNotificationText(rawText: string): ParsedTransaction[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const results: ParsedTransaction[] = [];

  for (const line of lines) {
    const amount = extractAmount(line);
    if (amount === null) continue;

    const type = detectType(line);
    const method = detectMethod(line);
    const date = extractDate(line);
    const time = extractTime(line);
    const description = cleanDescription(line);
    const { category, confidence } = detectCategory(line, description);

    results.push({
      amount,
      type,
      method,
      date,
      time,
      descriptionRaw: line,
      description,
      category,
      aiConfidence: confidence,
      isRecurring: false,
      recurrenceHint: undefined,
    });
  }

  return results;
}

export function detectRecurringPatterns(transactions: { date: string; time?: string; description: string; value: number; method?: string }[]): {
  commonPixHours: number[];
  avgPixAmount: number;
  topPayees: string[];
  weeklyPattern: Record<string, number>;
} {
  const pixTxs = transactions.filter(t => (t.method === 'pix' || t.description?.toLowerCase().includes('pix')));
  
  // Hours
  const hourCounts: Record<number, number> = {};
  for (const t of pixTxs) {
    if (t.time) {
      const h = parseInt(t.time.split(':')[0]);
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
  }
  const commonPixHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => parseInt(h));

  // Avg amount
  const avgPixAmount = pixTxs.length > 0
    ? pixTxs.reduce((s, t) => s + t.value, 0) / pixTxs.length
    : 0;

  // Top payees
  const payeeCounts: Record<string, number> = {};
  for (const t of transactions) {
    const key = t.description.toLowerCase().trim();
    if (key) payeeCounts[key] = (payeeCounts[key] || 0) + 1;
  }
  const topPayees = Object.entries(payeeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));

  // Weekly pattern
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const weeklyPattern: Record<string, number> = {};
  for (const d of dayNames) weeklyPattern[d] = 0;
  for (const t of transactions) {
    const dayIdx = new Date(t.date + 'T12:00:00').getDay();
    weeklyPattern[dayNames[dayIdx]] = (weeklyPattern[dayNames[dayIdx]] || 0) + 1;
  }

  return { commonPixHours, avgPixAmount, topPayees, weeklyPattern };
}

export function computeTrialBalance(transactions: { type: string; category: string; value: number }[], categoryLabels: Record<string, string>) {
  const entries: Record<string, { income: number; expense: number }> = {};

  for (const t of transactions) {
    const cat = t.category;
    if (!entries[cat]) entries[cat] = { income: 0, expense: 0 };
    if (t.type === 'income') entries[cat].income += t.value;
    else if (t.type === 'expense') entries[cat].expense += t.value;
  }

  return Object.entries(entries).map(([category, vals]) => ({
    category,
    label: categoryLabels[category] || category,
    income: vals.income,
    expense: vals.expense,
  }));
}

export function generateTaxTips(transactions: { type: string; category: string; description: string; value: number; markedForTax?: boolean }[]): { title: string; message: string }[] {
  const tips: { title: string; message: string }[] = [];
  
  const incomeTotal = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0);
  
  if (incomeTotal > 2259.20) {
    tips.push({
      title: '📊 Rendimentos tributáveis',
      message: `Sua renda mensal de R$ ${incomeTotal.toFixed(2).replace('.', ',')} pode estar sujeita à retenção de IR na fonte. Verifique com seu contador.`,
    });
  }

  const hasFreelance = transactions.some(t => t.description.toLowerCase().includes('freelance') || t.description.toLowerCase().includes('serviço'));
  if (hasFreelance) {
    tips.push({
      title: '📋 Serviços prestados',
      message: 'Rendimentos de serviços prestados como autônomo devem ser declarados via carnê-leão mensal. Consulte um profissional.',
    });
  }

  tips.push({
    title: '📎 Guarde seus comprovantes',
    message: 'Mantenha recibos de saúde, educação e previdência organizados — são dedutíveis no IR.',
  });

  tips.push({
    title: '✅ Checklist mensal',
    message: 'Guardar comprovante, revisar categoria, conferir recorrência — itens essenciais para manter sua declaração em dia.',
  });

  return tips;
}
