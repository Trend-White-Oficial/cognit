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
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'investimentos'
  | 'assinaturas'
  | 'telecomunicacoes'
  | 'rendimentos'
  | 'cartao_credito'
  | 'transferencias_recebidas'
  | 'outros';

export const CATEGORY_LABELS: Record<Category, string> = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  lazer: 'Lazer',
  saude: 'Saúde/Academia',
  educacao: 'Educação',
  investimentos: 'Investimentos',
  assinaturas: 'Assinaturas',
  telecomunicacoes: 'Telecomunicações',
  rendimentos: 'Rendimentos',
  cartao_credito: 'Cartão de Crédito',
  transferencias_recebidas: 'Transferências Recebidas',
  outros: 'Outros',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  moradia: '#D4AF37',
  alimentacao: '#4ADE80',
  transporte: '#60A5FA',
  lazer: '#F472B6',
  saude: '#FB923C',
  educacao: '#A78BFA',
  investimentos: '#34D399',
  assinaturas: '#F87171',
  telecomunicacoes: '#38BDF8',
  rendimentos: '#22C55E',
  cartao_credito: '#EF4444',
  transferencias_recebidas: '#6EE7B7',
  outros: '#94A3B8',
};

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

export interface TaxTip {
  title: string;
  message: string;
  severity: AlertSeverity;
}
