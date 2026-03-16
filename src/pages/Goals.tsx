import { FinancialGoal } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface Props {
  goals: FinancialGoal[];
}

export default function Goals({ goals }: Props) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Metas Financeiras</h1>
      <p className="text-sm text-muted-foreground mb-6">Acompanhe o progresso das suas metas com clareza e organização</p>

      <div className="space-y-4">
        {goals.map((g, i) => {
          const pct = Math.round((g.currentAmount / g.targetAmount) * 100);
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="gradient-card rounded-xl p-5 border border-border shadow-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{g.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {fmt(g.currentAmount)} de {fmt(g.targetAmount)}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2 bg-secondary [&>div]:gradient-gold" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
