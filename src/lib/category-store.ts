import { useState, useEffect, useCallback } from 'react';
import { CategoryKind } from './types';

export interface UserCategory {
  id: string;
  label: string;
  kind: CategoryKind;
  color: string;
  icon: string;
  description?: string;
  isDefault: boolean;
  hidden: boolean;
}

const STORAGE_KEY = 'cognit_categories_v1';

const DEFAULT_CATEGORIES: UserCategory[] = [
  // Income
  { id: 'salario', label: 'Salário / Rendimentos', kind: 'income', color: '#22C55E', icon: '💰', description: 'Salário, pró-labore, folha de pagamento', isDefault: true, hidden: false },
  { id: 'pro_labore', label: 'Pró‑labore', kind: 'income', color: '#16A34A', icon: '🧾', description: 'Pró‑labore e retiradas', isDefault: true, hidden: false },
  { id: 'vendas', label: 'Vendas', kind: 'income', color: '#34D399', icon: '🛒', description: 'Receitas de vendas de produtos', isDefault: true, hidden: false },
  { id: 'servicos', label: 'Serviços', kind: 'income', color: '#2DD4BF', icon: '🧰', description: 'Receitas de prestação de serviços', isDefault: true, hidden: false },
  { id: 'vendas_servicos', label: 'Vendas / Serviços', kind: 'income', color: '#34D399', icon: '🛒', description: 'Vendas de produtos ou prestação de serviços', isDefault: true, hidden: true },
  { id: 'renda_extra', label: 'Renda Extra', kind: 'income', color: '#6EE7B7', icon: '⭐', description: 'Freelas, bicos, premiações', isDefault: true, hidden: false },
  { id: 'rendimentos_financeiros', label: 'Rendimentos Financeiros', kind: 'income', color: '#10B981', icon: '📈', description: 'Juros, CDI, dividendos', isDefault: true, hidden: false },
  { id: 'reembolsos', label: 'Reembolsos', kind: 'income', color: '#A7F3D0', icon: '🔄', description: 'Devoluções e reembolsos recebidos', isDefault: true, hidden: false },
  { id: 'transferencias_recebidas', label: 'Transferências Recebidas', kind: 'income', color: '#6EE7B7', icon: '📥', description: 'Transferências na mesma titularidade não afetam DRE', isDefault: true, hidden: false },
  { id: 'outros_recebimentos', label: 'Outros Recebimentos', kind: 'income', color: '#86EFAC', icon: '📋', isDefault: true, hidden: false },
  // Expense
  { id: 'moradia', label: 'Moradia', kind: 'expense', color: '#D4AF37', icon: '🏠', description: 'Aluguel, condomínio', isDefault: true, hidden: false },
  { id: 'telecomunicacoes', label: 'Telecomunicações', kind: 'expense', color: '#38BDF8', icon: '📱', description: 'Vivo, Claro, TIM, Oi, Internet', isDefault: true, hidden: false },
  { id: 'energia', label: 'Energia', kind: 'expense', color: '#FBBF24', icon: '⚡', description: 'Conta de luz', isDefault: true, hidden: false },
  { id: 'agua_gas', label: 'Água / Gás', kind: 'expense', color: '#67E8F9', icon: '💧', description: 'Conta de água e gás', isDefault: true, hidden: false },
  { id: 'alimentacao', label: 'Alimentação', kind: 'expense', color: '#4ADE80', icon: '🍽️', description: 'Mercado, restaurantes, delivery', isDefault: true, hidden: false },
  { id: 'transporte', label: 'Transporte', kind: 'expense', color: '#60A5FA', icon: '🚗', description: 'Combustível, apps, manutenção', isDefault: true, hidden: false },
  { id: 'saude', label: 'Saúde / Academia', kind: 'expense', color: '#FB923C', icon: '🏥', isDefault: true, hidden: false },
  { id: 'academia', label: 'Academia', kind: 'expense', color: '#FDBA74', icon: '🏋️', description: 'Academia e atividades físicas', isDefault: true, hidden: false },
  { id: 'educacao', label: 'Educação', kind: 'expense', color: '#A78BFA', icon: '📚', isDefault: true, hidden: false },
  { id: 'lazer', label: 'Lazer', kind: 'expense', color: '#F472B6', icon: '🎬', description: 'Cinema, viagens, entretenimento', isDefault: true, hidden: false },
  { id: 'cartao_credito', label: 'Cartão de Crédito', kind: 'expense', color: '#EF4444', icon: '💳', description: 'Faturas de cartão', isDefault: true, hidden: false },
  { id: 'impostos', label: 'Impostos', kind: 'expense', color: '#F87171', icon: '🏛️', description: 'Impostos em geral', isDefault: true, hidden: false },
  { id: 'impostos_taxas', label: 'Impostos / Taxas', kind: 'expense', color: '#F87171', icon: '🏛️', isDefault: true, hidden: true },
  { id: 'transferencias_enviadas', label: 'Transferências Enviadas', kind: 'expense', color: '#94A3B8', icon: '📤', description: 'Transferências na mesma titularidade não afetam DRE', isDefault: true, hidden: false },
  { id: 'familia', label: 'Família', kind: 'expense', color: '#F9A8D4', icon: '👨‍👩‍👧', description: 'Mesada, apoio, despesas familiares', isDefault: true, hidden: false },
  { id: 'assinaturas', label: 'Assinaturas / Mensalidades', kind: 'expense', color: '#F87171', icon: '📺', description: 'Streamings, clubes, academia', isDefault: true, hidden: false },
  { id: 'investimentos', label: 'Investimentos', kind: 'expense', color: '#34D399', icon: '📊', isDefault: true, hidden: false },
  { id: 'outros', label: 'Outros', kind: 'expense', color: '#94A3B8', icon: '📦', isDefault: true, hidden: false },
];

function loadCategories(): UserCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORIES.map(c => ({ ...c }));
    return JSON.parse(raw) as UserCategory[];
  } catch {
    return DEFAULT_CATEGORIES.map(c => ({ ...c }));
  }
}

function saveCategories(cats: UserCategory[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  } catch { /* ignore */ }
}

export function useCategoryStore() {
  const [categories, setCategories] = useState<UserCategory[]>(() => loadCategories());

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const visibleCategories = categories.filter(c => !c.hidden);
  const incomeCategories = visibleCategories.filter(c => c.kind === 'income');
  const expenseCategories = visibleCategories.filter(c => c.kind === 'expense');

  const getCategoryLabel = useCallback((id: string) => {
    return categories.find(c => c.id === id)?.label || id;
  }, [categories]);

  const getCategoryMeta = useCallback((id: string) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  const categoryLabels: Record<string, string> = {};
  const categoryColors: Record<string, string> = {};
  for (const c of categories) {
    categoryLabels[c.id] = c.label;
    categoryColors[c.id] = c.color;
  }

  const addCategory = useCallback((cat: Omit<UserCategory, 'id' | 'isDefault' | 'hidden'>) => {
    const id = 'custom_' + crypto.randomUUID().slice(0, 8);
    setCategories(prev => [...prev, { ...cat, id, isDefault: false, hidden: false }]);
    return id;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Pick<UserCategory, 'label' | 'icon' | 'color' | 'description' | 'kind'>>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const toggleHidden = useCallback((id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, hidden: !c.hidden } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id || c.isDefault));
  }, []);

  return {
    categories,
    visibleCategories,
    incomeCategories,
    expenseCategories,
    categoryLabels,
    categoryColors,
    getCategoryLabel,
    getCategoryMeta,
    addCategory,
    updateCategory,
    toggleHidden,
    deleteCategory,
  };
}
