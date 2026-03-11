import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Props {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

export function BalanceCards({ balance, totalIncome, totalExpenses }: Props) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const cards = [
    { label: "Saldo Atual", value: fmt(balance), icon: Wallet, color: "text-primary" },
    { label: "Receitas", value: fmt(totalIncome), icon: TrendingUp, color: "text-success" },
    { label: "Despesas", value: fmt(totalExpenses), icon: TrendingDown, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="gradient-card rounded-xl p-5 border border-border shadow-card"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{c.label}</span>
            <c.icon className={`h-5 w-5 ${c.color}`} />
          </div>
          <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
