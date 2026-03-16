export type TransactionType = 'income' | 'expense' | 'transfer';

export type PaymentMethod = 'pix' | 'debit' | 'credit' | 'boleto' | 'ted' | 'doc' | 'cash' | 'unknown';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  debit: 'Débito',
  credit: 'Crédito',
  boleto: 'Boleto',
  ted: 'TED',
  doc: 'DOC',
  cash: 'Dinheiro',
  unknown: 'Desconhecido',
};

export type Category =
  // Income categories
  | 'salario'
  | 'vendas_servicos'
  | 'renda_extra'
  | 'rendimentos_financeiros'
  | 'reembolsos'
  | 'transferencias_recebidas'
  | 'outros_recebimentos'
  // Expense categories
  | 'moradia'
  | 'telecomunicacoes'
  | 'energia'
  | 'agua_gas'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'lazer'
  | 'cartao_credito'
  | 'impostos_taxas'
  | 'transferencias_enviadas'
  | 'familia'
  | 'assinaturas'
  | 'investimentos'
  | 'outros';

export type CategoryKind = 'income' | 'expense';

export interface CategoryMeta {
  label: string;
  kind: CategoryKind;
  color: string;
  icon: string;
  description?: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  // Income
  salario:                 { label: 'Salário / Rendimentos',        kind: 'income',  color: '#22C55E', icon: '💰', description: 'Salário, pró-labore, folha de pagamento' },
  vendas_servicos:         { label: 'Vendas / Serviços',            kind: 'income',  color: '#34D399', icon: '🛒', description: 'Vendas de produtos ou prestação de serviços' },
  renda_extra:             { label: 'Renda Extra',                  kind: 'income',  color: '#6EE7B7', icon: '⭐', description: 'Freelas, bicos, premiações' },
  rendimentos_financeiros: { label: 'Rendimentos Financeiros',      kind: 'income',  color: '#10B981', icon: '📈', description: 'Juros, CDI, dividendos' },
  reembolsos:              { label: 'Reembolsos',                   kind: 'income',  color: '#A7F3D0', icon: '🔄', description: 'Devoluções e reembolsos recebidos' },
  transferencias_recebidas:{ label: 'Transferências Recebidas',     kind: 'income',  color: '#6EE7B7', icon: '📥', description: 'Transferências na mesma titularidade não afetam DRE' },
  outros_recebimentos:     { label: 'Outros Recebimentos',          kind: 'income',  color: '#86EFAC', icon: '📋' },
  // Expense
  moradia:                 { label: 'Moradia',                      kind: 'expense', color: '#D4AF37', icon: '🏠', description: 'Aluguel, condomínio' },
  telecomunicacoes:        { label: 'Telecomunicações',             kind: 'expense', color: '#38BDF8', icon: '📱', description: 'Vivo, Claro, TIM, Internet' },
  energia:                 { label: 'Energia',                      kind: 'expense', color: '#FBBF24', icon: '⚡', description: 'Conta de luz' },
  agua_gas:                { label: 'Água / Gás',                   kind: 'expense', color: '#67E8F9', icon: '💧', description: 'Conta de água e gás' },
  alimentacao:             { label: 'Alimentação',                  kind: 'expense', color: '#4ADE80', icon: '🍽️', description: 'Mercado, restaurantes, delivery' },
  transporte:              { label: 'Transporte',                   kind: 'expense', color: '#60A5FA', icon: '🚗', description: 'Combustível, apps, manutenção' },
  saude:                   { label: 'Saúde / Academia',             kind: 'expense', color: '#FB923C', icon: '🏥' },
  educacao:                { label: 'Educação',                     kind: 'expense', color: '#A78BFA', icon: '📚' },
  lazer:                   { label: 'Lazer',                        kind: 'expense', color: '#F472B6', icon: '🎬', description: 'Cinema, viagens, entretenimento' },
  cartao_credito:          { label: 'Cartão de Crédito',            kind: 'expense', color: '#EF4444', icon: '💳', description: 'Faturas de cartão' },
  impostos_taxas:          { label: 'Impostos / Taxas',             kind: 'expense', color: '#F87171', icon: '🏛️' },
  transferencias_enviadas: { label: 'Transferências Enviadas',      kind: 'expense', color: '#94A3B8', icon: '📤', description: 'Transferências na mesma titularidade não afetam DRE' },
  familia:                 { label: 'Família',                      kind: 'expense', color: '#F9A8D4', icon: '👨‍👩‍👧', description: 'Mesada, apoio, despesas familiares' },
  assinaturas:             { label: 'Assinaturas / Mensalidades',   kind: 'expense', color: '#F87171', icon: '📺', description: 'Streamings, clubes, academia' },
  investimentos:           { label: 'Investimentos',                kind: 'expense', color: '#34D399', icon: '📊' },
  outros:                  { label: 'Outros',                       kind: 'expense', color: '#94A3B8', icon: '📦' },
};

// Backwards-compatible flat label map
export const CATEGORY_LABELS: Record<Category, string> = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([k, v]) => [k, v.label])
) as Record<Category, string>;

export const CATEGORY_COLORS: Record<Category, string> = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([k, v]) => [k, v.color])
) as Record<Category, string>;

export const INCOME_CATEGORIES = Object.entries(CATEGORY_META)
  .filter(([, v]) => v.kind === 'income')
  .map(([k]) => k as Category);

export const EXPENSE_CATEGORIES = Object.entries(CATEGORY_META)
  .filter(([, v]) => v.kind === 'expense')
  .map(([k]) => k as Category);

export interface Transaction {
  id: string;
  value: number;
  type: TransactionType;
  category: Category;
  date: string;
  time?: string;
  description: string;
  descriptionRaw?: string;
  paymentMethod: string;
  method?: PaymentMethod;
  recurring: boolean;
  recurrenceHint?: string;
  aiConfidence?: number;
  markedForTax?: boolean;
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  bank: string;
  type: 'checking' | 'savings' | 'credit';
  last4: string;
  color: string;
  active: boolean;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  source: 'bankPush' | 'email' | 'manual';
  rawText: string;
  parsedAt?: string;
  status: 'parsed' | 'pending' | 'error';
  relatedTransactionIds: string[];
}

export interface Habit {
  id: string;
  commonPixHours: number[];
  avgPixAmount: number;
  topPayees: string[];
  weeklyPattern: Record<string, number>;
  notes?: string;
  updatedAt: string;
}

export type AlertType = 'dueDate' | 'anomaly' | 'lowBalance' | 'taxFlag';
export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertChannel = 'inApp' | 'simulatedWhatsApp';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  scheduledFor?: string;
  delivered: boolean;
  channel: AlertChannel;
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  status?: 'active' | 'paused' | 'done';
  icon: string;
  notes?: string;
}

export type DebtStatus = 'ativa' | 'negociacao' | 'quitada';

export interface Debt {
  id: string;
  name: string;
  totalValue: number;
  date: string;
  status: DebtStatus;
}

export const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  ativa: 'Ativa',
  negociacao: 'Em negociação',
  quitada: 'Quitada',
};

export type PlanningItemType = 'renda' | 'fixa' | 'divida';

export interface PlanningItem {
  id: string;
  name: string;
  value: number;
  type: PlanningItemType;
  paid: boolean;
}

export const PLANNING_TYPE_LABELS: Record<PlanningItemType, string> = {
  renda: 'Receita',
  fixa: 'Despesa Fixa',
  divida: 'Dívida',
};

export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  method: PaymentMethod;
  date: string;
  time: string;
  descriptionRaw: string;
  description: string;
  category: Category;
  aiConfidence: number;
  isRecurring: boolean;
  recurrenceHint?: string;
}

export interface CategoryHint {
  term: string;
  category: Category;
  count: number;
}

export interface TrialBalanceEntry {
  category: string;
  label: string;
  income: number;
  expense: number;
}

export type TaxTip = {
  title: string;
  message: string;
  severity: AlertSeverity;
};

// DRE groups
export type DREGroup = 'receita_bruta' | 'deducoes' | 'custos' | 'despesa_operacional' | 'outras_receitas_despesas';
export const DRE_GROUP_LABELS: Record<DREGroup, string> = {
  receita_bruta: 'Receita Bruta',
  deducoes: 'Deduções / Impostos',
  custos: 'Custos',
  despesa_operacional: 'Despesas Operacionais',
  outras_receitas_despesas: 'Outras Receitas / Despesas',
};

// Balance sheet groups
export type BalanceGroup = 'ativo_circulante' | 'ativo_nao_circulante' | 'passivo_circulante' | 'passivo_nao_circulante';
export const BALANCE_GROUP_LABELS: Record<BalanceGroup, string> = {
  ativo_circulante: 'Ativo Circulante',
  ativo_nao_circulante: 'Ativo Não Circulante',
  passivo_circulante: 'Passivo Circulante',
  passivo_nao_circulante: 'Passivo Não Circulante',
};

// Default mapping category -> DRE group
export const DEFAULT_DRE_MAPPING: Record<Category, DREGroup> = {
  salario: 'receita_bruta',
  vendas_servicos: 'receita_bruta',
  renda_extra: 'outras_receitas_despesas',
  rendimentos_financeiros: 'outras_receitas_despesas',
  reembolsos: 'outras_receitas_despesas',
  transferencias_recebidas: 'outras_receitas_despesas',
  outros_recebimentos: 'outras_receitas_despesas',
  moradia: 'despesa_operacional',
  telecomunicacoes: 'despesa_operacional',
  energia: 'despesa_operacional',
  agua_gas: 'despesa_operacional',
  alimentacao: 'despesa_operacional',
  transporte: 'despesa_operacional',
  saude: 'despesa_operacional',
  educacao: 'despesa_operacional',
  lazer: 'despesa_operacional',
  cartao_credito: 'despesa_operacional',
  impostos_taxas: 'deducoes',
  transferencias_enviadas: 'outras_receitas_despesas',
  familia: 'despesa_operacional',
  assinaturas: 'despesa_operacional',
  investimentos: 'outras_receitas_despesas',
  outros: 'despesa_operacional',
};
