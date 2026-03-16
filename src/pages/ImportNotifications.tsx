import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileText, Sparkles, Check, Loader2, Beaker } from "lucide-react";
import { ParsedTransaction, Category, CATEGORY_LABELS, PAYMENT_METHOD_LABELS, TransactionType } from "@/lib/types";
import { parseNotificationText } from "@/lib/notification-parser";
import { toast } from "sonner";

interface Props {
  onConfirm: (txs: { value: number; type: TransactionType; category: Category; date: string; time?: string; description: string; descriptionRaw?: string; paymentMethod: string; method?: string; recurring: boolean; aiConfidence?: number }[]) => string[];
  onAddNotification: (n: { source: 'manual'; rawText: string; parsedAt: string; status: 'parsed'; relatedTransactionIds: string[] }) => void;
}

const EXAMPLE_TEXT = `PIX recebido de Maria Souza R$ 320,00 21/03 10:12
Compra débito Padaria Real R$ 18,50 21/03 07:49
Fatura cartão Nubank paga R$ 950,00 10/03
TED recebida Salário R$ 2.800,00 05/03 08:59
PIX enviado Academia R$ 99,90 02/03 19:10`;

export default function ImportNotifications({ onConfirm, onAddNotification }: Props) {
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleParse = () => {
    if (!rawText.trim()) { toast.error("Cole suas notificações primeiro"); return; }
    setIsParsing(true);
    setTimeout(() => {
      const results = parseNotificationText(rawText);
      if (results.length === 0) {
        toast.error("Não foi possível identificar transações no texto");
        setIsParsing(false);
        return;
      }
      setParsed(results);
      setShowPreview(true);
      setIsParsing(false);
      toast.success(`${results.length} lançamentos identificados`);
    }, 600);
  };

  const handleUpdateCategory = (idx: number, cat: Category) => {
    setParsed(prev => prev.map((p, i) => i === idx ? { ...p, category: cat, aiConfidence: 1 } : p));
  };

  const handleUpdateType = (idx: number, type: TransactionType) => {
    setParsed(prev => prev.map((p, i) => i === idx ? { ...p, type } : p));
  };

  const handleConfirm = () => {
    const txs = parsed.map(p => ({
      value: p.amount,
      type: p.type,
      category: p.category,
      date: p.date,
      time: p.time,
      description: p.description,
      descriptionRaw: p.descriptionRaw,
      paymentMethod: PAYMENT_METHOD_LABELS[p.method] || p.method,
      method: p.method,
      recurring: p.isRecurring,
      aiConfidence: p.aiConfidence,
    }));
    const ids = onConfirm(txs);
    onAddNotification({
      source: 'manual',
      rawText,
      parsedAt: new Date().toISOString(),
      status: 'parsed',
      relatedTransactionIds: ids,
    });
    toast.success(`${ids.length} lançamentos criados com sucesso!`);
    setRawText("");
    setParsed([]);
    setShowPreview(false);
  };

  const handleFillExample = () => {
    setRawText(EXAMPLE_TEXT);
    toast.info("Texto de exemplo carregado");
  };

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return "text-success";
    if (c >= 0.5) return "text-primary";
    return "text-destructive";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Importar Notificações Bancárias</h1>
      <p className="text-sm text-muted-foreground mb-6">Cole notificações de banco, PIX ou cartão. O Persona Contábil organiza tudo automaticamente.</p>

      {!showPreview ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Notificações Bancárias</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleFillExample} className="text-primary text-xs">
                <Beaker className="h-3.5 w-3.5 mr-1" />
                Preencher com exemplos
              </Button>
            </div>
            <Textarea
              placeholder={`Cole aqui suas notificações bancárias.\n\nExemplos:\nPIX recebido de João Silva R$ 320,00 21/03 10:12\nCompra débito Mercado Livre R$ 89,90 23/03 18:45\nFatura cartão Inter paga R$ 760,00 10/04`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
            <Button onClick={handleParse} disabled={isParsing} className="w-full mt-4 gradient-gold text-primary-foreground font-semibold shadow-gold">
              {isParsing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {isParsing ? "Interpretando..." : "Interpretar e criar lançamentos"}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Entradas", value: parsed.filter(p => p.type === 'income').reduce((s, p) => s + p.amount, 0), color: "text-success" },
              { label: "Saídas", value: parsed.filter(p => p.type === 'expense').reduce((s, p) => s + p.amount, 0), color: "text-destructive" },
              { label: "Total", value: parsed.length, color: "text-primary", isCount: true },
            ].map((c, i) => (
              <div key={i} className="gradient-card rounded-xl p-4 border border-border shadow-card">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className={`text-lg font-bold ${c.color}`}>
                  {(c as any).isCount ? `${c.value} itens` : fmt(c.value as number)}
                </p>
              </div>
            ))}
          </div>

          {/* Preview table */}
          <div className="gradient-card rounded-xl border border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                  <TableHead className="text-muted-foreground">Descrição</TableHead>
                  <TableHead className="text-muted-foreground">Método</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Categoria</TableHead>
                  <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                  <TableHead className="text-muted-foreground text-center">IA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((p, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell className="text-foreground text-xs">
                      {new Date(p.date + 'T12:00:00').toLocaleDateString("pt-BR")}
                      {p.time && <span className="text-muted-foreground ml-1">{p.time}</span>}
                    </TableCell>
                    <TableCell className="text-foreground text-sm">{p.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {PAYMENT_METHOD_LABELS[p.method]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={p.type} onValueChange={(v) => handleUpdateType(i, v as TransactionType)}>
                        <SelectTrigger className="w-[100px] h-7 bg-secondary border-border text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                          <SelectItem value="transfer">Transf.</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select value={p.category} onValueChange={(v) => handleUpdateCategory(i, v as Category)}>
                        <SelectTrigger className="w-[120px] h-7 bg-secondary border-border text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={`text-right font-mono text-sm font-medium ${p.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      {p.type === 'income' ? '+' : '-'}{fmt(p.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs font-mono ${confidenceColor(p.aiConfidence)}`}>
                        {Math.round(p.aiConfidence * 100)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirm} className="gradient-gold text-primary-foreground font-semibold shadow-gold">
              <Check className="h-4 w-4 mr-2" />
              Confirmar e salvar {parsed.length} lançamentos
            </Button>
            <Button variant="outline" onClick={() => { setShowPreview(false); setParsed([]); }} className="border-border text-muted-foreground">
              Voltar e editar
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
