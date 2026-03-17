import { useMemo } from "react";
import { InvestmentPosition, InvestmentTransaction, ASSET_CLASS_LABELS, ASSET_CLASS_COLORS, AssetClass } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import { TrendingUp, PieChart } from "lucide-react";

interface Props {
  positions: InvestmentPosition[];
  investmentTransactions: InvestmentTransaction[];
}

export default function Investments({ positions, investmentTransactions }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const totalInvested = useMemo(() => positions.reduce((s, p) => s + p.quantity * p.averagePrice, 0), [positions]);
  const totalCurrent = useMemo(() => positions.reduce((s, p) => s + p.currentValue, 0), [positions]);
  const totalReturn = totalCurrent - totalInvested;

  const byClass = useMemo(() => {
    const map: Record<string, number> = {};
    positions.forEach(p => { map[p.assetClass] = (map[p.assetClass] || 0) + p.currentValue; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [positions]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Investimentos</h1>
      <p className="text-sm text-muted-foreground mb-6">Visão geral do seu patrimônio investido (dados simulados)</p>

      {positions.length === 0 ? (
        <div className="text-center py-16">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma posição registrada.</p>
          <p className="text-xs text-muted-foreground mt-1">Conecte uma corretora em /conexões e clique "Simular dados".</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
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

          {/* Allocation */}
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

          {/* Positions table */}
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
    </div>
  );
}
