import { useState } from "react";
import { Debt, DebtStatus, DEBT_STATUS_LABELS } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Search, PlusCircle, Shield, AlertTriangle, CheckCircle2, Clock, Pencil, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  debts: Debt[];
  onAdd: (d: Omit<Debt, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Debt>) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: DebtStatus) => void;
  onSimulateCpf: (cpfHash: string) => Debt[];
}

const STATUS_CONFIG: Record<DebtStatus, { icon: typeof AlertTriangle; badge: string }> = {
  ativa: { icon: AlertTriangle, badge: "bg-destructive/20 text-destructive border-destructive/30" },
  negociacao: { icon: Clock, badge: "bg-primary/20 text-primary border-primary/30" },
  quitada: { icon: CheckCircle2, badge: "bg-success/20 text-success border-success/30" },
};

function hashCPF(cpf: string): string {
  let hash = 0;
  for (let i = 0; i < cpf.length; i++) {
    const char = cpf.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'cpf_' + Math.abs(hash).toString(36);
}

const DEBT_TYPE_OPTIONS = ['empréstimo', 'cartão', 'financiamento', 'cheque especial', 'outro'];

export default function DebtsCPF({ debts, onAdd, onUpdate, onDelete, onUpdateStatus, onSimulateCpf }: Props) {
  const [cpf, setCpf] = useState("");
  const [consent, setConsent] = useState(false);
  const [queryResults, setQueryResults] = useState<Debt[] | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [form, setForm] = useState({ name: '', totalValue: '', creditor: '', debtType: 'empréstimo', date: '', startDate: '', installments: '', interestRate: '' });

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleQuery = () => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) { toast.error("CPF inválido"); return; }
    if (!consent) { toast.error("É necessário consentir com a consulta (LGPD)"); return; }
    const hash = hashCPF(cleaned);
    const results = onSimulateCpf(hash);
    setQueryResults(results);
    toast.success("Consulta simulada realizada");
  };

  const resetForm = () => {
    setForm({ name: '', totalValue: '', creditor: '', debtType: 'empréstimo', date: '', startDate: '', installments: '', interestRate: '' });
    setEditingDebt(null);
  };

  const openEdit = (d: Debt) => {
    setForm({
      name: d.name, totalValue: String(d.totalValue), creditor: d.creditor || '', debtType: d.debtType || 'empréstimo',
      date: d.date, startDate: d.startDate || '', installments: d.installments ? String(d.installments) : '',
      interestRate: d.interestRate ? String(d.interestRate) : '',
    });
    setEditingDebt(d);
    setManualOpen(true);
  };

  const handleSave = () => {
    const val = parseFloat(form.totalValue.replace(',', '.'));
    if (!form.name || !val) { toast.error("Preencha nome e valor"); return; }
    const data = {
      name: form.name, totalValue: val, date: form.date || new Date().toISOString().split('T')[0],
      startDate: form.startDate || undefined, status: editingDebt?.status || 'ativa' as DebtStatus,
      source: editingDebt?.source || 'manual' as const, creditor: form.creditor || undefined,
      debtType: form.debtType || undefined, cpfHash: editingDebt?.cpfHash,
      installments: form.installments ? parseInt(form.installments) : undefined,
      interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
    };

    if (editingDebt) {
      onUpdate(editingDebt.id, data);
      toast.success("Dívida atualizada");
    } else {
      onAdd(data);
      toast.success("Dívida registrada");
    }
    resetForm();
    setManualOpen(false);
  };

  const handleDuplicate = (d: Debt) => {
    const { id, ...rest } = d;
    onAdd(rest);
    toast.success("Dívida duplicada");
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast.success("Dívida excluída");
  };

  const allDebts = debts;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dívidas por CPF</h1>
          <p className="text-sm text-muted-foreground">Consulta simulada + cadastro manual. Integração real requer convênio oficial.</p>
        </div>
        <Button onClick={() => { resetForm(); setManualOpen(true); }} className="gradient-gold text-primary-foreground shadow-gold">
          <PlusCircle className="h-4 w-4 mr-2" />Cadastro Manual
        </Button>
      </div>

      <Tabs defaultValue="consulta" className="w-full">
        <TabsList className="bg-secondary border border-border mb-4">
          <TabsTrigger value="consulta" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Search className="h-3.5 w-3.5 mr-1" />Consulta (Simulada)
          </TabsTrigger>
          <TabsTrigger value="resumo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Resumo de Dívidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consulta">
          <div className="gradient-card rounded-xl p-5 border border-border shadow-card mb-6">
            <div className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Aviso LGPD</p>
                <p>Esta consulta é <strong>simulada</strong>. Integração futura requer convênio e APIs oficiais. O CPF não é armazenado — apenas um hash irreversível.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-muted-foreground text-xs">CPF</Label>
                <Input placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} className="bg-secondary border-border text-foreground" />
              </div>
              <div className="flex items-end">
                <div className="flex items-center gap-2">
                  <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(!!c)} />
                  <label htmlFor="consent" className="text-xs text-muted-foreground cursor-pointer">
                    Consinto com a consulta conforme LGPD
                  </label>
                </div>
              </div>
            </div>
            <Button onClick={handleQuery} disabled={!consent} className="gradient-gold text-primary-foreground shadow-gold">
              <Search className="h-4 w-4 mr-2" />Consultar (Simulado)
            </Button>

            {queryResults && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                <p className="text-sm font-medium text-foreground">Resultado simulado: {queryResults.length} dívida(s)</p>
                {queryResults.map(d => (
                  <div key={d.id} className="bg-secondary/50 rounded-lg p-3 border border-border flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.creditor} · {d.debtType}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="font-mono font-bold text-destructive">{fmt(d.totalValue)}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(d)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleDuplicate(d)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground italic">⚠️ Dados simulados. Consulta real depende de integração oficial.</p>
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resumo">
          <div className="space-y-3">
            {allDebts.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma dívida registrada.</p>}
            {allDebts.map((d) => {
              const cfg = STATUS_CONFIG[d.status];
              const Icon = cfg.icon;
              return (
                <div key={d.id} className="gradient-card rounded-xl p-4 border border-border shadow-card flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="rounded-full p-2 bg-secondary shrink-0"><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.creditor && `${d.creditor} · `}{d.source === 'simulado' ? '🔮 Simulado' : '✍️ Manual'} · {new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="font-mono font-bold text-destructive">{fmt(d.totalValue)}</p>
                    <Select value={d.status} onValueChange={(v) => onUpdateStatus(d.id, v as DebtStatus)}>
                      <SelectTrigger className="w-[130px] h-8 bg-secondary border-border text-xs">
                        <Badge variant="outline" className={`text-xs ${cfg.badge}`}>{DEBT_STATUS_LABELS[d.status]}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="negociacao">Em negociação</SelectItem>
                        <SelectItem value="quitada">Quitada</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(d)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => handleDuplicate(d)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(d.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit/Add Dialog */}
      <Dialog open={manualOpen} onOpenChange={(o) => { if (!o) resetForm(); setManualOpen(o); }}>
        <DialogContent className="bg-card border-border text-foreground max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingDebt ? 'Editar Dívida' : 'Cadastrar Dívida'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div><Label className="text-muted-foreground text-xs">Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border text-foreground" placeholder="Ex: Cartão Inter" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-muted-foreground text-xs">Valor (R$) *</Label><Input value={form.totalValue} onChange={e => setForm(f => ({ ...f, totalValue: e.target.value }))} className="bg-secondary border-border text-foreground" placeholder="0,00" /></div>
              <div>
                <Label className="text-muted-foreground text-xs">Tipo</Label>
                <Select value={form.debtType} onValueChange={v => setForm(f => ({ ...f, debtType: v }))}>
                  <SelectTrigger className="bg-secondary border-border text-foreground text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{DEBT_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-muted-foreground text-xs">Data de Início</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="bg-secondary border-border text-foreground" /></div>
              <div><Label className="text-muted-foreground text-xs">Vencimento</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-secondary border-border text-foreground" /></div>
            </div>
            <div><Label className="text-muted-foreground text-xs">Credor</Label><Input value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))} className="bg-secondary border-border text-foreground" placeholder="Ex: Banco Inter" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-muted-foreground text-xs">Parcelas</Label><Input type="number" value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))} className="bg-secondary border-border text-foreground" placeholder="12" /></div>
              <div><Label className="text-muted-foreground text-xs">Juros (% a.m.)</Label><Input type="number" step="0.1" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} className="bg-secondary border-border text-foreground" placeholder="2.5" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setManualOpen(false); }} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} className="gradient-gold text-primary-foreground shadow-gold">{editingDebt ? 'Salvar' : 'Registrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
