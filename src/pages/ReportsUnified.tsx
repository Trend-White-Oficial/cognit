import { useState, useMemo } from "react";
import { Transaction, Debt, CATEGORY_META, CATEGORY_LABELS, Category, DEFAULT_DRE_MAPPING, DRE_GROUP_LABELS, DREGroup, BALANCE_GROUP_LABELS } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Download, HelpCircle, TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
  debts: Debt[];
}

export default function ReportsUnified({ transactions, debts }: Props) {
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

  // ===== BALANCE SHEET (Balanço) =====
  const txsUpToMonth = useMemo(() =>
    transactions.filter(t => t.date <= monthEnd),
    [transactions, monthEnd]
  );

  const totalIncome = txsUpToMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0);
  const totalExpense = txsUpToMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0);
  const accountBalance = totalIncome - totalExpense;

  const investmentTotal = txsUpToMonth
    .filter(t => t.category === 'investimentos' && t.type === 'expense')
    .reduce((s, t) => s + t.value, 0);

  const cashBalance = accountBalance + investmentTotal;
  const ativoCirculante = [
    { label: 'Contas Bancárias / Carteira', value: cashBalance },
    { label: 'Aplicações de Curto Prazo', value: investmentTotal },
  ];
  const totalAtivoCirculante = ativoCirculante.reduce((s, e) => s + e.value, 0);

  const now = new Date();
  const in12m = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const debtsCurto = debts.filter(d => d.status !== 'quitada' && new Date(d.date) <= in12m);
  const debtsLongo = debts.filter(d => d.status !== 'quitada' && new Date(d.date) > in12m);

  const totalPassivoCirculante = debtsCurto.reduce((s, d) => s + d.totalValue, 0);
  const totalPassivoNaoCirculante = debtsLongo.reduce((s, d) => s + d.totalValue, 0);

  const patrimonioLiquido = totalAtivoCirculante - totalPassivoCirculante - totalPassivoNaoCirculante;

  // ===== DRE (Income Statement) =====
  const monthTxs = useMemo(() =>
    transactions.filter(t => t.date.startsWith(selectedMonth) && t.type !== 'transfer'),
    [transactions, selectedMonth]
  );

  const isIntraTransfer = (cat: Category) => cat === 'transferencias_recebidas' || cat === 'transferencias_enviadas';

  const dreData = useMemo(() => {
    const groups: Record<DREGroup, { category: Category; label: string; value: number }[]> = {
      receita_bruta: [],
      deducoes: [],
      custos: [],
      despesa_operacional: [],
      outras_receitas_despesas: [],
    };

    const byCat: Record<string, number> = {};
    for (const t of monthTxs) {
      if (isIntraTransfer(t.category)) continue;
      const key = t.category;
      if (!byCat[key]) byCat[key] = 0;
      byCat[key] += t.type === 'income' ? t.value : -t.value;
    }

    for (const [cat, value] of Object.entries(byCat)) {
      const group = DEFAULT_DRE_MAPPING[cat as Category] || 'outras_receitas_despesas';
      const label = CATEGORY_LABELS[cat as Category] || cat;
      groups[group].push({ category: cat as Category, label, value });
    }

    return groups;
  }, [monthTxs]);

  const calcDRETotal = (group: DREGroup) => dreData[group].reduce((s, e) => s + e.value, 0);
  const receitaBruta = calcDRETotal('receita_bruta');
  const deducoes = calcDRETotal('deducoes');
  const custos = calcDRETotal('custos');
  const despesasOp = calcDRETotal('despesa_operacional');
  const outrasRecDespesas = calcDRETotal('outras_receitas_despesas');

  const receitaLiquida = receitaBruta - deducoes;
  const lucroGrosso = receitaLiquida - custos;
  const lucroOperacional = lucroGrosso - despesasOp;
  const lucroLiquido = lucroOperacional + outrasRecDespesas;

  const monthLabel = selectedMonth
    ? new Date(selectedMonth + '-01T12:00:00').toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : '';

  const exportBalanceCSV = () => {
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
    const a = document.createElement('a');
    a.href = url;
    a.download = `balanco_${selectedMonth}.csv`;
    a.click();
    toast.success("Balanço exportado");
  };

  const exportDRECSV = () => {
    let csv = "Grupo,Item,Valor\n";
    Object.entries(dreData).forEach(([group, items]) => {
      items.forEach(item => csv += `${DRE_GROUP_LABELS[group as DREGroup]},${item.label},${item.value.toFixed(2)}\n`);
      csv += `${DRE_GROUP_LABELS[group as DREGroup]},Subtotal,${calcDRETotal(group as DREGroup).toFixed(2)}\n`;
    });
    csv += `\nResumo\n`;
    csv += `Receita Bruta,${receitaBruta.toFixed(2)}\n`;
    csv += `Receita Líquida,${receitaLiquida.toFixed(2)}\n`;
    csv += `Lucro Bruto,${lucroGrosso.toFixed(2)}\n`;
    csv += `Lucro Operacional,${lucroOperacional.toFixed(2)}\n`;
    csv += `Lucro Líquido,${lucroLiquido.toFixed(2)}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dre_${selectedMonth}.csv`;
    a.click();
    toast.success("DRE exportada");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios Contábeis</h1>
        <p className="text-sm text-muted-foreground">Visualize seu Balanço Patrimonial e Demonstração de Resultado do Exercício</p>
      </div>

      {/* Month Selector */}
      <div className="mb-6 flex items-center gap-4">
        <div className="w-48">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>
                  {new Date(m + '-01T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">Período: {monthLabel}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balance" className="gap-2">
            <Wallet className="h-4 w-4" />
            Balanço Patrimonial
          </TabsTrigger>
          <TabsTrigger value="dre" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            DRE
          </TabsTrigger>
        </TabsList>

        {/* Balance Sheet Tab */}
        <TabsContent value="balance" className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Ativo Circulante</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ativoCirculante.map((item) => (
                  <TableRow key={item.label}>
                    <TableCell className="text-foreground">{item.label}</TableCell>
                    <TableCell className="text-right text-primary font-semibold">{fmt(item.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-primary/10">
                  <TableCell className="font-semibold">Total Ativo Circulante</TableCell>
                  <TableCell className="text-right font-bold text-primary">{fmt(totalAtivoCirculante)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Passivo Circulante</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debtsCurto.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">Nenhuma dívida de curto prazo</TableCell>
                  </TableRow>
                ) : (
                  debtsCurto.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="text-foreground">{debt.name}</TableCell>
                      <TableCell className="text-right text-destructive font-semibold">{fmt(debt.totalValue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-destructive/10">
                  <TableCell className="font-semibold">Total Passivo Circulante</TableCell>
                  <TableCell className="text-right font-bold text-destructive">{fmt(totalPassivoCirculante)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Passivo Não Circulante</TableHead>
                  <TableHead className="text-right font-semibold">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debtsLongo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-4">Nenhuma dívida de longo prazo</TableCell>
                  </TableRow>
                ) : (
                  debtsLongo.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell className="text-foreground">{debt.name}</TableCell>
                      <TableCell className="text-right text-destructive font-semibold">{fmt(debt.totalValue)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-destructive/10">
                  <TableCell className="font-semibold">Total Passivo Não Circulante</TableCell>
                  <TableCell className="text-right font-bold text-destructive">{fmt(totalPassivoNaoCirculante)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border border-border rounded-lg p-4 bg-success/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
                <p className="text-3xl font-bold text-success">{fmt(patrimonioLiquido)}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Ativo Total: {fmt(totalAtivoCirculante)}</p>
                <p>Passivo Total: {fmt(totalPassivoCirculante + totalPassivoNaoCirculante)}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end">
            <Button onClick={exportBalanceCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </TabsContent>

        {/* DRE Tab */}
        <TabsContent value="dre" className="space-y-4">
          {Object.entries(dreData).map(([group, items], idx) => (
            <motion.div key={group} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">{DRE_GROUP_LABELS[group as DREGroup]}</TableHead>
                    <TableHead className="text-right font-semibold">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-4">Nenhuma transação</TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.category}>
                        <TableCell className="text-foreground">{item.label}</TableCell>
                        <TableCell className="text-right font-semibold" style={{ color: item.value >= 0 ? 'var(--color-success)' : 'var(--color-destructive)' }}>
                          {fmt(item.value)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">Subtotal</TableCell>
                    <TableCell className="text-right font-bold">{fmt(calcDRETotal(group as DREGroup))}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border border-border rounded-lg p-4 bg-primary/10 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Receita Bruta</span>
              <span className="font-bold text-primary">{fmt(receitaBruta)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Receita Líquida</span>
              <span className="font-bold text-primary">{fmt(receitaLiquida)}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
              <span className="text-sm font-medium">Lucro Bruto</span>
              <span className="font-bold text-primary">{fmt(lucroGrosso)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Lucro Operacional</span>
              <span className="font-bold text-primary">{fmt(lucroOperacional)}</span>
            </div>
            <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
              <span className="text-lg font-bold">Lucro Líquido</span>
              <span className="text-lg font-bold text-primary">{fmt(lucroLiquido)}</span>
            </div>
          </motion.div>

          <div className="flex justify-end">
            <Button onClick={exportDRECSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
