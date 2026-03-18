import { useState } from "react";
import { useCategoryStore } from "@/lib/category-store";
import { Category, DREGroup, DRE_GROUP_LABELS, DEFAULT_DRE_MAPPING } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";

interface Props {
  categoryStore: ReturnType<typeof useCategoryStore>;
}

export default function AccountingSettings({ categoryStore }: Props) {
  const [mapping, setMapping] = useState<Record<string, DREGroup>>({ ...DEFAULT_DRE_MAPPING });

  const handleChange = (categoryId: string, group: DREGroup) => {
    setMapping(prev => ({ ...prev, [categoryId]: group }));
  };

  const handleSave = () => {
    toast.success("Mapeamento contábil salvo");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />Configurações Contábeis
          </h1>
          <p className="text-sm text-muted-foreground">Mapeie categorias para grupos contábeis do DRE e Balanço</p>
        </div>
        <Button onClick={handleSave} className="gradient-gold text-primary-foreground shadow-gold">
          <Save className="h-4 w-4 mr-2" />Salvar
        </Button>
      </div>

      <div className="gradient-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-0 p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</p>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</p>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grupo DRE</p>
          <div className="col-span-3 border-b border-border my-2" />

          {categoryStore.visibleCategories.map(cat => (
            <div key={cat.id} className="contents">
              <div className="flex items-center gap-2 py-2">
                <span className="text-base">{cat.icon}</span>
                <div>
                  <p className="text-sm text-foreground">{cat.label}</p>
                  {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${cat.kind === 'income' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {cat.kind === 'income' ? 'Receita' : 'Despesa'}
              </span>
              <Select value={mapping[cat.id] || 'outras_receitas_despesas'} onValueChange={(v) => handleChange(cat.id, v as DREGroup)}>
                <SelectTrigger className="bg-secondary border-border text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DRE_GROUP_LABELS).map(([gk, gl]) => (
                    <SelectItem key={gk} value={gk}>{gl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
