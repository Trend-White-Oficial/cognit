import { useState, useMemo } from "react";
import { Transaction, CATEGORY_LABELS } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Download, HelpCircle } from "lucide-react";
import { computeTrialBalance } from "@/lib/notification-parser";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
}

export default function TrialBalance({ transactions }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(months[0] || new Date().toISOString().slice(0, 7));

  const monthTxs = useMemo(() =>
    transactions.filter(t => t.date.startsWith(selectedMonth)),
    [transactions, selectedMonth]
  );

  const entries = useMemo(() => computeTrialBalance(monthTxs, CATEGORY_LABELS), [monthTxs]);

  const totalIncome = entries.reduce((s, e) => s + e.income, 0);
  const totalExpense = entries.reduce((s, e) => s + e.expense, 0);
  const result = totalIncome - totalExpense;

  const transfers = monthTxs.filter(t => t.type === 'transfer');

  const exportCSV = () => {
    const header = "Categoria,Entradas,Saídas,Saldo\n";
    const rows = entries.map(e => `${e.label},${e.income.toFixed(2)},${e.expense.toFixed(2)},${(e.income - e.expense).toFixed(2)}`).join("\n");
    const footer = `\nTotal,${totalIncome.toFixed(2)},${totalExpense.toFixed(2)},${result.toFixed(2)}`;
    const csv = header + rows + footer;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balancete_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso");
  };

  const monthLabel = selectedMonth
    ? new Date(selectedMonth + '-01T12:00:00').toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : '';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Balancete</h1>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                O balancete mostra o resumo de entradas e saídas por categoria no mês selecionado.
                O resultado é calculado como Entradas − Saídas.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">Visão contábil mensal — {monthLabel}</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px] bg-secondary border-border text-foreground text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>
                  {new Date(m + '-01T12:00:00').toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-border text-muted-foreground hover:text-foreground">
            <Download className="h-3.5 w-3.5 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Entradas</p>
          <p className="text-xl font-bold text-success">{fmt(totalIncome)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Saídas</p>
          <p className="text-xl font-bold text-destructive">{fmt(totalExpense)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Resultado</p>
          <p className={`text-xl font-bold ${result >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(result)}</p>
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gradient-card rounded-xl border border-border shadow-card overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-right text-muted-foreground">Entradas</TableHead>
              <TableHead className="text-right text-muted-foreground">Saídas</TableHead>
              <TableHead className="text-right text-muted-foreground">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sem dados para o mês selecionado</TableCell></TableRow>
            ) : entries.map(e => (
              <TableRow key={e.category} className="border-border">
                <TableCell className="text-foreground font-medium">{e.label}</TableCell>
                <TableCell className="text-right text-success font-mono">{e.income > 0 ? fmt(e.income) : '—'}</TableCell>
                <TableCell className="text-right text-destructive font-mono">{e.expense > 0 ? fmt(e.expense) : '—'}</TableCell>
                <TableCell className={`text-right font-mono font-medium ${e.income - e.expense >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {fmt(e.income - e.expense)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="border-border bg-secondary/50">
              <TableCell className="font-bold text-foreground">Total</TableCell>
              <TableCell className="text-right font-bold text-success font-mono">{fmt(totalIncome)}</TableCell>
              <TableCell className="text-right font-bold text-destructive font-mono">{fmt(totalExpense)}</TableCell>
              <TableCell className={`text-right font-bold font-mono ${result >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(result)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </motion.div>

      {/* Transfers */}
      {transfers.length > 0 && (
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Transferências (à parte)</h3>
          {transfers.map(t => (
            <div key={t.id} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
              <span className="text-foreground">{t.description}</span>
              <span className="text-muted-foreground font-mono">{fmt(t.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
