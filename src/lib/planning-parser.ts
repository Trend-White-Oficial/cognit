import { PlanningItem, PlanningItemType } from './types';

const RENDA_KEYWORDS = [
  'salário', 'salario', 'pagamento', 'va', 'vr', 'vt',
  'bônus', 'bonus', 'comissão', 'comissao', 'entrada',
  'freelance', 'renda', 'receita', 'vale alimentação',
  'vale refeição', 'vale transporte',
];

const DIVIDA_KEYWORDS = [
  'cartão', 'cartao', 'empréstimo', 'emprestimo',
  'financiamento', 'parcelamento', 'cartório', 'cartorio',
  'cobrança', 'cobranca', 'dívida', 'divida',
  'inter', 'nubank', 'infinitepay', 'infinite pay',
  'crédito', 'credito', 'fatura',
];

const FIXA_KEYWORDS = [
  'pensão', 'pensao', 'aluguel', 'internet', 'curso',
  'academia', 'transporte', 'escola', 'faculdade',
  'energia', 'água', 'agua', 'celular', 'telefone',
  'streaming', 'netflix', 'spotify', 'condomínio',
  'condominio', 'iptu', 'seguro', 'plano de saúde',
];

function classifyItem(name: string): PlanningItemType {
  const lower = name.toLowerCase().trim();

  for (const kw of RENDA_KEYWORDS) {
    if (lower.includes(kw) || lower === kw) return 'renda';
  }
  for (const kw of DIVIDA_KEYWORDS) {
    if (lower.includes(kw) || lower === kw) return 'divida';
  }
  for (const kw of FIXA_KEYWORDS) {
    if (lower.includes(kw) || lower === kw) return 'fixa';
  }

  return 'fixa'; // default to fixed expense
}

export function parsePlanningText(text: string): PlanningItem[] {
  const items: PlanningItem[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // Try patterns: "Name: 1234" or "Name 1234" or "Name: R$ 1.234,56" or "Name - 1234"
    const match = line.match(
      /^(.+?)[\s:;\-–—]+(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?)(?:\s*(?:reais|r\$))?$/i
    );

    if (!match) {
      // Try reverse: "1234 Name"
      const matchReverse = line.match(
        /^(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?)\s+(.+)$/i
      );
      if (matchReverse) {
        const valueStr = matchReverse[1].replace(/\./g, '').replace(',', '.');
        const value = parseFloat(valueStr);
        const name = matchReverse[2].trim();
        if (!isNaN(value) && name) {
          items.push({
            id: crypto.randomUUID(),
            name,
            value,
            type: classifyItem(name),
            paid: false,
          });
        }
      }
      continue;
    }

    const name = match[1].trim();
    const valueStr = match[2].replace(/\./g, '').replace(',', '.');
    const value = parseFloat(valueStr);

    if (!isNaN(value) && name) {
      items.push({
        id: crypto.randomUUID(),
        name,
        value,
        type: classifyItem(name),
        paid: false,
      });
    }
  }

  return items;
}

export function calculatePlanningTotals(items: PlanningItem[]) {
  const totalRenda = items.filter(i => i.type === 'renda').reduce((s, i) => s + i.value, 0);
  const totalFixa = items.filter(i => i.type === 'fixa' && !i.paid).reduce((s, i) => s + i.value, 0);
  const totalDivida = items.filter(i => i.type === 'divida' && !i.paid).reduce((s, i) => s + i.value, 0);
  const saldo = totalRenda - totalFixa - totalDivida;
  return { totalRenda, totalFixa, totalDivida, saldo };
}
