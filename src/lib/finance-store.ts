import { useState, useCallback, useEffect, useMemo } from 'react';
import { Transaction, FinancialGoal, Category, Debt, DebtStatus, Alert, NotificationRecord, Account, InvestmentPosition, InvestmentTransaction, Institution, Connector, ChatMessage } from './types';

type PersistedFinanceState = {
  transactions: Transaction[];
  goals: FinancialGoal[];
  debts: Debt[];
  alerts: Alert[];
  chatMessages: ChatMessage[];
  investmentPositions: InvestmentPosition[];
  onboardingCompleted: boolean;
};

const STORAGE_KEY = 'cognit_finance_state_v1';

function loadPersistedState(): Partial<PersistedFinanceState> | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedFinanceState>) : null;
  } catch {
    return null;
  }
}

function savePersistedState(state: PersistedFinanceState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

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

/** Generate projected recurring transactions for a given month */
function projectRecurrences(transactions: Transaction[], targetMonth: string): Transaction[] {
  const recurring = transactions.filter(t => t.recurring);
  const projected: Transaction[] = [];
  const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);

  for (const t of recurring) {
    const [txYear, txMonth] = t.date.split('-').map(Number);
    // Only project forward (not the original month)
    if (targetYear < txYear || (targetYear === txYear && targetMonthNum <= txMonth)) continue;

    const day = t.date.split('-')[2];
    // Clamp day to valid range for target month
    const lastDay = new Date(targetYear, targetMonthNum, 0).getDate();
    const clampedDay = Math.min(parseInt(day), lastDay);
    const projectedDate = `${targetYear}-${String(targetMonthNum).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;

    // Check if a real transaction already exists for this month with same description+value
    const alreadyExists = transactions.some(
      existing => existing.date.startsWith(targetMonth) &&
        existing.description === t.description &&
        existing.value === t.value &&
        existing.type === t.type
    );

    if (!alreadyExists) {
      projected.push({
        ...t,
        id: `recurring_${t.id}_${targetMonth}`,
        date: projectedDate,
        accountId: t.accountId,
      });
    }
  }
  return projected;
}

export function useFinanceStore() {
  const persisted = loadPersistedState();

  const [transactions, setTransactions] = useState<Transaction[]>(() => persisted?.transactions ?? []);
  const [goals, setGoals] = useState<FinancialGoal[]>(() => persisted?.goals ?? []);
  const [debts, setDebts] = useState<Debt[]>(() => persisted?.debts ?? []);
  const [alerts, setAlerts] = useState<Alert[]>(() => persisted?.alerts ?? []);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investmentPositions, setInvestmentPositions] = useState<InvestmentPosition[]>(() => persisted?.investmentPositions ?? []);
  const [investmentTransactions, setInvestmentTransactions] = useState<InvestmentTransaction[]>([]);
  const [institutions] = useState<Institution[]>(SAMPLE_INSTITUTIONS);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    () => persisted?.chatMessages ?? [{
      id: '0', role: 'assistant',
      content: "Olá! Sou o Cognit, seu assistente financeiro inteligente.\n\nPosso ajudar a registrar entradas, saídas, dívidas, metas e analisar seus relatórios.\n\nExemplos:\n• \"recebi salário 1700\"\n• \"paguei vivo 45, vence 23\"\n• \"registrar dívida banco inter 760\"\n• \"adicionar meta reserva 3000\"",
      createdAt: new Date().toISOString(),
    }]
  );
  const [onboardingCompleted, setOnboardingCompletedState] = useState(() => persisted?.onboardingCompleted ?? false);

  useEffect(() => {
    savePersistedState({ transactions, goals, debts, alerts, chatMessages, investmentPositions, onboardingCompleted });
  }, [transactions, goals, debts, alerts, chatMessages, investmentPositions, onboardingCompleted]);

  const setOnboardingCompleted = useCallback((v: boolean) => {
    setOnboardingCompletedState(v);
  }, []);

  // Current month for default filtering
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Transactions for the current month (including projected recurrences)
  const currentMonthTransactions = useMemo(() => {
    const real = transactions.filter(t => t.date.startsWith(currentMonth));
    const projected = projectRecurrences(transactions, currentMonth);
    return [...real, ...projected];
  }, [transactions, currentMonth]);

  // Get transactions for any month (with recurrence projection)
  const getTransactionsForMonth = useCallback((month: string) => {
    const real = transactions.filter(t => t.date.startsWith(month));
    const projected = projectRecurrences(transactions, month);
    return [...real, ...projected];
  }, [transactions]);

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

  // Use current month transactions for totals
  const totalIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0);
  const totalExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0);
  const totalDebts = debts.filter(d => d.status !== 'quitada').reduce((s, d) => s + d.totalValue, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.value; return acc; }, {} as Record<Category, number>);

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

  const updateDebt = useCallback((id: string, updates: Partial<Debt>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDebt = useCallback((id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
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

  const addInvestmentPosition = useCallback((pos: Omit<InvestmentPosition, 'id'>) => {
    setInvestmentPositions(prev => [...prev, { ...pos, id: crypto.randomUUID() }]);
  }, []);

  const updateInvestmentPosition = useCallback((id: string, updates: Partial<InvestmentPosition>) => {
    setInvestmentPositions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteInvestmentPosition = useCallback((id: string) => {
    setInvestmentPositions(prev => prev.filter(p => p.id !== id));
  }, []);

  const simulateInstitutionData = useCallback((institutionId: string) => {
    const id = crypto.randomUUID();
    const newAccount: Account = {
      id, name: `Conta ${institutionId}`, bank: institutionId,
      type: 'checking', last4: String(Math.floor(1000 + Math.random() * 9000)),
      color: '#D4AF37', active: true, createdAt: new Date().toISOString(),
    };
    setAccounts(prev => [...prev, newAccount]);

    // Simulated data does NOT create real transactions
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

  const clearSimulatedData = useCallback(() => {
    setConnectors([]);
    setInvestmentPositions(prev => prev.filter(p => p.institutionId === 'manual'));
  }, []);

  const simulateCpfDebtQuery = useCallback((cpfHash: string) => {
    const simulated: Omit<Debt, 'id'>[] = [
      { name: 'Empréstimo Pessoal', totalValue: 4500, date: '2026-06-15', startDate: '2025-06-15', status: 'ativa', source: 'simulado', creditor: 'Banco Exemplo', debtType: 'empréstimo', originalValue: 5000, cpfHash },
      { name: 'Cartão de Crédito', totalValue: 1200, date: '2026-04-10', startDate: '2026-01-10', status: 'negociacao', source: 'simulado', creditor: 'Financeira Exemplo', debtType: 'cartão', originalValue: 1800, cpfHash },
    ];
    const newDebts = simulated.map(d => ({ ...d, id: crypto.randomUUID() }));
    setDebts(prev => [...prev, ...newDebts]);
    return newDebts;
  }, []);

  return {
    transactions, goals, debts, alerts, notifications, accounts, institutions, connectors,
    investmentPositions, investmentTransactions, chatMessages, onboardingCompleted,
    currentMonth, currentMonthTransactions, getTransactionsForMonth,
    addTransaction, addTransactions, updateTransaction, deleteTransaction,
    addGoal, updateGoal, deleteGoal, updateGoalProgress,
    addDebt, updateDebt, deleteDebt, updateDebtStatus,
    addAlert, markAlertDelivered,
    addNotification, addChatMessage, addInvestmentPosition,
    updateInvestmentPosition, deleteInvestmentPosition,
    simulateInstitutionData, simulateCpfDebtQuery, clearSimulatedData,
    setOnboardingCompleted,
    totalIncome, totalExpenses, totalDebts, balance, expensesByCategory,
  };
}
