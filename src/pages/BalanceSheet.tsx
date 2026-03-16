import { useState, useMemo } from "react";
import { Transaction, Debt, CATEGORY_LABELS, CATEGORY_META, Category, BALANCE_GROUP_LABELS } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Download, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
  debts: Debt[];
}

export default function BalanceSheet({ transactions, debts }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(months[0] || new Date().toISOString().slice(0, 7));

  const monthEnd = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return `${y}-${String(m).padStart(2, '0')}-31`;
  }, [selectedMonth]);

  // Calculate balance for all transactions up to month end
  const txsUpToMonth = useMemo(() =>
    transactions.filter(t => t.date <= monthEnd),
    [transactions, monthEnd]
  );

  const totalIncome = txsUpToMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0);
  const totalExpense = txsUpToMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0);
  const accountBalance = totalIncome - totalExpense;

  // Assets
  const investmentTotal = txsUpToMonth
    .filter(t => t.category === 'investimentos' && t.type === 'expense')
    .reduce((s, t) => s + t.value, 0);
  
  const cashBalance = accountBalance + investmentTotal; // remove investments from liquid
  const ativoCirculante = [
    { label: 'Contas Bancárias / Carteira', value: cashBalance },
    { label: 'Aplicações de Curto Prazo', value: investmentTotal },
  ];
  const totalAtivoCirculante = ativoCirculante.reduce((s, e) => s + e.value, 0);

  // Liabilities
  const now = new Date();
  const in12m = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  const debtsCurto = debts.filter(d => d.status !== 'quitada' && new Date(d.date) <= in12m);
  const debtsLongo = debts.filter(d => d.status !== 'quitada' && new Date(d.date) > in12m);

  const totalPassivoCirculante = debtsCurto.reduce((s, d) => s + d.totalValue, 0);
  const totalPassivoNaoCirculante = debtsLongo.reduce((s, d) => s + d.totalValue, 0);

  const patrimonioLiquido = totalAtivoCirculante - totalPassivoCirculante - totalPassivoNaoCirculante;

  const monthLabel = selectedMonth
    ? new Date(selectedMonth + '-01T12:00:00').toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : '';

  const exportCSV = () => {
    let csv = "Grupo,Item,Valor\n";
    ativoCirculante.forEach(a => csv += `Ativo Circulante,${a.label},${a.value.toFixed(2)}\n`);
    csv += `Ativo Circulante,Total,${totalAtivoCirculante.toFixed(2)}\n`;
    debtsCurto.forEach(d => csv += `Passivo Circulante,${d.name},${d.totalValue.toFixed(2)}\n`);
    csv += `Passivo Circulante,Total,${totalPassivoCirculante.toFixed(2)}\n`;
    debtsLongo.forEach(d => csv += `Passivo Não Circulante,${d.name},${d.totalValue.toFixed(2)}\n`);
    csv += `Passivo Não Circulante,Total,${totalPassivoNaoCirculante.toFixed(2)}\n`;
    csv += `\nPatrimônio Líquido,,${patrimonioLiquido.toFixed(2)}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `balanco_${selectedMonth}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Balanço Patrimonial</h1>
            <Tooltip>
              <TooltipTrigger><HelpCircle className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Visão simplificada do patrimônio: Ativos (o que você tem) menos Passivos (o que você deve) = Patrimônio Líquido.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">Posição patrimonial — {monthLabel}</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px] bg-secondary border-border text-foreground text-xs h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>
                  {new Date(m + '-01T12:00:00').toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} className="border-border text-muted-foreground">
            <Download className="h-3.5 w-3.5 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Total Ativos</p>
          <p className="text-xl font-bold text-success">{fmt(totalAtivoCirculante)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Total Passivos</p>
          <p className="text-xl font-bold text-destructive">{fmt(totalPassivoCirculante + totalPassivoNaoCirculante)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Patrimônio Líquido</p>
          <p className={`text-xl font-bold ${patrimonioLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(patrimonioLiquido)}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gradient-card rounded-xl border border-border shadow-card overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Item</TableHead>
              <TableHead className="text-right text-muted-foreground">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Ativo Circulante */}
            <TableRow className="border-border bg-secondary/30">
              <TableCell colSpan={2} className="font-semibold text-foreground">Ativo Circulante</TableCell>
            </TableRow>
            {ativoCirculante.map((a, i) => (
              <TableRow key={i} className="border-border">
                <TableCell className="text-muted-foreground pl-6">{a.label}</TableCell>
                <TableCell className="text-right font-mono text-success">{fmt(a.value)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-border bg-secondary/20">
              <TableCell className="font-medium text-foreground pl-4">Subtotal Ativo</TableCell>
              <TableCell className="text-right font-bold text-success font-mono">{fmt(totalAtivoCirculante)}</TableCell>
            </TableRow>

            {/* Passivo Circulante */}
            <TableRow className="border-border bg-secondary/30">
              <TableCell colSpan={2} className="font-semibold text-foreground">Passivo Circulante (≤ 12 meses)</TableCell>
            </TableRow>
            {debtsCurto.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={2} className="text-muted-foreground pl-6 text-sm">Nenhuma obrigação de curto prazo</TableCell>
              </TableRow>
            ) : debtsCurto.map(d => (
              <TableRow key={d.id} className="border-border">
                <TableCell className="text-muted-foreground pl-6">{d.name}</TableCell>
                <TableCell className="text-right font-mono text-destructive">{fmt(d.totalValue)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-border bg-secondary/20">
              <TableCell className="font-medium text-foreground pl-4">Subtotal Passivo Circulante</TableCell>
              <TableCell className="text-right font-bold text-destructive font-mono">{fmt(totalPassivoCirculante)}</TableCell>
            </TableRow>

            {/* Passivo Não Circulante */}
            {debtsLongo.length > 0 && (
              <>
                <TableRow className="border-border bg-secondary/30">
                  <TableCell colSpan={2} className="font-semibold text-foreground">Passivo Não Circulante ({'>'} 12 meses)</TableCell>
                </TableRow>
                {debtsLongo.map(d => (
                  <TableRow key={d.id} className="border-border">
                    <TableCell className="text-muted-foreground pl-6">{d.name}</TableCell>
                    <TableCell className="text-right font-mono text-destructive">{fmt(d.totalValue)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-border bg-secondary/20">
                  <TableCell className="font-medium text-foreground pl-4">Subtotal Passivo Não Circulante</TableCell>
                  <TableCell className="text-right font-bold text-destructive font-mono">{fmt(totalPassivoNaoCirculante)}</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="border-border bg-secondary/50">
              <TableCell className="font-bold text-foreground text-base">Patrimônio Líquido (Ativo – Passivo)</TableCell>
              <TableCell className={`text-right font-bold text-base font-mono ${patrimonioLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(patrimonioLiquido)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </motion.div>

      <p className="text-xs text-muted-foreground">
        * Transferências entre contas do mesmo usuário não alteram o Patrimônio Líquido.
      </p>
    </div>
  );
}
