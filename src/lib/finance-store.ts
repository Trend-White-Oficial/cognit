import { useState, useCallback } from 'react';
import { Transaction, FinancialGoal, Category, Debt, DebtStatus, Alert, NotificationRecord, Account, InvestmentPosition, InvestmentTransaction, Institution, Connector, ChatMessage } from './types';

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
  { id: '1', name: 'Cartão Inter', totalValue: 760, date: '2026-03-15', status: 'ativa', source: 'manual' },
  { id: '2', name: 'InfinitePay', totalValue: 571.43, date: '2026-03-20', status: 'ativa', source: 'manual' },
  { id: '3', name: 'Cartório', totalValue: 337.23, date: '2026-03-25', status: 'negociacao', source: 'manual' },
];

const SAMPLE_ALERTS: Alert[] = [
  { id: '1', type: 'dueDate', title: 'Fatura Inter vence em 2 dias', message: 'Sua fatura do cartão Inter de R$ 760,00 vence em 15/03.', severity: 'high', scheduledFor: '2026-03-13T09:00:00', delivered: false, channel: 'inApp', createdAt: '2026-03-11' },
  { id: '2', type: 'anomaly', title: 'Gasto atípico detectado', message: 'Você gastou 40% mais com alimentação este mês.', severity: 'medium', delivered: true, channel: 'inApp', createdAt: '2026-03-10' },
  { id: '3', type: 'taxFlag', title: 'Lembrete de IR', message: 'Guarde o comprovante do curso online (R$ 150) — dedutível no IR.', severity: 'low', delivered: true, channel: 'simulatedWhatsApp', createdAt: '2026-03-10' },
];

const SAMPLE_INSTITUTIONS: Institution[] = [
  { id: 'nubank', name: 'Nubank', type: 'bank', status: 'em_construcao' },
  { id: 'inter', name: 'Inter', type: 'bank', status: 'em_construcao' },
  { id: 'itau', name: 'Itaú', type: 'bank', status: 'em_construcao' },
  { id: 'bradesco', name: 'Bradesco', type: 'bank', status: 'em_construcao' },
  { id: 'santander', name: 'Santander', type: 'bank', status: 'em_construcao' },
  { id: 'caixa', name: 'Caixa', type: 'bank', status: 'em_construcao' },
  { id: 'xp', name: 'XP Investimentos', type: 'broker', status: 'em_construcao' },
  { id: 'btg', name: 'BTG Pactual', type: 'broker', status: 'em_construcao' },
  { id: 'clear', name: 'Clear', type: 'broker', status: 'em_construcao' },
  { id: 'rico', name: 'Rico', type: 'broker', status: 'em_construcao' },
];

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [goals, setGoals] = useState<FinancialGoal[]>(SAMPLE_GOALS);
  const [debts, setDebts] = useState<Debt[]>(SAMPLE_DEBTS);
  const [alerts, setAlerts] = useState<Alert[]>(SAMPLE_ALERTS);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investmentPositions, setInvestmentPositions] = useState<InvestmentPosition[]>([]);
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>([]);
  const [institutions] = useState<Institution[]>(SAMPLE_INSTITUTIONS);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: "Olá! Sou o Persona Contábil, seu assistente financeiro. Pergunte sobre suas finanças ou registre lançamentos.\n\nExemplos:\n• \"recebi salário 1700\"\n• \"paguei vivo 45, vence 23, fixa\"\n• \"registrar dívida: banco inter 760 vence 10/04\"\n• \"adicionar meta: reserva 3000 até 12/2025\"", createdAt: new Date().toISOString() },
  ]);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

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

  const addChatMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    setChatMessages(prev => [...prev, { ...msg, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  }, []);

  // Simulate data for connections
  const simulateInstitutionData = useCallback((institutionId: string) => {
    const id = crypto.randomUUID();
    const newAccount: Account = {
      id, name: `Conta ${institutionId}`, bank: institutionId,
      type: 'checking', last4: String(Math.floor(1000 + Math.random() * 9000)),
      color: '#D4AF37', active: true, createdAt: new Date().toISOString(),
    };
    setAccounts(prev => [...prev, newAccount]);

    const sampleTxs: Omit<Transaction, 'id'>[] = [
      { value: 3200, type: 'income', category: 'salario', date: '2026-03-01', description: `Salário via ${institutionId}`, paymentMethod: 'TED', method: 'ted', recurring: true, accountId: id },
      { value: 89.90, type: 'expense', category: 'assinaturas', date: '2026-03-05', description: 'Spotify + Netflix', paymentMethod: 'Cartão', method: 'credit', recurring: true, accountId: id },
      { value: 250, type: 'expense', category: 'alimentacao', date: '2026-03-08', description: 'Supermercado', paymentMethod: 'Débito', method: 'debit', recurring: false, accountId: id },
    ];
    const newTxs = sampleTxs.map(t => ({ ...t, id: crypto.randomUUID() }));
    setTransactions(prev => [...newTxs, ...prev]);

    // Simulate investment positions for brokers
    const inst = institutions.find(i => i.id === institutionId);
    if (inst?.type === 'broker') {
      const positions: InvestmentPosition[] = [
        { id: crypto.randomUUID(), institutionId, ticker: 'PETR4', assetClass: 'acao', quantity: 100, averagePrice: 36.50, currentValue: 3750, updatedAt: new Date().toISOString() },
        { id: crypto.randomUUID(), institutionId, ticker: 'XPLG11', assetClass: 'fii', quantity: 50, averagePrice: 98.00, currentValue: 5100, updatedAt: new Date().toISOString() },
        { id: crypto.randomUUID(), institutionId, ticker: 'Tesouro IPCA+ 2029', assetClass: 'renda_fixa', quantity: 1, averagePrice: 3200, currentValue: 3450, updatedAt: new Date().toISOString() },
      ];
      setInvestmentPositions(prev => [...prev, ...positions]);
    }

    setConnectors(prev => [...prev, { id: crypto.randomUUID(), institutionId, kind: inst?.type || 'bank', status: 'simulado', createdAt: new Date().toISOString() }]);
  }, [institutions]);

  // Simulate CPF debt query
  const simulateCpfDebtQuery = useCallback((cpfHash: string) => {
    const simulated: Omit<Debt, 'id'>[] = [
      { name: 'Empréstimo Pessoal', totalValue: 4500, date: '2026-06-15', status: 'ativa', source: 'simulado', creditor: 'Banco Exemplo', debtType: 'empréstimo', originalValue: 5000, cpfHash },
      { name: 'Cartão de Crédito', totalValue: 1200, date: '2026-04-10', status: 'negociacao', source: 'simulado', creditor: 'Financeira Exemplo', debtType: 'cartão', originalValue: 1800, cpfHash },
    ];
    const newDebts = simulated.map(d => ({ ...d, id: crypto.randomUUID() }));
    setDebts(prev => [...prev, ...newDebts]);
    return newDebts;
  }, []);

  return {
    transactions, goals, debts, alerts, notifications, accounts, institutions, connectors,
    investmentPositions, investmentTransactions, chatMessages, onboardingCompleted,
    addTransaction, addTransactions, updateTransaction, deleteTransaction,
    addGoal, updateGoal, deleteGoal, updateGoalProgress,
    addDebt, updateDebtStatus,
    addAlert, markAlertDelivered,
    addNotification, addChatMessage,
    simulateInstitutionData, simulateCpfDebtQuery,
    setOnboardingCompleted,
    totalIncome, totalExpenses, totalDebts, balance, expensesByCategory,
  };
}
