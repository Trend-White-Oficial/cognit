export type TransactionType = 'income' | 'expense';

export type Category =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'investimentos'
  | 'assinaturas'
  | 'outros';

export interface Transaction {
  id: string;
  value: number;
  type: TransactionType;
  category: Category;
  date: string;
  description: string;
  paymentMethod: string;
  recurring: boolean;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
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

export const CATEGORY_LABELS: Record<Category, string> = {
  moradia: 'Moradia',
  alimentacao: 'Alimentação',
  transporte: 'Transporte',
  lazer: 'Lazer',
  saude: 'Saúde',
  educacao: 'Educação',
  investimentos: 'Investimentos',
  assinaturas: 'Assinaturas',
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
  outros: '#94A3B8',
};
