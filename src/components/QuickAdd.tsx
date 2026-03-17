import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseQuickInput, classifyWithConfidence } from "@/lib/ai-classifier";
import { CATEGORY_LABELS, Transaction, TransactionType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
}

export function QuickAdd({ onAdd }: Props) {
  const [input, setInput] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [pendingText, setPendingText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!input.trim()) return;

    // Check confidence for type detection
    const lower = input.toLowerCase();
    const isIncome = /\b(recebi|salário|salario|pix\s*recebido|entrou|entrada|rendimento)\b/.test(lower);
    const isExpense = /\b(paguei|pago|comprei|gastei|assinatura|mensalidade|conta|fatura)\b/.test(lower);

    let type: TransactionType = 'expense';
    let confidence = 0.5;

    if (isIncome && !isExpense) { type = 'income'; confidence = 0.85; }
    else if (isExpense && !isIncome) { type = 'expense'; confidence = 0.85; }
    else if (isIncome && isExpense) { confidence = 0.4; }

    // Also check category confidence
    const { confidence: catConfidence } = classifyWithConfidence(input);
    const totalConfidence = (confidence + catConfidence) / 2;

    if (totalConfidence < 0.6) {
      setPendingText(input);
      setShowFallback(true);
      return;
    }

    const parsed = parseQuickInput(input);
    if (!parsed) {
      toast.error("Formato não reconhecido. Tente: 'iFood 45 reais'");
      return;
    }

    onAdd({
      value: parsed.value,
      type,
      category: parsed.category,
      date: new Date().toISOString().split('T')[0],
      description: parsed.description,
      paymentMethod: type === 'income' ? 'Transferência' : 'Cartão',
      recurring: false,
    });
    toast.success(`${type === 'income' ? 'Receita' : 'Despesa'} registrada: ${parsed.description} - R$ ${parsed.value} (${CATEGORY_LABELS[parsed.category]})`);
    setInput("");
    setShowFallback(false);
  };

  const goToChat = () => {
    navigate('/assistente', { state: { prefill: pendingText } });
    setShowFallback(false);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder='Lançamento rápido: "iFood 45 reais" ou "recebi salário 1700"'
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowFallback(false); }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={handleSubmit} className="gradient-gold text-primary-foreground font-semibold shadow-gold">
          <Zap className="h-4 w-4 mr-1" />
          Registrar
        </Button>
      </div>
      {showFallback && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground flex-1">
            Não entendi com segurança. Quer concluir no Assistente?
          </p>
          <Button size="sm" variant="outline" onClick={goToChat} className="border-primary/30 text-primary text-xs">
            <MessageCircle className="h-3 w-3 mr-1" />Ir para o chat
          </Button>
        </div>
      )}
    </div>
  );
}
