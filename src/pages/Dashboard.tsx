import { useMemo } from "react";
import { BalanceCards } from "@/components/BalanceCards";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertCircle, Target, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  store: any;
  categoryStore: any;
}

export default function Dashboard({ store, categoryStore }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthTransactions = useMemo(() =>
    store.transactions.filter((t: any) => t.date.startsWith(currentMonth)),
    [store.transactions, currentMonth]
  );

  const monthIncome = useMemo(() =>
    monthTransactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + t.value, 0),
    [monthTransactions]
  );

  const monthExpense = useMemo(() =>
    monthTransactions.filter((t: any) => t.type === 'expense').reduce((s: number, t: any) => s + t.value, 0),
    [monthTransactions]
  );

  const monthResult = monthIncome - monthExpense;

  const activeDebts = useMemo(() =>
    store.debts.filter((d: any) => d.status === 'ativa'),
    [store.debts]
  );

  const totalDebt = useMemo(() =>
    activeDebts.reduce((s: number, d: any) => s + d.totalValue, 0),
    [activeDebts]
  );

  const expensesByCategory = useMemo(() => {
    const byCategory: Record<string, number> = {};
    monthTransactions
      .filter((t: any) => t.type === 'expense')
      .forEach((t: any) => {
        byCategory[t.category] = (byCategory[t.category] || 0) + t.value;
      });
    return Object.entries(byCategory)
      .map(([cat, val]) => ({ category: cat, value: val }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [monthTransactions]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Seu resumo financeiro de {new Date(currentMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Main Cards */}
      <BalanceCards balance={store.balance} totalIncome={store.totalIncome} totalExpenses={store.totalExpenses} />

      {/* Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gradient-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Resultado do Mês</span>
            <TrendingUp className={`h-5 w-5 ${monthResult >= 0 ? 'text-success' : 'text-destructive'}`} />
          </div>
          <p className={`text-2xl font-bold ${monthResult >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(monthResult)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {monthIncome > 0 && monthExpense > 0 && `Receita: ${fmt(monthIncome)} | Despesa: ${fmt(monthExpense)}`}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="gradient-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Dívidas Ativas</span>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive">{fmt(totalDebt)}</p>
          <p className="text-xs text-muted-foreground mt-2">{activeDebts.length} dívida(s) ativa(s)</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="gradient-card rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Metas</span>
            <Target className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">{store.goals.length}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {store.goals.filter((g: any) => g.status === 'done').length} concluída(s)
          </p>
        </motion.div>
      </div>

      {/* Top Expenses */}
      {expensesByCategory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Principais Despesas</h2>
          <div className="space-y-3">
            {expensesByCategory.map((item) => {
              const categoryMeta = categoryStore.getCategoryMeta(item.category);
              const percentage = (item.value / monthExpense) * 100;
              return (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="text-xl">{categoryMeta?.icon || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-foreground truncate">{categoryMeta?.label || item.category}</span>
                      <span className="text-sm font-semibold text-foreground">{fmt(item.value)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {monthTransactions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Últimos Lançamentos</h2>
          <div className="space-y-2">
            {monthTransactions.slice(0, 5).map((tx: any) => {
              const categoryMeta = categoryStore.getCategoryMeta(tx.category);
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">{categoryMeta?.icon || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
