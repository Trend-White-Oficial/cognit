import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserCategory, useCategoryStore } from "@/lib/category-store";
import { CategoryKind } from "@/lib/types";
import { Plus, Edit2, Trash2, Eye, EyeOff, Settings2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  store: ReturnType<typeof useCategoryStore>;
  open: boolean;
  onClose: () => void;
}

const ICONS = ['💰', '🧾', '🛒', '🧰', '⭐', '📈', '🔄', '📥', '📋', '🏠', '📱', '⚡', '💧', '🍽️', '🚗', '🏥', '🏋️', '📚', '🎬', '💳', '🏛️', '📤', '👨‍👩‍👧', '📺', '📊', '📦', '🎯', '🏦', '🚀', '💡', '🔧', '🎵', '✈️', '🎮', '📰'];

export function CategoryManager({ store, open, onClose }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: '', kind: 'expense' as CategoryKind, icon: '📦', color: '#94A3B8', description: '' });
  const [showHidden, setShowHidden] = useState(false);

  const displayed = showHidden ? store.categories : store.visibleCategories;
  const incomeList = displayed.filter(c => c.kind === 'income');
  const expenseList = displayed.filter(c => c.kind === 'expense');

  const startEdit = (cat: UserCategory) => {
    setEditingId(cat.id);
    setForm({ label: cat.label, kind: cat.kind, icon: cat.icon, color: cat.color, description: cat.description || '' });
  };

  const handleSaveEdit = () => {
    if (!editingId || !form.label.trim()) return;
    store.updateCategory(editingId, { label: form.label, icon: form.icon, color: form.color, description: form.description || undefined, kind: form.kind });
    toast.success("Categoria atualizada");
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!form.label.trim()) { toast.error("Informe o nome da categoria"); return; }
    store.addCategory({ label: form.label, kind: form.kind, icon: form.icon, color: form.color, description: form.description || undefined });
    toast.success("Categoria criada");
    setShowAdd(false);
    setForm({ label: '', kind: 'expense', icon: '📦', color: '#94A3B8', description: '' });
  };

  const handleDelete = (id: string) => {
    store.deleteCategory(id);
    toast.success("Categoria removida");
  };

  const renderList = (title: string, list: UserCategory[]) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      {list.map(cat => (
        <div key={cat.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${cat.hidden ? 'opacity-50' : ''} hover:bg-secondary/50 transition-colors`}>
          <span className="text-base">{cat.icon}</span>
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
          <span className="text-sm text-foreground flex-1 truncate">{cat.label}</span>
          {cat.hidden && <span className="text-[10px] text-muted-foreground">oculta</span>}
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => store.toggleHidden(cat.id)}>
            {cat.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => startEdit(cat)}>
            <Edit2 className="h-3 w-3" />
          </Button>
          {!cat.isDefault && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(cat.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="grid gap-3 p-4 border border-border rounded-lg bg-secondary/30">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-muted-foreground text-xs">Nome</Label>
          <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="bg-secondary border-border text-sm" placeholder="Ex: Vale Alimentação" />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Tipo</Label>
          <Select value={form.kind} onValueChange={v => setForm(f => ({ ...f, kind: v as CategoryKind }))}>
            <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-muted-foreground text-xs">Ícone</Label>
        <div className="flex gap-1 flex-wrap mt-1 max-h-20 overflow-y-auto">
          {ICONS.map(icon => (
            <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
              className={`text-sm p-1 rounded transition-colors ${form.icon === icon ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-secondary'}`}>
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-muted-foreground text-xs">Cor</Label>
        <div className="flex items-center gap-2">
          <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-8 h-8 rounded border-0 cursor-pointer" />
          <span className="text-xs text-muted-foreground font-mono">{form.color}</span>
        </div>
      </div>
      <div>
        <Label className="text-muted-foreground text-xs">Descrição (opcional)</Label>
        <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-secondary border-border text-sm" placeholder="Breve descrição" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setEditingId(null); }} className="border-border text-muted-foreground">Cancelar</Button>
        <Button size="sm" onClick={onSubmit} className="gradient-gold text-primary-foreground shadow-gold">{submitLabel}</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Gerenciar Categorias
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Switch checked={showHidden} onCheckedChange={setShowHidden} />
            <span className="text-xs text-muted-foreground">Mostrar ocultas</span>
          </div>
          <Button size="sm" onClick={() => { setShowAdd(true); setEditingId(null); setForm({ label: '', kind: 'expense', icon: '📦', color: '#94A3B8', description: '' }); }}
            className="gradient-gold text-primary-foreground shadow-gold text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Nova Categoria
          </Button>
        </div>

        {showAdd && renderForm(handleAdd, 'Criar')}
        {editingId && renderForm(handleSaveEdit, 'Salvar')}

        <div className="space-y-4 mt-2">
          {renderList('Receitas', incomeList)}
          {renderList('Despesas', expenseList)}
        </div>
      </DialogContent>
    </Dialog>
  );
}
