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
  expensesByCategory: Record<string, number>;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

export default function Dashboard({ balance, totalIncome, totalExpenses, expensesByCategory, onAddTransaction }: Props) {
  const insight = generateInsight(totalIncome, totalExpenses, expensesByCategory);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      <QuickAdd onAdd={onAddTransaction} />
      <BalanceCards balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart expensesByCategory={expensesByCategory} />
        <InsightCard insight={insight} />
      </div>
    </div>
  );
}
