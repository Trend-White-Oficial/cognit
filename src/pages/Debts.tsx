import { useState } from "react";
import { Debt, DebtStatus, DEBT_STATUS_LABELS } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { CreditCard, PlusCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  debts: Debt[];
  onAdd: (d: Omit<Debt, 'id'>) => void;
  onUpdateStatus: (id: string, status: DebtStatus) => void;
}

const STATUS_CONFIG: Record<DebtStatus, { icon: typeof AlertTriangle; color: string; badge: string }> = {
  ativa: { icon: AlertTriangle, color: "text-destructive", badge: "bg-destructive/20 text-destructive border-destructive/30" },
  negociacao: { icon: Clock, color: "text-primary", badge: "bg-primary/20 text-primary border-primary/30" },
  quitada: { icon: CheckCircle2, color: "text-success", badge: "bg-success/20 text-success border-success/30" },
};

export default function Debts({ debts, onAdd, onUpdateStatus }: Props) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [showForm, setShowForm] = useState(false);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const activeDebts = debts.filter(d => d.status !== "quitada");
  const totalActive = activeDebts.reduce((s, d) => s + d.totalValue, 0);
  const paidCount = debts.filter(d => d.status === "quitada").length;
  const paidPct = debts.length > 0 ? Math.round((paidCount / debts.length) * 100) : 0;

  const handleAdd = () => {
    const numValue = parseFloat(value.replace(",", "."));
    if (!name.trim() || !numValue) {
      toast.error("Preencha nome e valor da dívida");
      return;
    }
    onAdd({ name, totalValue: numValue, date: new Date().toISOString().split("T")[0], status: "ativa" });
    toast.success("Dívida registrada");
    setName("");
    setValue("");
    setShowForm(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dívidas</h1>
          <p className="text-sm text-muted-foreground">Controle e quite suas pendências</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-gold text-primary-foreground shadow-gold">
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

      {/* Add form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="gradient-card rounded-xl p-5 border border-border shadow-card mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Nome da Dívida</Label>
              <Input placeholder="Ex: Cartão Inter" value={name} onChange={e => setName(e.target.value)} className="bg-secondary border-border text-foreground" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Valor (R$)</Label>
              <Input placeholder="0,00" value={value} onChange={e => setValue(e.target.value)} className="bg-secondary border-border text-foreground" />
            </div>
          </div>
          <Button onClick={handleAdd} className="mt-4 gradient-gold text-primary-foreground shadow-gold">Adicionar</Button>
        </motion.div>
      )}

      {/* Debt list */}
      <div className="space-y-3">
        {debts.map((d, i) => {
          const cfg = STATUS_CONFIG[d.status];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: d.status === "quitada" ? 0.5 : 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="gradient-card rounded-xl p-4 border border-border shadow-card flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`rounded-full p-2 bg-secondary ${cfg.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${d.status === "quitada" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {d.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.date + 'T12:00:00').toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <p className={`font-mono font-bold text-lg ${d.status === "quitada" ? "line-through text-muted-foreground" : "text-destructive"}`}>
                {fmt(d.totalValue)}
              </p>
              <Select value={d.status} onValueChange={(v) => onUpdateStatus(d.id, v as DebtStatus)}>
                <SelectTrigger className="w-[150px] h-8 bg-secondary border-border text-xs">
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
