import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { Transaction, CATEGORY_LABELS } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  transactions: Transaction[];
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
}

function generateResponse(question: string, props: Props): string {
  const q = question.toLowerCase();
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (q.includes("gastei") || q.includes("gasto") || q.includes("despesa")) {
    return `📊 Resumo de despesas — Suas saídas neste período totalizam ${fmt(props.totalExpenses)}. O saldo atual considerando entradas e saídas é ${fmt(props.balance)}.`;
  }
  if (q.includes("mais") || q.includes("categoria") || q.includes("onde")) {
    const top = Object.entries(props.expensesByCategory).sort((a, b) => b[1] - a[1]);
    if (top.length === 0) return "Ainda não há despesas registradas. Importe notificações ou registre lançamentos para começar a análise.";
    const topItems = top.slice(0, 3).map(([k, v]) => `${CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS] || k}: ${fmt(v)}`).join(", ");
    return `📊 Análise por categoria — Suas maiores categorias de gasto são: ${topItems}. Acompanhar essas categorias ajuda a identificar oportunidades de ajuste.`;
  }
  if (q.includes("economizar") || q.includes("economia") || q.includes("dica")) {
    const top = Object.entries(props.expensesByCategory).sort((a, b) => b[1] - a[1]);
    if (top.length > 0) {
      return `💡 Sugestão — A categoria ${CATEGORY_LABELS[top[0][0] as keyof typeof CATEGORY_LABELS]} representa sua maior despesa (${fmt(top[0][1])}). Pequenos ajustes em gastos recorrentes costumam gerar economia consistente ao longo do mês.`;
    }
    return "📋 Registre mais transações para que o Persona Contábil possa oferecer análises personalizadas.";
  }
  if (q.includes("saldo") || q.includes("sobra")) {
    return `💰 Posição atual — Saldo: ${fmt(props.balance)}. Entradas no período: ${fmt(props.totalIncome)}. Saídas no período: ${fmt(props.totalExpenses)}. Esses valores são calculados automaticamente a partir dos lançamentos.`;
  }
  return "Posso te ajudar com: resumo de despesas, análise por categoria, sugestões de economia e sua posição financeira. Como posso organizar melhor suas finanças?";
}

export default function AiAssistant(props: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou o Persona Contábil, seu assistente de inteligência financeira. Pergunte sobre seus gastos, categorias, projeções ou orientações — estou aqui para organizar sua vida financeira. 📊" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const response = generateResponse(input, props);
    const assistantMsg: Message = { role: "assistant", content: response };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold text-foreground mb-1">Persona Contábil — Assistente</h1>
      <p className="text-sm text-muted-foreground mb-4">Seu assistente contábil pessoal. Pergunte sobre suas finanças.</p>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
          >
            {m.role === "assistant" && (
              <div className="gradient-gold rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div
              className={`rounded-xl px-4 py-3 max-w-[80%] text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="bg-secondary rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-foreground" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Pergunte sobre suas finanças..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
        />
        <Button onClick={send} className="gradient-gold text-primary-foreground shadow-gold">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
