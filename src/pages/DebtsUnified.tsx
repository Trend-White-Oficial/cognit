import { useState, useMemo } from "react";
import { Debt, DebtStatus, DEBT_STATUS_LABELS } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { CreditCard, PlusCircle, AlertTriangle, CheckCircle2, Clock, Pencil, Trash2, Copy, Search, Shield } from "lucide-react";
import { toast } from "sonner";

interface Props {
  debts: Debt[];
  onAdd: (d: Omit<Debt, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Debt>) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: DebtStatus) => void;
  onSimulateCpf: (cpfHash: string) => Debt[];
}

const STATUS_CONFIG: Record<DebtStatus, { icon: typeof AlertTriangle; color: string; badge: string }> = {
  ativa: { icon: AlertTriangle, color: "text-destructive", badge: "bg-destructive/20 text-destructive border-destructive/30" },
  negociacao: { icon: Clock, color: "text-primary", badge: "bg-primary/20 text-primary border-primary/30" },
  quitada: { icon: CheckCircle2, color: "text-success", badge: "bg-success/20 text-success border-success/30" },
};

const DEBT_TYPE_OPTIONS = ['empréstimo', 'cartão', 'financiamento', 'cheque especial', 'outro'];

function calcTimeRemaining(dueDate: string): { label: string; overdue: boolean } {
  const now = new Date();
  const due = new Date(dueDate + 'T12:00:00');
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `${Math.abs(diffDays)} dias em atraso`, overdue: true };
  if (diffDays === 0) return { label: 'Vence hoje', overdue: false };
  if (diffDays <= 30) return { label: `${diffDays} dias restantes`, overdue: false };
  const months = Math.floor(diffDays / 30);
  return { label: `${months} mês(es) restante(s)`, overdue: false };
}

function hashCPF(cpf: string): string {
  let hash = 0;
  for (let i = 0; i < cpf.length; i++) {
    const char = cpf.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'cpf_' + Math.abs(hash).toString(36);
}

export default function DebtsUnified({ debts, onAdd, onUpdate, onDelete, onUpdateStatus, onSimulateCpf }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Manual Debts Tab
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', totalValue: '', date: '', startDate: '', status: 'ativa' as DebtStatus,
    creditor: '', debtType: '', installments: '', interestRate: '',
  });

  // CPF/CNPJ Query Tab
  const [cpf, setCpf] = useState("");
  const [consent, setConsent] = useState(false);
  const [queryResults, setQueryResults] = useState<Debt[] | null>(null);

  const totalDebt = useMemo(() => debts.filter(d => d.status !== 'quitada').reduce((s, d) => s + d.totalValue, 0), [debts]);
  const activeCount = useMemo(() => debts.filter(d => d.status === 'ativa').length, [debts]);

  const handleSave = () => {
    const val = parseFloat(form.totalValue.replace(',', '.'));
    if (!form.name || !val || !form.date) {
      toast.error("Preencha nome, valor e data");
      return;
    }

    if (editingId) {
      onUpdate(editingId, {
        name: form.name,
        totalValue: val,
        date: form.date,
        startDate: form.startDate || undefined,
        status: form.status,
        creditor: form.creditor || undefined,
        debtType: form.debtType || undefined,
        installments: form.installments ? parseInt(form.installments) : undefined,
        interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
      });
      toast.success("Dívida atualizada");
      setEditingId(null);
    } else {
      onAdd({
        name: form.name,
        totalValue: val,
        date: form.date,
        startDate: form.startDate || undefined,
        status: form.status,
        creditor: form.creditor || undefined,
        debtType: form.debtType || undefined,
        installments: form.installments ? parseInt(form.installments) : undefined,
        interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
        source: 'manual',
      });
      toast.success("Dívida adicionada");
    }
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setForm({ name: '', totalValue: '', date: '', startDate: '', status: 'ativa', creditor: '', debtType: '', installments: '', interestRate: '' });
    setEditingId(null);
  };

  const handleQuery = () => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      toast.error("CPF/CNPJ inválido");
      return;
    }
    if (!consent) {
      toast.error("É necessário consentir com a consulta (LGPD)");
      return;
    }
    const hash = hashCPF(cleaned);
    const results = onSimulateCpf(hash);
    setQueryResults(results);
    toast.success("Consulta simulada realizada");
  };

  const handleClearCpf = () => {
    setCpf("");
    setQueryResults(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Dívidas</h1>
        <p className="text-sm text-muted-foreground">Gerencie suas dívidas manuais e consulte seu histórico de CPF/CNPJ</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gradient-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total em Dívidas</p>
              <p className="text-2xl font-bold text-destructive">{fmt(totalDebt)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-destructive/50" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="gradient-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Dívidas Ativas</p>
              <p className="text-2xl font-bold text-primary">{activeCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-primary/50" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="gradient-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Quitadas</p>
              <p className="text-2xl font-bold text-success">{debts.filter(d => d.status === 'quitada').length}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-success/50" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Minhas Dívidas</TabsTrigger>
          <TabsTrigger value="cpf">Consulta CPF/CNPJ</TabsTrigger>
        </TabsList>

        {/* Manual Debts Tab */}
        <TabsContent value="manual" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Nova Dívida
            </Button>
          </div>

          {debts.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma dívida registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map((debt) => {
                const time = calcTimeRemaining(debt.date);
                const StatusIcon = STATUS_CONFIG[debt.status].icon;
                return (
                  <motion.div key={debt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{debt.name}</h3>
                          <Badge className={STATUS_CONFIG[debt.status].badge}>{DEBT_STATUS_LABELS[debt.status]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{debt.creditor && `Credor: ${debt.creditor}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive">{fmt(debt.totalValue)}</p>
                        <p className={`text-xs ${time.overdue ? 'text-destructive' : 'text-muted-foreground'}`}>{time.label}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingId(debt.id); setForm({ name: debt.name, totalValue: String(debt.totalValue), date: debt.date, startDate: debt.startDate || '', status: debt.status, creditor: debt.creditor || '', debtType: debt.debtType || '', installments: debt.installments ? String(debt.installments) : '', interestRate: debt.interestRate ? String(debt.interestRate) : '' }); setShowForm(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm("Tem certeza?")) onDelete(debt.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {debt.status !== 'quitada' && (
                        <Button variant="ghost" size="sm" onClick={() => onUpdateStatus(debt.id, 'quitada')}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* CPF/CNPJ Query Tab */}
        <TabsContent value="cpf" className="space-y-4">
          <div className="border border-border rounded-lg p-6 bg-muted/30">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Consulta de CPF/CNPJ</h3>
                <p className="text-sm text-muted-foreground">Consulte seu histórico de dívidas registradas em órgãos de proteção ao crédito. Esta é uma simulação para fins educacionais.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="cpf" className="text-sm font-medium">CPF ou CNPJ</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => { setCpf(e.target.value); setQueryResults(null); }}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                />
                <Label htmlFor="consent" className="text-sm cursor-pointer">
                  Autorizo a consulta de dados (LGPD)
                </Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleQuery} disabled={cpf.length < 11 || !consent} className="gap-2">
                  <Search className="h-4 w-4" />
                  Consultar
                </Button>
                {queryResults && (
                  <Button variant="outline" onClick={handleClearCpf}>
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {queryResults && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">{queryResults.length} resultado(s) encontrado(s)</p>
              {queryResults.map((debt) => (
                <motion.div key={debt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{debt.name}</h4>
                      <p className="text-sm text-muted-foreground">{debt.creditor}</p>
                    </div>
                    <p className="text-lg font-bold text-destructive">{fmt(debt.totalValue)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Vencimento: {new Date(debt.date).toLocaleDateString('pt-BR')}</p>
                  <Button variant="outline" size="sm" onClick={() => { onAdd({ name: debt.name, totalValue: debt.totalValue, date: debt.date, status: 'ativa', source: 'simulado', creditor: debt.creditor, debtType: debt.debtType }); toast.success("Dívida adicionada ao seu registro"); }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Adicionar ao Meu Registro
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Dívida' : 'Nova Dívida'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Dívida</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Empréstimo Pessoal" />
            </div>
            <div>
              <Label htmlFor="value">Valor Total</Label>
              <Input id="value" type="number" value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: e.target.value })} placeholder="0.00" step="0.01" />
            </div>
            <div>
              <Label htmlFor="date">Data de Vencimento</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="creditor">Credor</Label>
              <Input id="creditor" value={form.creditor} onChange={(e) => setForm({ ...form, creditor: e.target.value })} placeholder="Ex: Banco XYZ" />
            </div>
            <div>
              <Label htmlFor="debtType">Tipo de Dívida</Label>
              <Select value={form.debtType} onValueChange={(v) => setForm({ ...form, debtType: v })}>
                <SelectTrigger id="debtType">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DEBT_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as DebtStatus })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="negociacao">Em Negociação</SelectItem>
                  <SelectItem value="quitada">Quitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
