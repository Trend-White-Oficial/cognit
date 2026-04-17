import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppFooter } from "@/components/AppFooter";
import { OnboardingTour } from "@/components/OnboardingTour";
import { MonthlyReview } from "@/components/MonthlyReview";
import { CategoryManager } from "@/components/CategoryManager";
import { Routes, Route } from "react-router-dom";
import { useFinanceStore } from "@/lib/finance-store";
import { useCategoryStore } from "@/lib/category-store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, CalendarCheck, Settings2 } from "lucide-react";
import Dashboard from "./Dashboard";
import RegisterTransaction from "./RegisterTransaction";
import Spreadsheet from "./Spreadsheet";
import DebtsUnified from "./DebtsUnified";
import Goals from "./Goals";
import AiAssistant from "./AiAssistant";
import Transactions from "./Transactions";
import TrialBalance from "./TrialBalance";
import ReportsUnified from "./ReportsUnified";
import Habits from "./Habits";
import Alerts from "./Alerts";
import TaxGuide from "./TaxGuide";
import Connections from "./Connections";
import Investments from "./Investments";
import Content from "./Content";
import Legal from "./Legal";
import AccountingSettings from "./AccountingSettings";
import UserSettings from "./UserSettings";
import Login from "./Login";

const AppLayout = () => {
  const store = useFinanceStore();
  const categoryStore = useCategoryStore();
  const { t } = useI18n();
  const [tourOpen, setTourOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);

  useEffect(() => {
    if (!store.onboardingCompleted) {
      const timer = setTimeout(() => setTourOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, [store.onboardingCompleted]);

  const handleTourComplete = () => {
    store.setOnboardingCompleted(true);
  };

  const currentMonthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <header className="h-12 flex items-center border-b border-border px-2 shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <span className="ml-3 text-xs font-medium text-muted-foreground">Cognit</span>
            <Badge variant="outline" className="ml-2 text-[10px] border-border text-muted-foreground px-1.5 py-0">
              {currentMonthLabel}
            </Badge>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setCategoryManagerOpen(true)} title="Gerenciar categorias">
                <Settings2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setReviewOpen(true)} title={t('monthly_review')}>
                <CalendarCheck className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setTourOpen(true)} title="Ajuda">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route index element={<Dashboard store={store} categoryStore={categoryStore} />} />
              <Route path="registrar" element={<RegisterTransaction onAdd={store.addTransaction} onConfirmImport={store.addTransactions} onAddNotification={store.addNotification} categoryStore={categoryStore} />} />
              <Route path="lancamentos" element={<Transactions transactions={store.transactions} onUpdate={store.updateTransaction} onDelete={store.deleteTransaction} onAdd={store.addTransaction} categoryStore={categoryStore} />} />
              <Route path="planilha" element={<Spreadsheet transactions={store.transactions} />} />
              <Route path="balancete" element={<TrialBalance transactions={store.transactions} />} />
              <Route path="balanco" element={<ReportsUnified transactions={store.transactions} debts={store.debts} />} />
              <Route path="configuracoes-contabeis" element={<AccountingSettings categoryStore={categoryStore} />} />
              <Route path="dividas" element={<DebtsUnified debts={store.debts} onAdd={store.addDebt} onUpdate={store.updateDebt} onDelete={store.deleteDebt} onUpdateStatus={store.updateDebtStatus} onSimulateCpf={store.simulateCpfDebtQuery} />} />
              <Route path="metas" element={<Goals goals={store.goals} onAdd={store.addGoal} onUpdate={store.updateGoal} onDelete={store.deleteGoal} onAddProgress={store.updateGoalProgress} />} />
              <Route path="investimentos" element={<Investments positions={store.investmentPositions} investmentTransactions={store.investmentTransactions} onAddPosition={store.addInvestmentPosition} onUpdatePosition={store.updateInvestmentPosition} onDeletePosition={store.deleteInvestmentPosition} />} />
              <Route path="conexoes" element={<Connections institutions={store.institutions} connectors={store.connectors} onSimulate={store.simulateInstitutionData} onClearSimulated={store.clearSimulatedData} />} />
              <Route path="habitos" element={<Habits transactions={store.transactions} />} />
              <Route path="alertas" element={<Alerts alerts={store.alerts} onAdd={store.addAlert} onMarkDelivered={store.markAlertDelivered} />} />
              <Route path="ir" element={<TaxGuide transactions={store.transactions} onUpdate={store.updateTransaction} />} />
              <Route path="assistente" element={<AiAssistant transactions={store.transactions} balance={store.balance} totalIncome={store.totalIncome} totalExpenses={store.totalExpenses} expensesByCategory={store.expensesByCategory} onAddTransaction={store.addTransaction} chatMessages={store.chatMessages} onAddChatMessage={store.addChatMessage} onAddDebt={store.addDebt} onAddGoal={store.addGoal} onOpenTour={() => setTourOpen(true)} categoryStore={categoryStore} />} />
              <Route path="conteudos" element={<Content />} />
              <Route path="configuracoes" element={<UserSettings />} />
              <Route path="login" element={<Login />} />
              <Route path="legal/:page" element={<Legal />} />
            </Routes>
          </main>
          <AppFooter />
        </div>
      </div>
      <OnboardingTour open={tourOpen} onClose={() => setTourOpen(false)} onComplete={handleTourComplete} />
      <MonthlyReview open={reviewOpen} onClose={() => setReviewOpen(false)} transactions={store.currentMonthTransactions} debts={store.debts} connectors={store.connectors} categoryStore={categoryStore} />
      <CategoryManager store={categoryStore} open={categoryManagerOpen} onClose={() => setCategoryManagerOpen(false)} />
    </SidebarProvider>
  );
};

export default AppLayout;
