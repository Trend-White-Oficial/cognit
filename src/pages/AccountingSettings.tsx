import { useState } from "react";
import { Category, CATEGORY_META, DREGroup, DRE_GROUP_LABELS, DEFAULT_DRE_MAPPING } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";

export default function AccountingSettings() {
  const [mapping, setMapping] = useState<Record<Category, DREGroup>>({ ...DEFAULT_DRE_MAPPING });

  const handleChange = (category: Category, group: DREGroup) => {
    setMapping(prev => ({ ...prev, [category]: group }));
  };

  const handleSave = () => {
    toast.success("Mapeamento contábil salvo");
  };

  const categories = Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][];

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

          {categories.map(([key, meta]) => (
            <>
              <div key={key + '-label'} className="flex items-center gap-2 py-2">
                <span className="text-base">{meta.icon}</span>
                <div>
                  <p className="text-sm text-foreground">{meta.label}</p>
                  {meta.description && <p className="text-xs text-muted-foreground">{meta.description}</p>}
                </div>
              </div>
              <span key={key + '-kind'} className={`text-xs px-2 py-0.5 rounded-full ${meta.kind === 'income' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {meta.kind === 'income' ? 'Receita' : 'Despesa'}
              </span>
              <Select key={key + '-select'} value={mapping[key]} onValueChange={(v) => handleChange(key, v as DREGroup)}>
                <SelectTrigger className="bg-secondary border-border text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DRE_GROUP_LABELS).map(([gk, gl]) => (
                    <SelectItem key={gk} value={gk}>{gl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
