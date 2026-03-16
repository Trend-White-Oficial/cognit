import { useMemo, useState } from "react";
import { Transaction, CATEGORY_LABELS } from "@/lib/types";
import { generateTaxTips } from "@/lib/notification-parser";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileText, HelpCircle, CheckSquare, AlertTriangle } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

export default function TaxGuide({ transactions, onUpdate }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const taxTips = useMemo(() => generateTaxTips(transactions), [transactions]);

  // Transactions relevant for tax: income, saude, educacao
  const relevantTxs = useMemo(() =>
    transactions.filter(t =>
      t.type === 'income' ||
      t.category === 'saude' ||
      t.category === 'educacao' ||
      t.markedForTax
    ),
    [transactions]
  );

  const checklist = [
    { label: "Informe de Rendimentos do empregador", done: false },
    { label: "Comprovantes de despesas médicas", done: false },
    { label: "Recibos de educação", done: false },
    { label: "Informe de rendimentos bancários", done: false },
    { label: "Notas de corretagem (se aplicável)", done: false },
    { label: "Comprovantes de previdência privada", done: false },
  ];

  const [checkState, setCheckState] = useState<boolean[]>(checklist.map(() => false));

  const toggleCheck = (idx: number) => {
    setCheckState(prev => prev.map((v, i) => i === idx ? !v : v));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold text-foreground">Orientações de IR</h1>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            Estas orientações são informativas e não substituem um contador. Consulte um profissional para sua declaração.
          </TooltipContent>
        </Tooltip>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Organize seus dados para a declaração de Imposto de Renda</p>

      {/* Tips */}
      <div className="space-y-3 mb-6">
        {taxTips.map((tip, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="gradient-card rounded-xl p-4 border border-border shadow-card flex items-start gap-3"
          >
            <div className="rounded-full p-2 bg-primary/10">
              {tip.title.includes('Guarde') || tip.title.includes('Checklist') ? <CheckSquare className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{tip.title}</p>
              <p className="text-sm text-muted-foreground">{tip.message}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Checklist */}
      <div className="gradient-card rounded-xl p-5 border border-border shadow-card mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Checklist Mensal
        </h3>
        <div className="space-y-3">
          {checklist.map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <Switch checked={checkState[i]} onCheckedChange={() => toggleCheck(i)} />
              <span className={`text-sm transition-colors ${checkState[i] ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {item.label}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          ✓ {checkState.filter(Boolean).length}/{checklist.length} itens verificados
        </p>
      </div>

      {/* Relevant transactions */}
      <div className="gradient-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Lançamentos relevantes para IR</h3>
          <p className="text-xs text-muted-foreground">Receitas, saúde e educação — marque os que deseja incluir</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground w-12">IR</TableHead>
              <TableHead className="text-muted-foreground">Descrição</TableHead>
              <TableHead className="text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-right text-muted-foreground">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relevantTxs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum lançamento relevante</TableCell></TableRow>
            ) : relevantTxs.map(t => (
              <TableRow key={t.id} className="border-border">
                <TableCell>
                  <Switch
                    checked={t.markedForTax || false}
                    onCheckedChange={(v) => onUpdate(t.id, { markedForTax: v })}
                  />
                </TableCell>
                <TableCell className="text-foreground text-sm">{t.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${t.type === 'income' ? 'border-success/30 text-success' : 'border-border text-muted-foreground'}`}>
                    {t.type === 'income' ? 'Receita' : 'Despesa'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{CATEGORY_LABELS[t.category]}</TableCell>
                <TableCell className={`text-right font-mono text-sm ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                  {fmt(t.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
