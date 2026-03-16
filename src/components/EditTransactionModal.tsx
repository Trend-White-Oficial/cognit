import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ParsedTransaction, Category, TransactionType, PaymentMethod, CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";
import { Save, Copy, Trash2 } from "lucide-react";

interface Props {
  transaction: ParsedTransaction;
  index: number;
  open: boolean;
  onClose: () => void;
  onSave: (index: number, updated: ParsedTransaction) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}

export default function EditTransactionModal({ transaction, index, open, onClose, onSave, onDuplicate, onDelete }: Props) {
  const [form, setForm] = useState<ParsedTransaction>({ ...transaction });

  const update = <K extends keyof ParsedTransaction>(key: K, value: ParsedTransaction[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(index, { ...form, aiConfidence: 1 });
    onClose();
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

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
              <Select value={form.method} onValueChange={(v) => update('method', v as PaymentMethod)}>
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
            <Input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => update('amount', parseFloat(e.target.value) || 0)}
              className="bg-secondary border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Hora</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => update('time', e.target.value)}
                className="bg-secondary border-border text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Categoria</Label>
            <Select value={form.category} onValueChange={(v) => update('category', v as Category)}>
              <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isRecurring}
                onCheckedChange={(v) => update('isRecurring', v)}
              />
              <Label className="text-muted-foreground text-xs">Recorrente</Label>
            </div>
            {form.isRecurring && (
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

          <p className="text-xs text-muted-foreground">
            Confiança da IA: <span className="font-mono">{Math.round(transaction.aiConfidence * 100)}%</span>
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={() => { onDuplicate(index); onClose(); }} className="border-border text-muted-foreground">
            <Copy className="h-3.5 w-3.5 mr-1" /> Duplicar
          </Button>
          <Button variant="outline" size="sm" onClick={() => { onDelete(index); onClose(); }} className="border-destructive text-destructive hover:bg-destructive/10">
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
