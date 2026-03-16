import { ParsedTransaction, Category, PaymentMethod, TransactionType } from './types';
import { classifyWithConfidence } from './ai-classifier';

// ─── Amount extraction ───────────────────────────────────────────────
function extractAmount(text: string): number | null {
  // R$ 1.234,56 or R$ 250,00
  const m1 = text.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)/);
  if (m1) return parseFloat(m1[1].replace(/\./g, '').replace(',', '.'));

  // Bare number with comma: 1.234,56 or 250,00
  const m2 = text.match(/(\d{1,3}(?:\.\d{3})*,\d{1,2})/);
  if (m2) return parseFloat(m2[1].replace(/\./g, '').replace(',', '.'));

  // Bare number with dot decimal: 250.00
  const m3 = text.match(/(\d+\.\d{2})\b/);
  if (m3) return parseFloat(m3[1]);

  // Simple integer or decimal: "45" or "99.9"
  const m4 = text.match(/\b(\d+(?:[.,]\d+)?)\b/);
  if (m4) return parseFloat(m4[1].replace(',', '.'));

  return null;
}

// ─── Date extraction ─────────────────────────────────────────────────
function extractDate(text: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // dd/mm/yyyy
  const m1 = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;

  // dd/mm
  const m2 = text.match(/(\d{2})\/(\d{2})/);
  if (m2) return `${year}-${m2[2]}-${m2[1]}`;

  // "vence 23" or "venc 23" — just day number
  const mVenc = text.match(/\bvenc(?:e|imento)?\s+(\d{1,2})\b/i);
  if (mVenc) return `${year}-${month}-${mVenc[1].padStart(2, '0')}`;

  // Bare day number at end or standalone (only 1–31)
  const mDay = text.match(/\b(\d{1,2})\b(?![\d:.,])/);
  if (mDay) {
    const d = parseInt(mDay[1]);
    if (d >= 1 && d <= 31) {
      // Only use if no amount already captured this number (heuristic)
      const amount = extractAmount(text);
      if (amount !== null && Math.abs(amount - d) > 0.01) {
        return `${year}-${month}-${String(d).padStart(2, '0')}`;
      }
    }
  }

  return now.toISOString().split('T')[0];
}

// ─── Time extraction ─────────────────────────────────────────────────
function extractTime(text: string): string {
  const m = text.match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  return '';
}

// ─── Recurrence detection ────────────────────────────────────────────
function detectRecurrence(text: string): { isRecurring: boolean; hint?: string } {
  const lower = text.toLowerCase();
  if (lower.includes('fixa') || lower.includes('fixo') || lower.includes('mensal') || lower.includes('todo mês') || lower.includes('todo mes') || lower.includes('assinatura') || lower.includes('recorrente')) {
    return { isRecurring: true, hint: 'mensal' };
  }
  if (lower.includes('semanal') || lower.includes('toda semana')) {
    return { isRecurring: true, hint: 'semanal' };
  }
  return { isRecurring: false };
}

// ─── Method detection ────────────────────────────────────────────────
function detectMethod(text: string): PaymentMethod {
  const lower = text.toLowerCase();
  if (lower.includes('pix')) return 'pix';
  if (lower.includes('ted')) return 'ted';
  if (lower.includes('doc')) return 'doc';
  if (lower.includes('débito') || lower.includes('debito')) return 'debit';
  if (lower.includes('crédito') || lower.includes('credito') || lower.includes('cartão') || lower.includes('cartao') || lower.includes('fatura')) return 'credit';
  if (lower.includes('boleto')) return 'boleto';
  if (lower.includes('dinheiro') || lower.includes('espécie') || lower.includes('especie')) return 'cash';
  return 'unknown';
}

// ─── Type detection ──────────────────────────────────────────────────
function detectType(text: string): TransactionType {
  const lower = text.toLowerCase();
  // Income signals
  if (/\b(receb[ió]|recebi|salário|salario|ted recebida|pix recebido|entrada|rendimento|pagamento\s+empresa|pro\s*labore|freelance)\b/.test(lower)) {
    return 'income';
  }
  // Expense signals
  if (/\b(paguei|pago|paga|comprei|gastei|compra|assinatura|mensalidade|conta|fatura|débito|debito)\b/.test(lower)) {
    return 'expense';
  }
  // Transfer signals
  if (/\b(transferência|transferencia|transfer)\b/.test(lower)) {
    return 'transfer';
  }
  return 'expense';
}

// ─── Description cleaning ────────────────────────────────────────────
function cleanDescription(text: string): string {
  let clean = text
    .replace(/R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?/g, '')
    .replace(/\d{2}\/\d{2}(?:\/\d{4})?/g, '')
    .replace(/\d{1,2}:\d{2}/g, '')
    .replace(/\b(?:PIX|TED|DOC)\b/gi, '')
    .replace(/\b(?:recebido|recebida|enviado|enviada|pago|paga|compra|débito|crédito|fatura|cartão)\b/gi, '')
    .replace(/\bvenc(?:e|imento)?\s*\d{0,2}/gi, '')
    .replace(/\b(?:fixa|fixo|mensal|todo\s*m[eê]s|assinatura|recorrente|semanal)\b/gi, '')
    .replace(/\b(\d+(?:[.,]\d+)?)\b/g, '') // remove remaining numbers
    .replace(/\bde\b/gi, '')
    .replace(/\bno valor\b/gi, '')
    .replace(/\bàs\b/gi, '')
    .replace(/[,;]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^\s*[-–—]\s*/, '');

  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  return clean || 'Transação';
}

// ─── Main parser ─────────────────────────────────────────────────────
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
    const { isRecurring, hint } = detectRecurrence(line);
    const { category, confidence } = classifyWithConfidence(line + ' ' + description);

    // Adjust confidence based on available info
    let adjustedConfidence = confidence;
    if (method === 'unknown') adjustedConfidence = Math.min(adjustedConfidence, 0.6);
    if (!time) adjustedConfidence = Math.max(adjustedConfidence - 0.05, 0.3);

    results.push({
      amount,
      type,
      method,
      date,
      time,
      descriptionRaw: line,
      description,
      category,
      aiConfidence: Math.round(adjustedConfidence * 100) / 100,
      isRecurring,
      recurrenceHint: hint,
    });
  }

  return results;
}

// ─── Analytics helpers (unchanged) ───────────────────────────────────
export function detectRecurringPatterns(transactions: { date: string; time?: string; description: string; value: number; method?: string }[]) {
  const pixTxs = transactions.filter(t => (t.method === 'pix' || t.description?.toLowerCase().includes('pix')));

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

  const avgPixAmount = pixTxs.length > 0
    ? pixTxs.reduce((s, t) => s + t.value, 0) / pixTxs.length
    : 0;

  const payeeCounts: Record<string, number> = {};
  for (const t of transactions) {
    const key = t.description.toLowerCase().trim();
    if (key) payeeCounts[key] = (payeeCounts[key] || 0) + 1;
  }
  const topPayees = Object.entries(payeeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));

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
