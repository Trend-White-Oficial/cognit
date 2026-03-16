import { useState } from "react";
import { parseQuickInput } from "@/lib/ai-classifier";
import { CATEGORY_LABELS, Transaction } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
}

export function QuickAdd({ onAdd }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    const parsed = parseQuickInput(input);
    if (!parsed) {
      toast.error("Formato não reconhecido. Tente: 'iFood 45 reais'");
      return;
    }
    onAdd({
      value: parsed.value,
      type: 'expense',
      category: parsed.category,
      date: new Date().toISOString().split('T')[0],
      description: parsed.description,
      paymentMethod: 'Cartão',
      recurring: false,
    });
    toast.success(`Despesa registrada: ${parsed.description} - R$ ${parsed.value} (${CATEGORY_LABELS[parsed.category]})`);
    setInput("");
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder='Registrar lançamento rápido: "iFood 45 reais"'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
      />
      <Button onClick={handleSubmit} className="gradient-gold text-primary-foreground font-semibold shadow-gold">
        <Zap className="h-4 w-4 mr-1" />
        Registrar
      </Button>
    </div>
  );
}
