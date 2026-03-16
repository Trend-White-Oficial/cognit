import { useState, useMemo } from "react";
import { Transaction, CATEGORY_LABELS, Category, PAYMENT_METHOD_LABELS } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trash2, Copy, Edit2, Receipt } from "lucide-react";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onDelete: (id: string) => void;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
}

export default function Transactions({ transactions, onUpdate, onDelete, onAdd }: Props) {
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");

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
    if (filterMethod !== "all") result = result.filter(t => t.method === filterMethod);
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filterMonth, filterCategory, filterType, filterMethod]);

  const filteredIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0);
  const filteredExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0);

  const handleDuplicate = (t: Transaction) => {
    const { id, ...rest } = t;
    onAdd(rest);
    toast.success("Lançamento duplicado");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Lançamentos</h1>
      <p className="text-sm text-muted-foreground mb-4">Todas as suas transações com filtros avançados</p>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="gradient-card rounded-xl p-3 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Entradas (filtro)</p>
          <p className="text-lg font-bold text-success">{fmt(filteredIncome)}</p>
        </div>
        <div className="gradient-card rounded-xl p-3 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Saídas (filtro)</p>
          <p className="text-lg font-bold text-destructive">{fmt(filteredExpense)}</p>
        </div>
        <div className="gradient-card rounded-xl p-3 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Resultado</p>
          <p className={`text-lg font-bold ${filteredIncome - filteredExpense >= 0 ? 'text-success' : 'text-destructive'}`}>
            {fmt(filteredIncome - filteredExpense)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[150px] bg-secondary border-border text-foreground text-xs h-8">
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
            <SelectItem value="all">Todas</SelectItem>
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
            <SelectItem value="transfer">Transferência</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterMethod} onValueChange={setFilterMethod}>
          <SelectTrigger className="w-[120px] bg-secondary border-border text-foreground text-xs h-8">
            <SelectValue placeholder="Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gradient-card rounded-xl border border-border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Data</TableHead>
              <TableHead className="text-muted-foreground">Descrição</TableHead>
              <TableHead className="text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-muted-foreground">Método</TableHead>
              <TableHead className="text-right text-muted-foreground">Valor</TableHead>
              <TableHead className="text-center text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum lançamento encontrado</TableCell></TableRow>
            ) : filtered.map((t) => (
              <TableRow key={t.id} className="border-border">
                <TableCell className="text-foreground text-sm">
                  {new Date(t.date + 'T12:00:00').toLocaleDateString("pt-BR")}
                  {t.time && <span className="text-muted-foreground text-xs ml-1">{t.time}</span>}
                </TableCell>
                <TableCell className="text-foreground text-sm">
                  {t.description}
                  {t.recurring && <Badge variant="outline" className="ml-2 text-xs border-primary/30 text-primary">Recorrente</Badge>}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{CATEGORY_LABELS[t.category]}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {t.method ? PAYMENT_METHOD_LABELS[t.method as keyof typeof PAYMENT_METHOD_LABELS] || t.paymentMethod : t.paymentMethod}
                </TableCell>
                <TableCell className={`text-right text-sm font-medium font-mono ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.value)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleDuplicate(t)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { onDelete(t.id); toast.success("Lançamento excluído"); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
