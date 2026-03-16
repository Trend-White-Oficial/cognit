import { useState } from "react";
import { FinancialGoal, CATEGORY_META } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Props {
  goals: FinancialGoal[];
  onAdd: (g: Omit<FinancialGoal, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<FinancialGoal>) => void;
  onDelete: (id: string) => void;
  onAddProgress: (id: string, amount: number) => void;
}

const ICONS = ['🛡️', '✈️', '💻', '🏠', '🚗', '📚', '💰', '🎯', '🏋️', '🎮'];

const emptyGoal: Omit<FinancialGoal, 'id'> = {
  title: '', targetAmount: 0, currentAmount: 0, icon: '🎯', status: 'active',
};

export default function Goals({ goals, onAdd, onUpdate, onDelete, onAddProgress }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const [modalOpen, setModalOpen] = useState(false);
  const [progressModal, setProgressModal] = useState<FinancialGoal | null>(null);
  const [progressAmount, setProgressAmount] = useState(0);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [form, setForm] = useState<Omit<FinancialGoal, 'id'>>(emptyGoal);

  const openNew = () => {
    setEditingGoal(null);
    setForm(emptyGoal);
    setModalOpen(true);
  };

  const openEdit = (g: FinancialGoal) => {
    setEditingGoal(g);
    setForm({ title: g.title, targetAmount: g.targetAmount, currentAmount: g.currentAmount, icon: g.icon, status: g.status, deadline: g.deadline, notes: g.notes });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title || form.targetAmount <= 0) {
      toast.error("Preencha título e valor-alvo (> 0)");
      return;
    }
    if (form.currentAmount > form.targetAmount) {
      toast.error("Valor atual não pode exceder o valor-alvo");
      return;
    }
    if (editingGoal) {
      onUpdate(editingGoal.id, form);
      toast.success("Meta atualizada");
    } else {
      onAdd(form);
      toast.success("Meta criada");
    }
    setModalOpen(false);
  };

  const handleProgress = () => {
    if (!progressModal || progressAmount <= 0) return;
    onAddProgress(progressModal.id, progressAmount);
    toast.success(`+${fmt(progressAmount)} adicionado à meta`);
    setProgressModal(null);
    setProgressAmount(0);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    toast.success("Meta excluída");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Metas Financeiras</h1>
          <p className="text-sm text-muted-foreground">Acompanhe o progresso das suas metas com clareza</p>
        </div>
        <Button size="sm" onClick={openNew} className="gradient-gold text-primary-foreground shadow-gold">
          <Plus className="h-4 w-4 mr-1" /> Nova Meta
        </Button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nenhuma meta cadastrada ainda.</p>
        )}
        {goals.map((g, i) => {
          const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="gradient-card rounded-xl p-5 border border-border shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{g.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {fmt(g.currentAmount)} de {fmt(g.targetAmount)}
                      {g.deadline && <span className="ml-2">• Prazo: {new Date(g.deadline + 'T12:00:00').toLocaleDateString("pt-BR")}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">{pct}%</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-success" onClick={() => { setProgressModal(g); setProgressAmount(0); }}>
                    <TrendingUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(g)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(g.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Progress value={pct} className="h-2 bg-secondary [&>div]:gradient-gold" />
              {g.status === 'done' && <p className="text-xs text-success mt-2">✅ Meta concluída!</p>}
              {g.status === 'paused' && <p className="text-xs text-muted-foreground mt-2">⏸️ Pausada</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label className="text-muted-foreground text-xs">Título</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-secondary border-border" placeholder="Ex: Reserva de emergência" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Valor-alvo (R$)</Label>
                <Input type="number" step="0.01" value={form.targetAmount || ''} onChange={e => setForm(f => ({ ...f, targetAmount: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Valor atual (R$)</Label>
                <Input type="number" step="0.01" value={form.currentAmount || ''} onChange={e => setForm(f => ({ ...f, currentAmount: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Prazo (opcional)</Label>
                <Input type="date" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value || undefined }))} className="bg-secondary border-border text-sm" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Status</Label>
                <Select value={form.status || 'active'} onValueChange={v => setForm(f => ({ ...f, status: v as 'active' | 'paused' | 'done' }))}>
                  <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="paused">Pausada</SelectItem>
                    <SelectItem value="done">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Ícone</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {ICONS.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`text-xl p-1.5 rounded-lg transition-colors ${form.icon === icon ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-secondary'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={handleSave} className="gradient-gold text-primary-foreground shadow-gold">
              {editingGoal ? 'Salvar' : 'Criar Meta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Modal */}
      <Dialog open={!!progressModal} onOpenChange={() => setProgressModal(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar Progresso</DialogTitle>
          </DialogHeader>
          {progressModal && (
            <div className="grid gap-4 py-2">
              <p className="text-sm text-muted-foreground">{progressModal.icon} {progressModal.title}</p>
              <p className="text-xs text-muted-foreground">
                Atual: {fmt(progressModal.currentAmount)} / {fmt(progressModal.targetAmount)}
                {' '}(faltam {fmt(progressModal.targetAmount - progressModal.currentAmount)})
              </p>
              <div>
                <Label className="text-muted-foreground text-xs">Valor a adicionar (R$)</Label>
                <Input type="number" step="0.01" value={progressAmount || ''} onChange={e => setProgressAmount(parseFloat(e.target.value) || 0)} className="bg-secondary border-border" autoFocus />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button size="sm" onClick={handleProgress} className="gradient-gold text-primary-foreground shadow-gold" disabled={progressAmount <= 0}>
              <TrendingUp className="h-3.5 w-3.5 mr-1" /> Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
