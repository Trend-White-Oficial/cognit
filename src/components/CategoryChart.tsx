import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

interface Props {
  expensesByCategory: Record<string, number>;
}

// Brighter colors for dark theme contrast
const BRIGHT_COLORS: string[] = [
  '#FBBF24', '#34D399', '#60A5FA', '#F472B6', '#A78BFA',
  '#FB923C', '#22D3EE', '#F87171', '#4ADE80', '#E879F9',
  '#38BDF8', '#FCD34D', '#6EE7B7', '#93C5FD', '#FDA4AF',
];

export function CategoryChart({ expensesByCategory }: Props) {
  const { fmt } = useI18n();
  const data = Object.entries(expensesByCategory)
    .map(([key, value], i) => ({
      name: CATEGORY_LABELS[key as Category] || key,
      value,
      color: CATEGORY_COLORS[key as Category] || BRIGHT_COLORS[i % BRIGHT_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="gradient-card rounded-xl p-5 border border-border shadow-card flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground">Sem despesas registradas neste mês.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="gradient-card rounded-xl p-5 border border-border shadow-card"
    >
      <h3 className="text-sm text-muted-foreground mb-4">Gastos por Categoria</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="hsl(0 0% 7%)"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => fmt(value)}
                contentStyle={{
                  backgroundColor: "hsl(0 0% 12%)",
                  border: "1px solid hsl(0 0% 20%)",
                  borderRadius: "8px",
                  color: "hsl(45 10% 93%)",
                  fontSize: '12px',
                }}
                itemStyle={{ color: "hsl(45 10% 93%)" }}
                labelStyle={{ color: "hsl(45 10% 93%)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 max-h-48 overflow-y-auto">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-foreground truncate">{d.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-muted-foreground text-xs">
                  {((d.value / total) * 100).toFixed(0)}%
                </span>
                <span className="text-foreground font-medium font-mono text-xs">
                  {fmt(d.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
