import { useMemo } from "react";
import { Transaction } from "@/lib/types";
import { detectRecurringPatterns } from "@/lib/notification-parser";
import { motion } from "framer-motion";
import { Clock, DollarSign, Users, Calendar, Brain } from "lucide-react";

interface Props {
  transactions: Transaction[];
}

export default function Habits({ transactions }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const habits = useMemo(() => detectRecurringPatterns(
    transactions.map(t => ({ date: t.date, time: t.time, description: t.description, value: t.value, method: t.method }))
  ), [transactions]);

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const maxDay = Math.max(...Object.values(habits.weeklyPattern), 1);

  const insights = useMemo(() => {
    const tips: string[] = [];
    if (habits.commonPixHours.length > 0) {
      tips.push(`⏱️ Padrão identificado — A maioria dos seus PIX enviados ocorre entre ${habits.commonPixHours.map(h => `${h}h`).join(' e ')}. Esse comportamento ajuda a IA a organizar melhor seus lançamentos.`);
    }
    if (habits.avgPixAmount > 0) {
      tips.push(`💰 Valor médio de PIX — Suas transferências PIX têm valor médio de ${fmt(habits.avgPixAmount)}. Acompanhar esse indicador ajuda a identificar variações incomuns.`);
    }
    const busiestDay = Object.entries(habits.weeklyPattern).sort((a, b) => b[1] - a[1])[0];
    if (busiestDay && busiestDay[1] > 0) {
      tips.push(`🔍 Comportamento semanal — Seus gastos apresentam maior frequência às ${busiestDay[0]}s. Esse padrão ajuda a planejar com antecedência.`);
    }
    if (tips.length === 0) tips.push("📋 Registre mais transações para que o Persona Contábil identifique seus padrões financeiros.");
    return tips;
  }, [habits]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Comportamento Financeiro</h1>
      <p className="text-sm text-muted-foreground mb-6">Padrões identificados pela IA para organizar melhor seus lançamentos</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Horários PIX</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {habits.commonPixHours.length > 0 ? habits.commonPixHours.map(h => `${h}h`).join(', ') : '—'}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">PIX Médio</p>
          </div>
          <p className="text-lg font-bold text-foreground">{habits.avgPixAmount > 0 ? fmt(habits.avgPixAmount) : '—'}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Top Destinos</p>
          </div>
          <p className="text-sm font-medium text-foreground">
            {habits.topPayees.length > 0 ? habits.topPayees.slice(0, 2).join(', ') : '—'}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="gradient-card rounded-xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Dia mais ativo</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {Object.entries(habits.weeklyPattern).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
          </p>
        </motion.div>
      </div>

      {/* Weekly pattern bars */}
      <div className="gradient-card rounded-xl p-5 border border-border shadow-card mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Padrão Semanal</h3>
        <div className="flex items-end gap-3 h-32">
          {dayNames.map(day => {
            const count = habits.weeklyPattern[day] || 0;
            const heightPct = maxDay > 0 ? (count / maxDay) * 100 : 0;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{count}</span>
                <div className="w-full rounded-t-md gradient-gold transition-all" style={{ height: `${Math.max(heightPct, 4)}%` }} />
                <span className="text-xs text-muted-foreground">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top payees */}
      {habits.topPayees.length > 0 && (
        <div className="gradient-card rounded-xl p-5 border border-border shadow-card mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Pagadores/Recebedores Frequentes</h3>
          <div className="space-y-2">
            {habits.topPayees.map((p, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-primary font-mono text-xs">#{i + 1}</span>
                <span className="text-foreground">{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="gradient-card rounded-xl p-5 border border-primary/20 shadow-gold">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-primary">Análise do Persona Contábil</h3>
        </div>
        <div className="space-y-2">
          {insights.map((tip, i) => (
            <p key={i} className="text-sm text-foreground leading-relaxed">{tip}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
