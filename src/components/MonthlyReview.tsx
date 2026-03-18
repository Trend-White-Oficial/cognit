import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Transaction } from "@/lib/types";
import { useCategoryStore } from "@/lib/category-store";
import { CheckCircle2, ArrowRight, BarChart3, Tag, RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categoryStore: ReturnType<typeof useCategoryStore>;
}

const STEPS = [
  { title: 'Resumo de Gastos', icon: BarChart3, description: 'Confira seus maiores gastos do mês.' },
  { title: 'Categorias', icon: Tag, description: 'Alguma categorização parece incorreta?' },
  { title: 'Recorrentes', icon: RefreshCw, description: 'Confira seus lançamentos fixos.' },
  { title: 'Pendências', icon: AlertTriangle, description: 'Itens que merecem atenção.' },
];

export function MonthlyReview({ open, onClose, transactions, categoryStore }: Props) {
  const [step, setStep] = useState(0);
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTxs = transactions.filter(t => t.date.startsWith(currentMonth));
  const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.value, 0);
  const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.value, 0);
  const recurring = monthTxs.filter(t => t.recurring);

  const byCat: Record<string, number> = {};
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    const label = categoryStore.getCategoryLabel(t.category);
    byCat[label] = (byCat[label] || 0) + t.value;
  });
  const topCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const uncategorized = monthTxs.filter(t => t.category === 'outros');
  const lowConfidence = monthTxs.filter(t => t.aiConfidence !== undefined && t.aiConfidence < 0.6);

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Entradas</p>
                <p className="text-lg font-bold text-success">{fmt(income)}</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Saídas</p>
                <p className="text-lg font-bold text-destructive">{fmt(expense)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Maiores categorias de gasto</p>
              {topCats.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma despesa no mês.</p>}
              {topCats.map(([cat, val]) => (
                <div key={cat} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground">{cat}</span>
                  <span className="text-sm font-mono text-destructive">{fmt(val)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-3">
            {uncategorized.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-foreground"><span className="font-medium">{uncategorized.length}</span> lançamento(s) classificados como "Outros"</p>
                <p className="text-xs text-muted-foreground mt-1">Acesse Lançamentos para reclassificar.</p>
              </div>
            )}
            {lowConfidence.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm text-foreground"><span className="font-medium">{lowConfidence.length}</span> lançamento(s) com classificação de baixa confiança</p>
                <p className="text-xs text-muted-foreground mt-1">Corrija para melhorar a precisão futura.</p>
              </div>
            )}
            {uncategorized.length === 0 && lowConfidence.length === 0 && (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm">Todas as categorias parecem corretas!</p>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-2">
            {recurring.length === 0 && <p className="text-sm text-muted-foreground">Nenhum lançamento recorrente neste mês.</p>}
            {recurring.map(t => (
              <div key={t.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                <span className="text-sm text-foreground">{categoryStore.getCategoryMeta(t.category)?.icon} {t.description}</span>
                <span className={`text-sm font-mono ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>{fmt(t.value)}</span>
              </div>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            {expense > income && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-foreground">⚠️ Saídas superam entradas em <span className="font-bold">{fmt(expense - income)}</span></p>
              </div>
            )}
            {expense <= income && (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm">Mês sob controle! Saldo positivo de {fmt(income - expense)}.</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">A revisão mensal ajuda a criar hábitos financeiros saudáveis.</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(() => { const StepIcon = STEPS[step].icon; return <StepIcon className="h-5 w-5 text-primary" />; })()}
            {STEPS[step].title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2">{STEPS[step].description}</p>
        <Progress value={pct} className="h-1.5 bg-secondary [&>div]:gradient-gold" />

        <div className="py-2">{renderStep()}</div>

        <div className="flex justify-between">
          <Button variant="outline" size="sm" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="border-border text-muted-foreground">
            Anterior
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)} className="gradient-gold text-primary-foreground shadow-gold">
              Próximo <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={onClose} className="gradient-gold text-primary-foreground shadow-gold">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Concluir
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
