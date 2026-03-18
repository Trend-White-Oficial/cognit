import { useState, useMemo } from "react";
import { InvestmentPosition, InvestmentTransaction, ASSET_CLASS_LABELS, ASSET_CLASS_COLORS, AssetClass } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, PieChart, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  positions: InvestmentPosition[];
  investmentTransactions: InvestmentTransaction[];
  onAddPosition?: (pos: Omit<InvestmentPosition, 'id'>) => void;
}

export default function Investments({ positions, investmentTransactions, onAddPosition }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    ticker: '', assetClass: 'acao' as AssetClass, quantity: 0, averagePrice: 0, currentValue: 0, institutionId: 'manual',
  });

  const totalInvested = useMemo(() => positions.reduce((s, p) => s + p.quantity * p.averagePrice, 0), [positions]);
  const totalCurrent = useMemo(() => positions.reduce((s, p) => s + p.currentValue, 0), [positions]);
  const totalReturn = totalCurrent - totalInvested;

  const byClass = useMemo(() => {
    const map: Record<string, number> = {};
    positions.forEach(p => { map[p.assetClass] = (map[p.assetClass] || 0) + p.currentValue; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [positions]);

  const handleAdd = () => {
    if (!form.ticker || form.quantity <= 0 || form.averagePrice <= 0) {
      toast.error("Preencha ticker, quantidade e preço médio");
      return;
    }
    if (onAddPosition) {
      onAddPosition({
        institutionId: form.institutionId, ticker: form.ticker.toUpperCase(), assetClass: form.assetClass,
        quantity: form.quantity, averagePrice: form.averagePrice,
        currentValue: form.currentValue || form.quantity * form.averagePrice,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Posição adicionada");
      setAddOpen(false);
      setForm({ ticker: '', assetClass: 'acao', quantity: 0, averagePrice: 0, currentValue: 0, institutionId: 'manual' });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
        <Button size="sm" onClick={() => setAddOpen(true)} className="gradient-gold text-primary-foreground shadow-gold">
          <Plus className="h-4 w-4 mr-1" /> Cadastrar
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Gerencie seus investimentos. Cadastre manualmente ou simule via Conexões.</p>

      <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-secondary/50 border border-border">
        <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">B3 / Bovespa — Integração em construção. Cadastre posições manualmente ou simule via Conexões.</p>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma posição registrada.</p>
          <p className="text-xs text-muted-foreground mt-1">Clique em "Cadastrar" ou simule dados em Conexões.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-xs text-muted-foreground">Patrimônio Investido</p>
              <p className="text-xl font-bold text-primary">{fmt(totalCurrent)}</p>
            </div>
            <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-xs text-muted-foreground">Custo Total</p>
              <p className="text-xl font-bold text-foreground">{fmt(totalInvested)}</p>
            </div>
            <div className="gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-xs text-muted-foreground">Retorno</p>
              <p className={`text-xl font-bold ${totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(totalReturn)}</p>
            </div>
          </div>

          <div className="gradient-card rounded-xl p-5 border border-border shadow-card mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />Alocação por Classe
            </h3>
            <div className="flex flex-wrap gap-3">
              {byClass.map(([cls, val]) => {
                const pct = totalCurrent > 0 ? ((val / totalCurrent) * 100).toFixed(1) : '0';
                return (
                  <div key={cls} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_CLASS_COLORS[cls as AssetClass] }} />
                    <span className="text-xs text-foreground">{ASSET_CLASS_LABELS[cls as AssetClass]}</span>
                    <span className="text-xs font-mono text-muted-foreground">{pct}%</span>
                    <span className="text-xs font-mono text-foreground">{fmt(val)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="gradient-card rounded-xl border border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Ativo</TableHead>
                  <TableHead className="text-muted-foreground">Classe</TableHead>
                  <TableHead className="text-right text-muted-foreground">Qtd</TableHead>
                  <TableHead className="text-right text-muted-foreground">PM</TableHead>
                  <TableHead className="text-right text-muted-foreground">Valor Atual</TableHead>
                  <TableHead className="text-right text-muted-foreground">Retorno</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map(p => {
                  const cost = p.quantity * p.averagePrice;
                  const ret = p.currentValue - cost;
                  return (
                    <TableRow key={p.id} className="border-border">
                      <TableCell className="text-foreground font-medium">{p.ticker}</TableCell>
                      <TableCell><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: ASSET_CLASS_COLORS[p.assetClass] + '30', color: ASSET_CLASS_COLORS[p.assetClass] }}>{ASSET_CLASS_LABELS[p.assetClass]}</span></TableCell>
                      <TableCell className="text-right font-mono text-foreground">{p.quantity}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">{fmt(p.averagePrice)}</TableCell>
                      <TableCell className="text-right font-mono text-foreground">{fmt(p.currentValue)}</TableCell>
                      <TableCell className={`text-right font-mono ${ret >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(ret)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </motion.div>
        </>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle>Cadastrar Investimento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label className="text-muted-foreground text-xs">Ticker / Nome</Label>
              <Input value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} className="bg-secondary border-border" placeholder="Ex: PETR4, Tesouro IPCA+" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Classe</Label>
              <Select value={form.assetClass} onValueChange={v => setForm(f => ({ ...f, assetClass: v as AssetClass }))}>
                <SelectTrigger className="bg-secondary border-border text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_CLASS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Quantidade</Label>
                <Input type="number" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Preço Médio (R$)</Label>
                <Input type="number" step="0.01" value={form.averagePrice || ''} onChange={e => setForm(f => ({ ...f, averagePrice: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Valor Atual (R$) — opcional</Label>
              <Input type="number" step="0.01" value={form.currentValue || ''} onChange={e => setForm(f => ({ ...f, currentValue: parseFloat(e.target.value) || 0 }))} className="bg-secondary border-border" placeholder="Se vazio, usa Qtd × PM" />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={handleAdd} className="gradient-gold text-primary-foreground shadow-gold">Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
