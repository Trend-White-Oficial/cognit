import { useState, useMemo } from "react";
import { Transaction, CATEGORY_LABELS, Category } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

interface Props {
  transactions: Transaction[];
}

export default function Spreadsheet({ transactions }: Props) {
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (filterMonth !== "all") result = result.filter(t => t.date.startsWith(filterMonth));
    if (filterCategory !== "all") result = result.filter(t => t.category === filterCategory);
    if (filterType !== "all") result = result.filter(t => t.type === filterType);
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filterMonth, filterCategory, filterType]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Planilha Mensal</h1>
      <p className="text-sm text-muted-foreground mb-4">Todas as suas transações</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[140px] bg-secondary border-border text-foreground text-xs h-8">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {months.map(m => (
              <SelectItem key={m} value={m}>
                {new Date(m + '-01T12:00:00').toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px] bg-secondary border-border text-foreground text-xs h-8">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[120px] bg-secondary border-border text-foreground text-xs h-8">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="gradient-card rounded-xl border border-border shadow-card overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Data</TableHead>
              <TableHead className="text-muted-foreground">Descrição</TableHead>
              <TableHead className="text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-muted-foreground">Pagamento</TableHead>
              <TableHead className="text-right text-muted-foreground">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma transação encontrada com os filtros selecionados
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id} className="border-border">
                  <TableCell className="text-foreground text-sm">
                    {new Date(t.date + 'T12:00:00').toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-foreground text-sm">{t.description}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{CATEGORY_LABELS[t.category]}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{t.paymentMethod}</TableCell>
                  <TableCell className={`text-right text-sm font-medium ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                    {t.type === "income" ? "+" : "-"}{fmt(t.value)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
