import { BalanceCards } from "@/components/BalanceCards";
import { CategoryChart } from "@/components/CategoryChart";
import { InsightCard } from "@/components/InsightCard";
import { QuickAdd } from "@/components/QuickAdd";
import { generateInsight } from "@/lib/ai-classifier";
import { Transaction } from "@/lib/types";

interface Props {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  totalDebts: number;
  expensesByCategory: Record<string, number>;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

export default function Dashboard({ balance, totalIncome, totalExpenses, totalDebts, expensesByCategory, onAddTransaction }: Props) {
  const insight = generateInsight(totalIncome, totalExpenses, expensesByCategory);
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      <QuickAdd onAdd={onAddTransaction} />
      <BalanceCards balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} />

      {/* Debt summary card */}
      {totalDebts > 0 && (
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Dívidas Ativas</p>
            <p className="text-xl font-bold text-destructive">{fmt(totalDebts)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Saldo após dívidas</p>
            <p className={`text-xl font-bold ${balance - totalDebts >= 0 ? "text-success" : "text-destructive"}`}>
              {fmt(balance - totalDebts)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart expensesByCategory={expensesByCategory} />
        <InsightCard insight={insight} />
      </div>
    </div>
  );
}
