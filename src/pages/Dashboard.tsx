import { CategoryChart } from "@/components/CategoryChart";
import { InsightCard } from "@/components/InsightCard";
import { QuickAdd } from "@/components/QuickAdd";
import { generateInsight } from "@/lib/ai-classifier";
import { Transaction, Category, DEBT_STATUS_LABELS, ASSET_CLASS_LABELS, ASSET_CLASS_COLORS, AssetClass } from "@/lib/types";
import { useFinanceStore } from "@/lib/finance-store";
import { useCategoryStore } from "@/lib/category-store";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { PlusCircle, BarChart3, Calendar, CreditCard, TrendingUp, Landmark, Link2, Scale, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Props {
  store: ReturnType<typeof useFinanceStore>;
  categoryStore: ReturnType<typeof useCategoryStore>;
}

export default function Dashboard({ store, categoryStore }: Props) {
  const { fmt, t } = useI18n();
  const { balance, totalIncome, totalExpenses, totalDebts, expensesByCategory, currentMonth, debts, investmentPositions, connectors, goals } = store;
  const insight = generateInsight(totalIncome, totalExpenses, expensesByCategory, fmt);

  const currentMonthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  // Debt summary
  const activeDebts = debts.filter(d => d.status !== 'quitada');
  const totalDebtValue = activeDebts.reduce((s, d) => s + d.totalValue, 0);

  // Investment summary
  const totalInvested = investmentPositions.reduce((s, p) => s + p.currentValue, 0);
  const byClass = investmentPositions.reduce((acc, p) => {
    acc[p.assetClass] = (acc[p.assetClass] || 0) + p.currentValue;
    return acc;
  }, {} as Record<string, number>);

  // Goals summary
  const activeGoals = goals.filter(g => g.status !== 'done');
  const totalGoalTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalGoalCurrent = activeGoals.reduce((s, g) => s + g.currentAmount, 0);
  const goalPct = totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cognit</h1>
          <p className="text-sm text-muted-foreground">{t('cognit_tagline') || 'Organização financeira com lógica profissional, sem complicação.'}</p>
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

      {/* Quick Add */}
      <QuickAdd onAdd={store.addTransaction} />

      {/* Main Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="gradient-card rounded-xl p-3 sm:p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">{t('current_balance')}</p>
          <p className={`text-lg sm:text-xl font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(balance)}</p>
        </div>
        <div className="gradient-card rounded-xl p-3 sm:p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">{t('period_income')}</p>
          <p className="text-lg sm:text-xl font-bold text-success">{fmt(totalIncome)}</p>
        </div>
        <div className="gradient-card rounded-xl p-3 sm:p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">{t('period_expenses')}</p>
          <p className="text-lg sm:text-xl font-bold text-destructive">{fmt(totalExpenses)}</p>
        </div>
        <div className="gradient-card rounded-xl p-3 sm:p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">{t('month_result')}</p>
          <p className={`text-lg sm:text-xl font-bold ${balance - totalDebtValue >= 0 ? 'text-success' : 'text-destructive'}`}>
            {fmt(balance - totalDebtValue)}
          </p>
          {totalDebtValue > 0 && <p className="text-xs text-muted-foreground mt-1">{t('after_debts')}</p>}
        </div>
      </div>

      {/* Charts + Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart expensesByCategory={expensesByCategory} />
        <InsightCard insight={insight} />
      </div>

      {/* Summary Widgets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Debts Summary */}
        <Link to="/dividas" className="gradient-card rounded-xl p-4 border border-border shadow-card hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-2 mb-2">
            <Landmark className="h-4 w-4 text-destructive" />
            <h3 className="text-xs font-semibold text-foreground">{t('debts')}</h3>
          </div>
          <p className="text-lg font-bold text-destructive">{fmt(totalDebtValue)}</p>
          <p className="text-[10px] text-muted-foreground">{activeDebts.length} {activeDebts.length === 1 ? 'pendente' : 'pendentes'}</p>
        </Link>

        {/* Investments Summary */}
        <Link to="/investimentos" className="gradient-card rounded-xl p-4 border border-border shadow-card hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold text-foreground">{t('investments')}</h3>
          </div>
          <p className="text-lg font-bold text-primary">{fmt(totalInvested)}</p>
          <p className="text-[10px] text-muted-foreground">{investmentPositions.length} {investmentPositions.length === 1 ? 'posição' : 'posições'}</p>
        </Link>

        {/* Goals Summary */}
        <Link to="/metas" className="gradient-card rounded-xl p-4 border border-border shadow-card hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-success" />
            <h3 className="text-xs font-semibold text-foreground">{t('goals')}</h3>
          </div>
          <p className="text-lg font-bold text-success">{goalPct}%</p>
          <Progress value={goalPct} className="h-1 mt-1 bg-secondary [&>div]:gradient-gold" />
          <p className="text-[10px] text-muted-foreground mt-1">{activeGoals.length} {activeGoals.length === 1 ? 'meta ativa' : 'metas ativas'}</p>
        </Link>

        {/* Connections Summary */}
        <Link to="/conexoes" className="gradient-card rounded-xl p-4 border border-border shadow-card hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-foreground">{t('connections')}</h3>
          </div>
          <p className="text-lg font-bold text-foreground">{connectors.length}</p>
          <p className="text-[10px] text-muted-foreground">{connectors.length > 0 ? 'Simulado' : t('feature_building')}</p>
        </Link>
      </div>

      {/* Accounting Summary */}
      <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            {t('monthly_summary')}
          </h3>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm" className="text-primary text-xs">
              <Link to="/balancete">{t('trial_balance')}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-primary text-xs">
              <Link to="/balanco">{t('balance_sheet')}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-primary text-xs">
              <Link to="/dre">{t('dre')}</Link>
            </Button>
          </div>
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

      {/* Balance Quick View */}
      <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            {t('balance_sheet')} — Resumo
          </h3>
          <Button asChild variant="ghost" size="sm" className="text-primary text-xs">
            <Link to="/balanco">Ver completo →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ativos</p>
            <p className="text-sm font-bold text-success font-mono">{fmt(Math.max(balance, 0) + totalInvested)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Passivos</p>
            <p className="text-sm font-bold text-destructive font-mono">{fmt(totalDebtValue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Patrimônio Líquido</p>
            <p className={`text-sm font-bold font-mono ${(Math.max(balance, 0) + totalInvested - totalDebtValue) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {fmt(Math.max(balance, 0) + totalInvested - totalDebtValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
