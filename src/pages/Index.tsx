import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Routes, Route } from "react-router-dom";
import { useFinanceStore } from "@/lib/finance-store";
import Dashboard from "./Dashboard";
import RegisterTransaction from "./RegisterTransaction";
import Spreadsheet from "./Spreadsheet";
import Planning from "./Planning";
import Debts from "./Debts";
import Goals from "./Goals";
import AiAssistant from "./AiAssistant";
import ImportNotifications from "./ImportNotifications";
import Transactions from "./Transactions";
import TrialBalance from "./TrialBalance";
import BalanceSheet from "./BalanceSheet";
import DREPage from "./DRE";
import Habits from "./Habits";
import Alerts from "./Alerts";
import TaxGuide from "./TaxGuide";

const AppLayout = () => {
  const store = useFinanceStore();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-2">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <span className="ml-3 text-xs text-muted-foreground">Persona Contábil</span>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route index element={<Dashboard balance={store.balance} totalIncome={store.totalIncome} totalExpenses={store.totalExpenses} totalDebts={store.totalDebts} expensesByCategory={store.expensesByCategory} onAddTransaction={store.addTransaction} />} />
              <Route path="importar" element={<ImportNotifications onConfirm={store.addTransactions} onAddNotification={store.addNotification} />} />
              <Route path="registrar" element={<RegisterTransaction onAdd={store.addTransaction} />} />
              <Route path="lancamentos" element={<Transactions transactions={store.transactions} onUpdate={store.updateTransaction} onDelete={store.deleteTransaction} onAdd={store.addTransaction} />} />
              <Route path="planilha" element={<Spreadsheet transactions={store.transactions} />} />
              <Route path="planejamento" element={<Planning />} />
              <Route path="balancete" element={<TrialBalance transactions={store.transactions} />} />
              <Route path="balanco" element={<BalanceSheet transactions={store.transactions} debts={store.debts} />} />
              <Route path="dre" element={<DREPage transactions={store.transactions} />} />
              <Route path="dividas" element={<Debts debts={store.debts} onAdd={store.addDebt} onUpdateStatus={store.updateDebtStatus} />} />
              <Route path="metas" element={<Goals goals={store.goals} onAdd={store.addGoal} onUpdate={store.updateGoal} onDelete={store.deleteGoal} onAddProgress={store.updateGoalProgress} />} />
              <Route path="habitos" element={<Habits transactions={store.transactions} />} />
              <Route path="alertas" element={<Alerts alerts={store.alerts} onAdd={store.addAlert} onMarkDelivered={store.markAlertDelivered} />} />
              <Route path="ir" element={<TaxGuide transactions={store.transactions} onUpdate={store.updateTransaction} />} />
              <Route path="assistente" element={<AiAssistant transactions={store.transactions} balance={store.balance} totalIncome={store.totalIncome} totalExpenses={store.totalExpenses} expensesByCategory={store.expensesByCategory} onAddTransaction={store.addTransaction} />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
