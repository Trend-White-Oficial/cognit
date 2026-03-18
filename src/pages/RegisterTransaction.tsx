import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Category, PAYMENT_METHOD_LABELS, Transaction, TransactionType, ParsedTransaction } from "@/lib/types";
import { classifyTransaction } from "@/lib/ai-classifier";
import { parseNotificationText } from "@/lib/notification-parser";
import { addCategoryHint } from "@/lib/ai-classifier";
import { useCategoryStore } from "@/lib/category-store";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PlusCircle, FileText, Sparkles, Check, Loader2, Pencil, Beaker } from "lucide-react";
import EditTransactionModal from "@/components/EditTransactionModal";

interface Props {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onConfirmImport: (txs: Omit<Transaction, 'id'>[]) => string[];
  onAddNotification: (n: { source: 'manual'; rawText: string; parsedAt: string; status: 'parsed'; relatedTransactionIds: string[] }) => void;
  categoryStore: ReturnType<typeof useCategoryStore>;
}

const EXAMPLE_TEXT = `PIX recebido de Maria Souza R$ 320,00 21/03 10:12
Compra débito Padaria Real R$ 18,50 21/03 07:49
TED recebida Salário R$ 2.800,00 05/03 08:59
vivo 45, vence 23, fixa
iFood 45
salário 1700 05/04 09:00`;

export default function RegisterTransaction({ onAdd, onConfirmImport, onAddNotification, categoryStore }: Props) {
  // Manual form state
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<Category>("outros");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Cartão");
  const [recurring, setRecurring] = useState(false);

  // Import state
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleDescriptionChange = (v: string) => {
    setDescription(v);
    if (v.length > 2) {
      const detected = classifyTransaction(v);
      if (detected !== "outros") setCategory(detected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value.replace(",", "."));
    if (!numValue || !description) {
      toast.error("Preencha valor e descrição");
      return;
    }
    onAdd({ value: numValue, type, category, date, description, paymentMethod, recurring });
    toast.success("Transação registrada com sucesso!");
    setDescription("");
    setValue("");
    setCategory("outros");
  };

  // Import handlers
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
      toast.success(`${results.length} lançamentos prontos para conferência.`);
    }, 600);
  };

  const handleUpdateCategory = (idx: number, cat: Category) => {
    setParsed(prev => prev.map((p, i) => i === idx ? { ...p, category: cat, aiConfidence: 1 } : p));
  };

  const handleUpdateType = (idx: number, t: TransactionType) => {
    setParsed(prev => prev.map((p, i) => i === idx ? { ...p, type: t } : p));
  };

  const handleEditSave = (idx: number, updated: ParsedTransaction) => {
    const original = parsed[idx];
    if (original.category !== updated.category && original.description) {
      addCategoryHint(original.description.toLowerCase(), updated.category);
    }
    setParsed(prev => prev.map((p, i) => i === idx ? updated : p));
  };

  const handleDuplicate = (idx: number) => {
    setParsed(prev => [...prev.slice(0, idx + 1), { ...prev[idx] }, ...prev.slice(idx + 1)]);
    toast.info("Lançamento duplicado");
  };

  const handleDeleteParsed = (idx: number) => {
    setParsed(prev => prev.filter((_, i) => i !== idx));
    toast.info("Lançamento removido da lista");
  };

  const handleConfirmImport = () => {
    const txs = parsed.map(p => ({
      value: p.amount, type: p.type, category: p.category, date: p.date, time: p.time,
      description: p.description, descriptionRaw: p.descriptionRaw,
      paymentMethod: PAYMENT_METHOD_LABELS[p.method] || p.method,
      method: p.method, recurring: p.isRecurring, recurrenceHint: p.recurrenceHint, aiConfidence: p.aiConfidence,
    }));
    parsed.forEach(p => {
      if (p.aiConfidence === 1 && p.description) addCategoryHint(p.description.toLowerCase(), p.category);
    });
    const ids = onConfirmImport(txs);
    onAddNotification({ source: 'manual', rawText, parsedAt: new Date().toISOString(), status: 'parsed', relatedTransactionIds: ids });
    toast.success(`${ids.length} lançamentos criados com sucesso!`);
    setRawText(""); setParsed([]); setShowPreview(false);
  };

  const handleFillExample = () => { setRawText(EXAMPLE_TEXT); toast.info("Texto de exemplo carregado"); };

  const confidenceColor = (c: number) => c >= 0.8 ? "text-success" : c >= 0.5 ? "text-primary" : "text-destructive";

  const allCategories = categoryStore.visibleCategories;
  const categoriesForType = type === 'income' ? categoryStore.incomeCategories : categoryStore.expenseCategories;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Registrar</h1>
      <p className="text-sm text-muted-foreground mb-6">Registre manualmente ou importe notificações bancárias</p>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="manual" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <PlusCircle className="h-3.5 w-3.5 mr-1" /> Manual
          </TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <FileText className="h-3.5 w-3.5 mr-1" /> Importar Texto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
            className="gradient-card rounded-xl p-6 border border-border shadow-card space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-muted-foreground text-xs">Descrição</Label>
                <Input placeholder="Ex: iFood, Uber, Salário..." value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)} className="bg-secondary border-border text-foreground" />
                {category !== "outros" && <p className="text-xs text-primary mt-1">Categoria detectada automaticamente</p>}
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Valor (R$)</Label>
                <Input placeholder="0,00" value={value} onChange={(e) => setValue(e.target.value)} className="bg-secondary border-border text-foreground" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Data</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-secondary border-border text-foreground" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {categoriesForType.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Boleto">Boleto</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch checked={recurring} onCheckedChange={setRecurring} />
                <Label className="text-foreground text-sm">Recorrente</Label>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-gold text-primary-foreground font-semibold shadow-gold">
              <PlusCircle className="h-4 w-4 mr-2" /> Registrar
            </Button>
          </motion.form>
        </TabsContent>

        <TabsContent value="import">
          {!showPreview ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">Notificações Bancárias</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleFillExample} className="text-primary text-xs">
                    <Beaker className="h-3.5 w-3.5 mr-1" /> Exemplo
                  </Button>
                </div>
                <Textarea
                  placeholder={`Cole aqui suas notificações bancárias ou textos informais.\n\nO Cognit analisa o texto e organiza automaticamente valor, data e categoria.`}
                  value={rawText} onChange={(e) => setRawText(e.target.value)}
                  className="min-h-[200px] bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none" />
                <p className="text-xs text-muted-foreground mt-2">O Cognit analisa o texto e organiza automaticamente valor, data e categoria.</p>
                <Button onClick={handleParse} disabled={isParsing} className="w-full mt-4 gradient-gold text-primary-foreground font-semibold shadow-gold">
                  {isParsing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {isParsing ? "Analisando..." : "Analisar e criar lançamentos"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Entradas", value: parsed.filter(p => p.type === 'income').reduce((s, p) => s + p.amount, 0), color: "text-success" },
                  { label: "Saídas", value: parsed.filter(p => p.type === 'expense').reduce((s, p) => s + p.amount, 0), color: "text-destructive" },
                  { label: "Total", value: parsed.length, color: "text-primary", isCount: true },
                ].map((c, i) => (
                  <div key={i} className="gradient-card rounded-xl p-4 border border-border shadow-card">
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className={`text-lg font-bold ${c.color}`}>{(c as any).isCount ? `${c.value} itens` : fmt(c.value as number)}</p>
                  </div>
                ))}
              </div>

              <div className="gradient-card rounded-xl border border-border shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground w-8"></TableHead>
                      <TableHead className="text-muted-foreground">Data</TableHead>
                      <TableHead className="text-muted-foreground">Descrição</TableHead>
                      <TableHead className="text-muted-foreground">Tipo</TableHead>
                      <TableHead className="text-muted-foreground">Categoria</TableHead>
                      <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                      <TableHead className="text-muted-foreground text-center">Confiança</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.map((p, i) => (
                      <TableRow key={i} className="border-border cursor-pointer hover:bg-secondary/50" onClick={() => setEditIdx(i)}>
                        <TableCell><Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" /></TableCell>
                        <TableCell className="text-foreground text-xs">
                          {new Date(p.date + 'T12:00:00').toLocaleDateString("pt-BR")}
                          {p.time && <span className="text-muted-foreground ml-1">{p.time}</span>}
                        </TableCell>
                        <TableCell className="text-foreground text-sm">{p.description}</TableCell>
                        <TableCell>
                          <Select value={p.type} onValueChange={(v) => handleUpdateType(i, v as TransactionType)}>
                            <SelectTrigger className="w-[100px] h-7 bg-secondary border-border text-xs" onClick={e => e.stopPropagation()}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={p.category} onValueChange={(v) => handleUpdateCategory(i, v as Category)}>
                            <SelectTrigger className="w-[140px] h-7 bg-secondary border-border text-xs" onClick={e => e.stopPropagation()}>
                              <SelectValue>{categoryStore.getCategoryLabel(p.category)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {allCategories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>
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
                <Button onClick={handleConfirmImport} className="gradient-gold text-primary-foreground font-semibold shadow-gold">
                  <Check className="h-4 w-4 mr-2" /> Confirmar e salvar {parsed.length} lançamentos
                </Button>
                <Button variant="outline" onClick={() => { setShowPreview(false); setParsed([]); }} className="border-border text-muted-foreground">
                  Voltar e editar
                </Button>
              </div>

              {editIdx !== null && (
                <EditTransactionModal transaction={parsed[editIdx]} index={editIdx} open={true}
                  onClose={() => setEditIdx(null)} onSave={handleEditSave} onDuplicate={handleDuplicate} onDelete={handleDeleteParsed} />
              )}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
