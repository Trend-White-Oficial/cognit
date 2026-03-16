import { BalanceCards } from "@/components/BalanceCards";
import { CategoryChart } from "@/components/CategoryChart";
import { InsightCard } from "@/components/InsightCard";
import { QuickAdd } from "@/components/QuickAdd";
import { generateInsight } from "@/lib/ai-classifier";
import { Transaction, CATEGORY_LABELS } from "@/lib/types";
import { computeTrialBalance } from "@/lib/notification-parser";
import { Link } from "react-router-dom";
import { Import, PlusCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Persona Contábil</h1>
          <p className="text-sm text-muted-foreground">Organização financeira com lógica profissional, sem complicação.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground">
            <Link to="/importar"><Import className="h-3.5 w-3.5 mr-1" />Importar</Link>
          </Button>
          <Button asChild size="sm" className="gradient-gold text-primary-foreground shadow-gold">
            <Link to="/registrar"><PlusCircle className="h-3.5 w-3.5 mr-1" />Lançamento</Link>
          </Button>
        </div>
      </div>

      <QuickAdd onAdd={onAddTransaction} />

      {/* Cards: Saldo, Entradas, Saídas, Resultado */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Saldo Geral</p>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(balance)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Entradas</p>
          <p className="text-xl font-bold text-success">{fmt(totalIncome)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Saídas</p>
          <p className="text-xl font-bold text-destructive">{fmt(totalExpenses)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Resultado</p>
          <p className={`text-xl font-bold ${balance - totalDebts >= 0 ? 'text-success' : 'text-destructive'}`}>
            {fmt(balance - totalDebts)}
          </p>
          {totalDebts > 0 && <p className="text-xs text-muted-foreground mt-1">após dívidas</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart expensesByCategory={expensesByCategory} />
        <InsightCard insight={insight} />
      </div>

      {/* Balancete mini */}
      <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Balancete do Mês
          </h3>
          <Button asChild variant="ghost" size="sm" className="text-primary text-xs">
            <Link to="/balancete">Ver completo →</Link>
          </Button>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Entradas: </span>
            <span className="text-success font-mono font-medium">{fmt(totalIncome)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Saídas: </span>
            <span className="text-destructive font-mono font-medium">{fmt(totalExpenses)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Resultado: </span>
            <span className={`font-mono font-medium ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(balance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
