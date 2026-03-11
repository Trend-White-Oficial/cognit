import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Category, CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  expensesByCategory: Record<string, number>;
}

export function CategoryChart({ expensesByCategory }: Props) {
  const data = Object.entries(expensesByCategory)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key as Category] || key,
      value,
      color: CATEGORY_COLORS[key as Category] || "#94A3B8",
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

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
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                }
                contentStyle={{
                  backgroundColor: "hsl(0 0% 10%)",
                  border: "1px solid hsl(0 0% 18%)",
                  borderRadius: "8px",
                  color: "hsl(45 10% 90%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {((d.value / total) * 100).toFixed(0)}%
                </span>
                <span className="text-foreground font-medium">
                  {d.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
