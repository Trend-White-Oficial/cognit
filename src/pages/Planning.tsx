import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Check, CheckCheck, ArrowDownCircle, ArrowUpCircle, CreditCard } from "lucide-react";
import { PlanningItem, PlanningItemType, PLANNING_TYPE_LABELS } from "@/lib/types";
import { parsePlanningText, calculatePlanningTotals } from "@/lib/planning-parser";
import { toast } from "sonner";

const TYPE_ICON: Record<PlanningItemType, typeof ArrowUpCircle> = {
  renda: ArrowUpCircle,
  fixa: ArrowDownCircle,
  divida: CreditCard,
};

const TYPE_COLOR: Record<PlanningItemType, string> = {
  renda: "text-success",
  fixa: "text-destructive",
  divida: "text-primary",
};

export default function Planning() {
  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<PlanningItem[]>([]);
  const [parsed, setParsed] = useState(false);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleParse = () => {
    if (!rawText.trim()) {
      toast.error("Cole seu planejamento financeiro primeiro");
      return;
    }
    const result = parsePlanningText(rawText);
    if (result.length === 0) {
      toast.error("Não foi possível identificar dados financeiros no texto");
      return;
    }
    setItems(result);
    setParsed(true);
    toast.success(`${result.length} itens identificados pela IA`);
  };

  const handleChangeType = (id: string, newType: PlanningItemType) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, type: newType } : i));
  };

  const handleTogglePaid = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, paid: !i.paid } : i));
  };

  const handleReset = () => {
    setItems([]);
    setParsed(false);
    setRawText("");
  };

  const totals = calculatePlanningTotals(items);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Importar Planejamento</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Cole seu planejamento financeiro, conversa ou anotações — a IA interpreta tudo
      </p>

      {!parsed ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Texto Financeiro</span>
            </div>
            <Textarea
              placeholder={`Cole aqui seu planejamento financeiro, conversa ou anotações.\n\nExemplo:\nSalário: 1700\nVA: 682\nVT: 226,60\nPensão: 400\nInternet: 45\nCartão Inter: 760\nInfinitePay: 571,43\nCartório: 337,23`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
            <Button onClick={handleParse} className="w-full mt-4 gradient-gold text-primary-foreground font-semibold shadow-gold">
              <Sparkles className="h-4 w-4 mr-2" />
              Interpretar com IA
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Renda Total", value: totals.totalRenda, color: "text-success" },
              { label: "Despesas Fixas", value: totals.totalFixa, color: "text-destructive" },
              { label: "Dívidas", value: totals.totalDivida, color: "text-primary" },
              { label: "Saldo Final", value: totals.saldo, color: totals.saldo >= 0 ? "text-success" : "text-destructive" },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="gradient-card rounded-xl p-4 border border-border shadow-card"
              >
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className={`text-lg font-bold ${card.color}`}>{fmt(card.value)}</p>
              </motion.div>
            ))}
          </div>

          {/* AI Insight */}
          <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
            <p className="text-sm text-foreground">
              {totals.saldo < 0
                ? `⚠️ Seu planejamento está com déficit de ${fmt(Math.abs(totals.saldo))}. Considere renegociar dívidas ou reduzir despesas fixas.`
                : totals.saldo === 0
                ? `⚖️ Seu planejamento está equilibrado — renda cobre todas as despesas e dívidas.`
                : `✅ Após pagar tudo, você terá ${fmt(totals.saldo)} de sobra. Considere investir ou reforçar sua reserva.`}
            </p>
          </div>

          {/* Table */}
          <div className="gradient-card rounded-xl border border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                  <TableHead className="text-muted-foreground text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {items.map((item, i) => {
                    const Icon = TYPE_ICON[item.type];
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: item.paid ? 0.5 : 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-border"
                      >
                        <TableCell>
                          <Select value={item.type} onValueChange={(v) => handleChangeType(item.id, v as PlanningItemType)}>
                            <SelectTrigger className="w-[130px] h-8 bg-secondary border-border text-xs">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`h-3.5 w-3.5 ${TYPE_COLOR[item.type]}`} />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="renda">Receita</SelectItem>
                              <SelectItem value="fixa">Despesa Fixa</SelectItem>
                              <SelectItem value="divida">Dívida</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className={`font-medium ${item.paid ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.name}
                        </TableCell>
                        <TableCell className={`text-right font-mono ${TYPE_COLOR[item.type]} ${item.paid ? "line-through opacity-50" : ""}`}>
                          {item.type === "renda" ? "+" : "-"}{fmt(item.value)}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.type !== "renda" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePaid(item.id)}
                              className={item.paid ? "text-success" : "text-muted-foreground hover:text-foreground"}
                            >
                              {item.paid ? <CheckCheck className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              <span className="ml-1 text-xs">{item.paid ? "Quitado" : "Pagar"}</span>
                            </Button>
                          )}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="border-border text-muted-foreground hover:text-foreground">
              Novo Planejamento
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
