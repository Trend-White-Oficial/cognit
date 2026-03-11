import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface Props {
  insight: string;
}

export function InsightCard({ insight }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="gradient-card rounded-xl p-5 border border-primary/20 shadow-gold"
    >
      <div className="flex items-start gap-3">
        <div className="gradient-gold rounded-lg p-2">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-primary mb-1">Insight da IA</h3>
          <p className="text-sm text-foreground leading-relaxed">{insight}</p>
        </div>
      </div>
    </motion.div>
  );
}
