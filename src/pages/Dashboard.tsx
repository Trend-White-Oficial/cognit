import { BalanceCards } from "@/components/BalanceCards";
import { CategoryChart } from "@/components/CategoryChart";
import { InsightCard } from "@/components/InsightCard";
import { QuickAdd } from "@/components/QuickAdd";
import { generateInsight } from "@/lib/ai-classifier";
import { Transaction, Category } from "@/lib/types";
import { useFinanceStore } from "@/lib/finance-store";
import { useCategoryStore } from "@/lib/category-store";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { PlusCircle, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  store: ReturnType<typeof useFinanceStore>;
  categoryStore: ReturnType<typeof useCategoryStore>;
}

export default function Dashboard({ store, categoryStore }: Props) {
  const { fmt, t } = useI18n();
  const { balance, totalIncome, totalExpenses, totalDebts, expensesByCategory, currentMonth } = store;
  const insight = generateInsight(totalIncome, totalExpenses, expensesByCategory);

  const currentMonthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cognit</h1>
          <p className="text-sm text-muted-foreground">Organização financeira com lógica profissional, sem complicação.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {currentMonthLabel}
          </Badge>
          <Button asChild size="sm" className="gradient-gold text-primary-foreground shadow-gold">
            <Link to="/registrar"><PlusCircle className="h-3.5 w-3.5 mr-1" />{t('new_entry')}</Link>
          </Button>
        </div>
      </div>

      <QuickAdd onAdd={store.addTransaction} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="gradient-card rounded-xl p-3 sm:p-4 border border-border shadow-card group relative">
          <p className="text-xs text-muted-foreground">{t('current_balance')}</p>
          <p className={`text-lg sm:text-xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(balance)}</p>
          <p className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Resultado líquido considerando entradas, saídas e dívidas registradas.</p>
        </div>
        <div className="gradient-card rounded-xl p-3 sm:p-4 border border-border shadow-card group relative">
          <p className="text-xs text-muted-foreground">{t('period_income')}</p>
          <p className="text-lg sm:text-xl font-bold text-success">{fmt(totalIncome)}</p>
        </div>
        <div className="gradient-card rounded-xl p-3 sm:p-4 border border-border shadow-card group relative">
          <p className="text-xs text-muted-foreground">{t('period_expenses')}</p>
          <p className="text-lg sm:text-xl font-bold text-destructive">{fmt(totalExpenses)}</p>
        </div>
        <div className="gradient-card rounded-xl p-3 sm:p-4 border border-border shadow-card group relative">
          <p className="text-xs text-muted-foreground">{t('month_result')}</p>
          <p className={`text-lg sm:text-xl font-bold ${balance - totalDebts >= 0 ? 'text-success' : 'text-destructive'}`}>
            {fmt(balance - totalDebts)}
          </p>
          {totalDebts > 0 && <p className="text-xs text-muted-foreground mt-1">{t('after_debts')}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart expensesByCategory={expensesByCategory} />
        <InsightCard insight={insight} />
      </div>

      <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t('monthly_summary')}
          </h3>
          <Button asChild variant="ghost" size="sm" className="text-primary text-xs">
            <Link to="/balancete">{t('view_trial')}</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">{t('income')}: </span>
            <span className="text-success font-mono font-medium">{fmt(totalIncome)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('expenses')}: </span>
            <span className="text-destructive font-mono font-medium">{fmt(totalExpenses)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">{t('result')}: </span>
            <span className={`font-mono font-medium ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(balance)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
