import { useState, useCallback } from 'react';
import { Transaction, FinancialGoal, Category, Debt, DebtStatus, Alert, NotificationRecord } from './types';

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', value: 5000, type: 'income', category: 'salario', date: '2026-03-01', time: '08:59', description: 'Salário', paymentMethod: 'Transferência', method: 'ted', recurring: true, aiConfidence: 0.95 },
  { id: '2', value: 120, type: 'expense', category: 'alimentacao', date: '2026-03-02', time: '07:49', description: 'Mercado', paymentMethod: 'Cartão', method: 'debit', recurring: false, aiConfidence: 0.9 },
  { id: '3', value: 1200, type: 'expense', category: 'moradia', date: '2026-03-03', description: 'Aluguel', paymentMethod: 'Boleto', method: 'boleto', recurring: true, aiConfidence: 0.95 },
  { id: '4', value: 45, type: 'expense', category: 'alimentacao', date: '2026-03-04', time: '12:30', description: 'iFood delivery', paymentMethod: 'Cartão', method: 'credit', recurring: false, aiConfidence: 0.9 },
  { id: '5', value: 28, type: 'expense', category: 'transporte', date: '2026-03-05', time: '19:10', description: 'Uber', paymentMethod: 'Cartão', method: 'credit', recurring: false, aiConfidence: 0.85 },
  { id: '6', value: 55, type: 'expense', category: 'assinaturas', date: '2026-03-06', description: 'Netflix + Spotify', paymentMethod: 'Cartão', method: 'credit', recurring: true, aiConfidence: 0.9 },
  { id: '7', value: 200, type: 'expense', category: 'saude', date: '2026-03-07', time: '14:32', description: 'Farmácia', paymentMethod: 'Pix', method: 'pix', recurring: false, aiConfidence: 0.8 },
  { id: '8', value: 80, type: 'expense', category: 'lazer', date: '2026-03-08', time: '20:00', description: 'Cinema + lanche', paymentMethod: 'Cartão', method: 'debit', recurring: false, aiConfidence: 0.85 },
  { id: '9', value: 500, type: 'expense', category: 'investimentos', date: '2026-03-09', time: '09:00', description: 'Tesouro Direto', paymentMethod: 'Transferência', method: 'ted', recurring: true, aiConfidence: 0.9 },
  { id: '10', value: 150, type: 'expense', category: 'educacao', date: '2026-03-10', description: 'Curso online', paymentMethod: 'Cartão', method: 'credit', recurring: false, aiConfidence: 0.85 },
];

const SAMPLE_GOALS: FinancialGoal[] = [
  { id: '1', title: 'Reserva de emergência', targetAmount: 15000, currentAmount: 8500, icon: '🛡️', status: 'active' },
  { id: '2', title: 'Viagem Europa', targetAmount: 12000, currentAmount: 3200, icon: '✈️', status: 'active' },
  { id: '3', title: 'Notebook novo', targetAmount: 5000, currentAmount: 4100, icon: '💻', status: 'active' },
];

const SAMPLE_DEBTS: Debt[] = [
  { id: '1', name: 'Cartão Inter', totalValue: 760, date: '2026-03-15', status: 'ativa' },
  { id: '2', name: 'InfinitePay', totalValue: 571.43, date: '2026-03-20', status: 'ativa' },
  { id: '3', name: 'Cartório', totalValue: 337.23, date: '2026-03-25', status: 'negociacao' },
];

const SAMPLE_ALERTS: Alert[] = [
  { id: '1', type: 'dueDate', title: 'Fatura Inter vence em 2 dias', message: 'Sua fatura do cartão Inter de R$ 760,00 vence em 15/03. Não esqueça de pagar!', severity: 'high', scheduledFor: '2026-03-13T09:00:00', delivered: false, channel: 'inApp', createdAt: '2026-03-11' },
  { id: '2', type: 'anomaly', title: 'Gasto atípico detectado', message: 'Você gastou 40% mais com alimentação este mês comparado à sua média.', severity: 'medium', delivered: true, channel: 'inApp', createdAt: '2026-03-10' },
  { id: '3', type: 'taxFlag', title: 'Lembrete de IR', message: 'Guarde o comprovante do curso online (R$ 150) — dedutível no IR como educação.', severity: 'low', delivered: true, channel: 'simulatedWhatsApp', createdAt: '2026-03-10' },
];

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [goals, setGoals] = useState<FinancialGoal[]>(SAMPLE_GOALS);
  const [debts, setDebts] = useState<Debt[]>(SAMPLE_DEBTS);
  const [alerts, setAlerts] = useState<Alert[]>(SAMPLE_ALERTS);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  const addTransaction = useCallback((t: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [{ ...t, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const addTransactions = useCallback((txs: Omit<Transaction, 'id'>[]) => {
    const newTxs = txs.map(t => ({ ...t, id: crypto.randomUUID() }));
    setTransactions(prev => [...newTxs, ...prev]);
    return newTxs.map(t => t.id);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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

  const updateGoal = useCallback((id: string, updates: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
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

  const addAlert = useCallback((a: Omit<Alert, 'id' | 'createdAt'>) => {
    setAlerts(prev => [{ ...a, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] }, ...prev]);
  }, []);

  const markAlertDelivered = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, delivered: true } : a));
  }, []);

  const addNotification = useCallback((n: Omit<NotificationRecord, 'id'>) => {
    setNotifications(prev => [{ ...n, id: crypto.randomUUID() }, ...prev]);
  }, []);

  return {
    transactions, goals, debts, alerts, notifications,
    addTransaction, addTransactions, updateTransaction, deleteTransaction,
    addGoal, updateGoal, deleteGoal, updateGoalProgress,
    addDebt, updateDebtStatus,
    addAlert, markAlertDelivered,
    addNotification,
    totalIncome, totalExpenses, totalDebts, balance, expensesByCategory,
  };
}
