import { useState, useMemo } from "react";
import { Transaction, CATEGORY_META, CATEGORY_LABELS, Category, DEFAULT_DRE_MAPPING, DRE_GROUP_LABELS, DREGroup } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
}

export default function DREPage({ transactions }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(months[0] || new Date().toISOString().slice(0, 7));

  const monthTxs = useMemo(() =>
    transactions.filter(t => t.date.startsWith(selectedMonth) && t.type !== 'transfer'),
    [transactions, selectedMonth]
  );

  // Exclude intra-account transfers
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
      groups[group].push({ category: cat as Category, label: CATEGORY_LABELS[cat as Category] || cat, value });
    }

    return groups;
  }, [monthTxs]);

  const receitaBruta = dreData.receita_bruta.reduce((s, e) => s + e.value, 0);
  const deducoes = Math.abs(dreData.deducoes.reduce((s, e) => s + e.value, 0));
  const receitaLiquida = receitaBruta - deducoes;
  const custos = Math.abs(dreData.custos.reduce((s, e) => s + e.value, 0));
  const despOp = Math.abs(dreData.despesa_operacional.reduce((s, e) => s + e.value, 0));
  const outras = dreData.outras_receitas_despesas.reduce((s, e) => s + e.value, 0);
  const resultado = receitaLiquida - custos - despOp + outras;

  const monthLabel = selectedMonth
    ? new Date(selectedMonth + '-01T12:00:00').toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : '';

  const exportCSV = () => {
    let csv = "Grupo,Categoria,Valor\n";
    for (const [group, items] of Object.entries(dreData)) {
      for (const item of items) {
        csv += `${DRE_GROUP_LABELS[group as DREGroup]},${item.label},${item.value.toFixed(2)}\n`;
      }
    }
    csv += `\nResultado do Período,,${resultado.toFixed(2)}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `dre_${selectedMonth}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const renderGroup = (label: string, items: { category: Category; label: string; value: number }[], isNegative = false) => {
    if (items.length === 0) return null;
    return (
      <>
        <TableRow className="border-border bg-secondary/30">
          <TableCell colSpan={2} className="font-semibold text-foreground text-sm">{label}</TableCell>
        </TableRow>
        {items.map(item => (
          <TableRow key={item.category} className="border-border">
            <TableCell className="text-muted-foreground text-sm pl-6">
              {CATEGORY_META[item.category]?.icon} {item.label}
            </TableCell>
            <TableCell className={`text-right font-mono text-sm ${item.value >= 0 ? 'text-success' : 'text-destructive'}`}>
              {fmt(Math.abs(item.value))}
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">DRE — Demonstrativo de Resultado</h1>
          <p className="text-sm text-muted-foreground">Visão contábil do período — {monthLabel}</p>
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

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Receita Bruta</p>
          <p className="text-xl font-bold text-success">{fmt(receitaBruta)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Deduções</p>
          <p className="text-xl font-bold text-destructive">{fmt(deducoes)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Despesas Op.</p>
          <p className="text-xl font-bold text-destructive">{fmt(despOp)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Resultado</p>
          <p className={`text-xl font-bold ${resultado >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(resultado)}</p>
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
            {renderGroup("Receita Bruta", dreData.receita_bruta)}
            
            <TableRow className="border-border bg-secondary/50">
              <TableCell className="font-bold text-foreground">= Receita Bruta</TableCell>
              <TableCell className="text-right font-bold text-success font-mono">{fmt(receitaBruta)}</TableCell>
            </TableRow>

            {renderGroup("(-) Deduções / Impostos", dreData.deducoes, true)}
            
            <TableRow className="border-border bg-secondary/50">
              <TableCell className="font-bold text-foreground">= Receita Líquida</TableCell>
              <TableCell className={`text-right font-bold font-mono ${receitaLiquida >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(receitaLiquida)}</TableCell>
            </TableRow>

            {renderGroup("(-) Custos", dreData.custos, true)}
            {renderGroup("(-) Despesas Operacionais", dreData.despesa_operacional, true)}
            {renderGroup("Outras Receitas / Despesas", dreData.outras_receitas_despesas)}
          </TableBody>
          <TableFooter>
            <TableRow className="border-border bg-secondary/50">
              <TableCell className="font-bold text-foreground text-base">Resultado do Período</TableCell>
              <TableCell className={`text-right font-bold text-base font-mono ${resultado >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(resultado)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </motion.div>

      <p className="text-xs text-muted-foreground">
        * Transferências internas (mesma titularidade) não afetam o resultado.
      </p>
    </div>
  );
}
