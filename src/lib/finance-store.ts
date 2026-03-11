import { useState, useCallback } from 'react';
import { Transaction, FinancialGoal, Category, Debt, DebtStatus } from './types';

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', value: 5000, type: 'income', category: 'outros', date: '2026-03-01', description: 'Salário', paymentMethod: 'Transferência', recurring: true },
  { id: '2', value: 120, type: 'expense', category: 'alimentacao', date: '2026-03-02', description: 'Mercado', paymentMethod: 'Cartão', recurring: false },
  { id: '3', value: 1200, type: 'expense', category: 'moradia', date: '2026-03-03', description: 'Aluguel', paymentMethod: 'Boleto', recurring: true },
  { id: '4', value: 45, type: 'expense', category: 'alimentacao', date: '2026-03-04', description: 'iFood delivery', paymentMethod: 'Cartão', recurring: false },
  { id: '5', value: 28, type: 'expense', category: 'transporte', date: '2026-03-05', description: 'Uber', paymentMethod: 'Cartão', recurring: false },
  { id: '6', value: 55, type: 'expense', category: 'assinaturas', date: '2026-03-06', description: 'Netflix + Spotify', paymentMethod: 'Cartão', recurring: true },
  { id: '7', value: 200, type: 'expense', category: 'saude', date: '2026-03-07', description: 'Farmácia', paymentMethod: 'Pix', recurring: false },
  { id: '8', value: 80, type: 'expense', category: 'lazer', date: '2026-03-08', description: 'Cinema + lanche', paymentMethod: 'Cartão', recurring: false },
  { id: '9', value: 500, type: 'expense', category: 'investimentos', date: '2026-03-09', description: 'Tesouro Direto', paymentMethod: 'Transferência', recurring: true },
  { id: '10', value: 150, type: 'expense', category: 'educacao', date: '2026-03-10', description: 'Curso online', paymentMethod: 'Cartão', recurring: false },
];

const SAMPLE_GOALS: FinancialGoal[] = [
  { id: '1', title: 'Reserva de emergência', targetAmount: 15000, currentAmount: 8500, icon: '🛡️' },
  { id: '2', title: 'Viagem Europa', targetAmount: 12000, currentAmount: 3200, icon: '✈️' },
  { id: '3', title: 'Notebook novo', targetAmount: 5000, currentAmount: 4100, icon: '💻' },
];

const SAMPLE_DEBTS: Debt[] = [
  { id: '1', name: 'Cartão Inter', totalValue: 760, date: '2026-03-15', status: 'ativa' },
  { id: '2', name: 'InfinitePay', totalValue: 571.43, date: '2026-03-20', status: 'ativa' },
  { id: '3', name: 'Cartório', totalValue: 337.23, date: '2026-03-25', status: 'negociacao' },
];

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [goals, setGoals] = useState<FinancialGoal[]>(SAMPLE_GOALS);
  const [debts, setDebts] = useState<Debt[]>(SAMPLE_DEBTS);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...t, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0);
  const totalDebts = debts.filter(d => d.status !== 'quitada').reduce((s, d) => s + d.totalValue, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.value;
      return acc;
    }, {} as Record<Category, number>);

  const addGoal = useCallback((g: Omit<FinancialGoal, 'id'>) => {
    setGoals(prev => [...prev, { ...g, id: crypto.randomUUID() }]);
  }, []);

  const updateGoalProgress = useCallback((id: string, amount: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g));
  }, []);

  const addDebt = useCallback((d: Omit<Debt, 'id'>) => {
    setDebts(prev => [...prev, { ...d, id: crypto.randomUUID() }]);
  }, []);

  const updateDebtStatus = useCallback((id: string, status: DebtStatus) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  }, []);

  return {
    transactions, goals, debts,
    addTransaction, addGoal, updateGoalProgress, addDebt, updateDebtStatus,
    totalIncome, totalExpenses, totalDebts, balance, expensesByCategory,
  };
}
