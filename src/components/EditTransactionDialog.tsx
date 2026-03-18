import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Transaction, Category, TransactionType, PaymentMethod, PAYMENT_METHOD_LABELS } from "@/lib/types";
import { useCategoryStore } from "@/lib/category-store";
import { Save, Copy, Trash2 } from "lucide-react";

interface Props {
  transaction: Transaction;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Transaction>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  categoryStore: ReturnType<typeof useCategoryStore>;
}

export default function EditTransactionDialog({ transaction, open, onClose, onSave, onDuplicate, onDelete, categoryStore }: Props) {
  const [form, setForm] = useState({ ...transaction });

  const update = <K extends keyof Transaction>(key: K, value: Transaction[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({
      value: form.value, type: form.type, category: form.category, date: form.date,
      time: form.time, description: form.description, method: form.method,
      recurring: form.recurring, recurrenceHint: form.recurrenceHint,
    });
    onClose();
  };

  const categories = form.type === 'income' ? categoryStore.incomeCategories : categoryStore.expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Editar Lançamento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Tipo</Label>
              <Select value={form.type} onValueChange={(v) => update('type', v as TransactionType)}>
                <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Método</Label>
              <Select value={form.method || 'unknown'} onValueChange={(v) => update('method', v as PaymentMethod)}>
                <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Valor (R$)</Label>
            <Input type="number" step="0.01" value={form.value}
              onChange={(e) => update('value', parseFloat(e.target.value) || 0)} className="bg-secondary border-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Data</Label>
              <Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="bg-secondary border-border text-sm" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Hora</Label>
              <Input type="time" value={form.time || ''} onChange={(e) => update('time', e.target.value)} className="bg-secondary border-border text-sm" />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Descrição</Label>
            <Input value={form.description} onChange={(e) => update('description', e.target.value)} className="bg-secondary border-border" />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Categoria</Label>
            <Select value={form.category} onValueChange={(v) => update('category', v as Category)}>
              <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={form.recurring} onCheckedChange={(v) => update('recurring', v)} />
              <Label className="text-muted-foreground text-xs">Recorrente</Label>
            </div>
            {form.recurring && (
              <Select value={form.recurrenceHint || 'mensal'} onValueChange={(v) => update('recurrenceHint', v)}>
                <SelectTrigger className="w-[120px] bg-secondary border-border text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={() => { onDuplicate(); onClose(); }} className="border-border text-muted-foreground">
            <Copy className="h-3.5 w-3.5 mr-1" /> Duplicar
          </Button>
          <Button variant="outline" size="sm" onClick={() => { onDelete(); onClose(); }} className="border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
          </Button>
          <Button size="sm" onClick={handleSave} className="gradient-gold text-primary-foreground shadow-gold">
            <Save className="h-3.5 w-3.5 mr-1" /> Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
