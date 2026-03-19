import { useState } from "react";
import { Debt, DebtStatus, DEBT_STATUS_LABELS } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CreditCard, PlusCircle, AlertTriangle, CheckCircle2, Clock, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  debts: Debt[];
  onAdd: (d: Omit<Debt, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Debt>) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: DebtStatus) => void;
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

export default function Debts({ debts, onAdd, onUpdate, onDelete, onUpdateStatus }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', totalValue: '', date: '', startDate: '', status: 'ativa' as DebtStatus,
    creditor: '', debtType: '', installments: '', interestRate: '',
  });

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const activeDebts = debts.filter(d => d.status !== "quitada");
  const totalActive = activeDebts.reduce((s, d) => s + d.totalValue, 0);
  const paidCount = debts.filter(d => d.status === "quitada").length;
  const paidPct = debts.length > 0 ? Math.round((paidCount / debts.length) * 100) : 0;

  const resetForm = () => {
    setForm({ name: '', totalValue: '', date: '', startDate: '', status: 'ativa', creditor: '', debtType: '', installments: '', interestRate: '' });
    setEditingId(null);
  };

  const openEdit = (d: Debt) => {
    setForm({
      name: d.name, totalValue: String(d.totalValue), date: d.date, startDate: d.startDate || '',
      status: d.status, creditor: d.creditor || '', debtType: d.debtType || '',
      installments: d.installments ? String(d.installments) : '', interestRate: d.interestRate ? String(d.interestRate) : '',
    });
    setEditingId(d.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const numValue = parseFloat(form.totalValue.replace(",", "."));
    if (!form.name.trim() || !numValue) {
      toast.error("Preencha nome e valor da dívida");
      return;
    }
    const data = {
      name: form.name, totalValue: numValue, date: form.date || new Date().toISOString().split("T")[0],
      startDate: form.startDate || undefined, status: form.status,
      creditor: form.creditor || undefined, debtType: form.debtType || undefined,
      installments: form.installments ? parseInt(form.installments) : undefined,
      interestRate: form.interestRate ? parseFloat(form.interestRate) : undefined,
      source: 'manual' as const,
    };

    if (editingId) {
      onUpdate(editingId, data);
      toast.success("Dívida atualizada");
    } else {
      onAdd(data);
      toast.success("Dívida registrada");
    }
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast.success("Dívida excluída");
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dívidas</h1>
          <p className="text-sm text-muted-foreground">Controle e quite suas pendências</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-gold text-primary-foreground shadow-gold">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Dívida
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Total Ativo</p>
          <p className="text-xl font-bold text-destructive">{fmt(totalActive)}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Dívidas Pendentes</p>
          <p className="text-xl font-bold text-foreground">{activeDebts.length}</p>
        </div>
        <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-xs text-muted-foreground">Progresso de Quitação</p>
          <p className="text-xl font-bold text-success">{paidPct}%</p>
          <Progress value={paidPct} className="h-1.5 mt-2 bg-secondary [&>div]:gradient-gold" />
        </div>
      </div>

      {/* Debt list */}
      <div className="space-y-3">
        {debts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma dívida registrada.</p>
          </div>
        )}
        {debts.map((d, i) => {
          const cfg = STATUS_CONFIG[d.status];
          const Icon = cfg.icon;
          const time = calcTimeRemaining(d.date);
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: d.status === "quitada" ? 0.5 : 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="gradient-card rounded-xl p-4 border border-border shadow-card"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`rounded-full p-2 bg-secondary shrink-0 ${cfg.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate ${d.status === "quitada" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {d.name}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {d.creditor && <p className="text-xs text-muted-foreground">Credor: {d.creditor}</p>}
                      {d.debtType && <p className="text-xs text-muted-foreground">Tipo: {d.debtType}</p>}
                      <p className="text-xs text-muted-foreground">
                        Vencimento: {new Date(d.date + 'T12:00:00').toLocaleDateString("pt-BR")}
                      </p>
                      {d.startDate && (
                        <p className="text-xs text-muted-foreground">
                          Início: {new Date(d.startDate + 'T12:00:00').toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {d.installments && <p className="text-xs text-muted-foreground">{d.installments}x parcelas</p>}
                      {d.interestRate && <p className="text-xs text-muted-foreground">Juros: {d.interestRate}%</p>}
                    </div>
                    {d.status !== 'quitada' && (
                      <p className={`text-xs mt-1 ${time.overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {time.overdue ? '⚠️ ' : '⏳ '}{time.label}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className={`font-mono font-bold text-lg ${d.status === "quitada" ? "line-through text-muted-foreground" : "text-destructive"}`}>
                    {fmt(d.totalValue)}
                  </p>
                  <Select value={d.status} onValueChange={(v) => onUpdateStatus(d.id, v as DebtStatus)}>
                    <SelectTrigger className="w-[130px] h-8 bg-secondary border-border text-xs">
                      <Badge variant="outline" className={`text-xs ${cfg.badge}`}>
                        {DEBT_STATUS_LABELS[d.status]}
                      </Badge>
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { resetForm(); } setShowForm(open); }}>
        <DialogContent className="bg-card border-border text-foreground max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Dívida' : 'Nova Dívida'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label className="text-muted-foreground text-xs">Nome da Dívida *</Label>
              <Input placeholder="Ex: Cartão Inter" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-secondary border-border text-foreground" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Valor (R$) *</Label>
              <Input placeholder="0,00" value={form.totalValue} onChange={e => setForm(f => ({ ...f, totalValue: e.target.value }))} className="bg-secondary border-border text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Data de Início</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="bg-secondary border-border text-foreground" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Data de Vencimento</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-secondary border-border text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Credor</Label>
                <Input placeholder="Ex: Banco Inter" value={form.creditor} onChange={e => setForm(f => ({ ...f, creditor: e.target.value }))} className="bg-secondary border-border text-foreground" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Tipo de Dívida</Label>
                <Select value={form.debtType} onValueChange={v => setForm(f => ({ ...f, debtType: v }))}>
                  <SelectTrigger className="bg-secondary border-border text-foreground text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {DEBT_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Parcelas</Label>
                <Input type="number" placeholder="Ex: 12" value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))} className="bg-secondary border-border text-foreground" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Juros (% a.m.)</Label>
                <Input type="number" step="0.1" placeholder="Ex: 2.5" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} className="bg-secondary border-border text-foreground" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as DebtStatus }))}>
                <SelectTrigger className="bg-secondary border-border text-foreground text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="negociacao">Em negociação</SelectItem>
                  <SelectItem value="quitada">Quitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowForm(false); }} className="border-border text-muted-foreground">Cancelar</Button>
            <Button onClick={handleSave} className="gradient-gold text-primary-foreground shadow-gold">
              {editingId ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
