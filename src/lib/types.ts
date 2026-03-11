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
