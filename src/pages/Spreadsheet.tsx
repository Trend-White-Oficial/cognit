import { Transaction, CATEGORY_LABELS } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

interface Props {
  transactions: Transaction[];
}

export default function Spreadsheet({ transactions }: Props) {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Planilha Mensal</h1>
      <p className="text-sm text-muted-foreground mb-6">Todas as suas transações</p>

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
            {sorted.map((t) => (
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
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
