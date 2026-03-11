import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Routes, Route } from "react-router-dom";
import { useFinanceStore } from "@/lib/finance-store";
import Dashboard from "./Dashboard";
import RegisterTransaction from "./RegisterTransaction";
import Spreadsheet from "./Spreadsheet";
import Goals from "./Goals";
import AiAssistant from "./AiAssistant";

const AppLayout = () => {
  const store = useFinanceStore();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-2">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <span className="ml-3 text-xs text-muted-foreground">Custeamento Social</span>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route index element={<Dashboard balance={store.balance} totalIncome={store.totalIncome} totalExpenses={store.totalExpenses} expensesByCategory={store.expensesByCategory} onAddTransaction={store.addTransaction} />} />
              <Route path="registrar" element={<RegisterTransaction onAdd={store.addTransaction} />} />
              <Route path="planilha" element={<Spreadsheet transactions={store.transactions} />} />
              <Route path="metas" element={<Goals goals={store.goals} />} />
              <Route path="assistente" element={<AiAssistant transactions={store.transactions} balance={store.balance} totalIncome={store.totalIncome} totalExpenses={store.totalExpenses} expensesByCategory={store.expensesByCategory} />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
