import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { Transaction, Category, CATEGORY_LABELS, PAYMENT_METHOD_LABELS, TransactionType, PaymentMethod } from "@/lib/types";
import { classifyWithConfidence } from "@/lib/ai-classifier";
import { toast } from "sonner";

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
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

// ─── Parse a chat command into a transaction ─────────────────────────
function parseChatCommand(text: string): { value: number; type: TransactionType; description: string; category: Category; method: PaymentMethod; date: string; time: string } | null {
  const lower = text.toLowerCase();

  // Extract amount
  const amtMatch = text.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)/i) ||
    text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/) ||
    text.match(/\b(\d+(?:[.,]\d+)?)\b/);
  if (!amtMatch) return null;
  const value = parseFloat(amtMatch[1].replace(/\./g, '').replace(',', '.'));
  if (!value || value <= 0) return null;

  // Detect type
  let type: TransactionType = 'expense';
  if (/\b(recebi|salário|salario|pix\s*recebido|pagamento|entrou|entrada|rendimento|pro\s*labore|freelance)\b/.test(lower)) {
    type = 'income';
  } else if (/\b(paguei|pago|comprei|gastei|compra|assinatura|mensalidade|pix\s*enviado|fatura|conta|débito|debito)\b/.test(lower)) {
    type = 'expense';
  }

  // Detect method
  let method: PaymentMethod = 'unknown';
  if (lower.includes('pix')) method = 'pix';
  else if (lower.includes('ted')) method = 'ted';
  else if (lower.includes('débito') || lower.includes('debito')) method = 'debit';
  else if (lower.includes('crédito') || lower.includes('credito') || lower.includes('cartão') || lower.includes('cartao')) method = 'credit';
  else if (lower.includes('boleto')) method = 'boleto';
  else if (lower.includes('dinheiro')) method = 'cash';

  // Extract date
  const now = new Date();
  let date = now.toISOString().split('T')[0];
  const dm1 = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const dm2 = text.match(/(\d{2})\/(\d{2})/);
  if (dm1) date = `${dm1[3]}-${dm1[2]}-${dm1[1]}`;
  else if (dm2) date = `${now.getFullYear()}-${dm2[2]}-${dm2[1]}`;

  // Extract time
  let time = '';
  const tm = text.match(/(\d{1,2}):(\d{2})/);
  if (tm) time = `${tm[1].padStart(2, '0')}:${tm[2]}`;

  // Clean description: remove amount, date, method keywords
  let description = text
    .replace(/R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?/gi, '')
    .replace(/\d{2}\/\d{2}(?:\/\d{4})?/g, '')
    .replace(/\d{1,2}:\d{2}/g, '')
    .replace(/\b\d+(?:[.,]\d+)?\b/g, '')
    .replace(/\b(?:pix|ted|doc|débito|debito|crédito|credito|cartão|cartao|boleto|dinheiro)\b/gi, '')
    .replace(/\b(?:recebi|paguei|pago|comprei|gastei|entrou|enviado|recebido)\b/gi, '')
    .replace(/\b(?:de|no|na|em|para|com|do|da)\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
  if (description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }
  if (!description) description = type === 'income' ? 'Receita' : 'Despesa';

  const { category } = classifyWithConfidence(text + ' ' + description);

  return { value, type, description, category, method, date, time };
}

function generateResponse(question: string, props: Props): { text: string; transaction?: ReturnType<typeof parseChatCommand> } {
  const q = question.toLowerCase();
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Try to parse as transaction command
  const hasActionWord = /\b(recebi|paguei|pago|comprei|gastei|salário|salario|entrou|assinatura|mensalidade|pix\s*recebido|pix\s*enviado)\b/.test(q);
  if (hasActionWord) {
    const parsed = parseChatCommand(question);
    if (parsed) {
      return { text: '', transaction: parsed };
    }
  }

  // Informational responses
  if (q.includes("gastei") || q.includes("gasto") || q.includes("despesa")) {
    return { text: `📊 Resumo de despesas — Suas saídas neste período totalizam ${fmt(props.totalExpenses)}. O saldo atual considerando entradas e saídas é ${fmt(props.balance)}.` };
  }
  if (q.includes("mais") || q.includes("categoria") || q.includes("onde")) {
    const top = Object.entries(props.expensesByCategory).sort((a, b) => b[1] - a[1]);
    if (top.length === 0) return { text: "Ainda não há despesas registradas. Importe notificações ou registre lançamentos para começar a análise." };
    const topItems = top.slice(0, 3).map(([k, v]) => `${CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS] || k}: ${fmt(v)}`).join(", ");
    return { text: `📊 Análise por categoria — Suas maiores categorias de gasto são: ${topItems}. Acompanhar essas categorias ajuda a identificar oportunidades de ajuste.` };
  }
  if (q.includes("economizar") || q.includes("economia") || q.includes("dica")) {
    const top = Object.entries(props.expensesByCategory).sort((a, b) => b[1] - a[1]);
    if (top.length > 0) {
      return { text: `💡 Sugestão — A categoria ${CATEGORY_LABELS[top[0][0] as keyof typeof CATEGORY_LABELS]} representa sua maior despesa (${fmt(top[0][1])}). Pequenos ajustes em gastos recorrentes costumam gerar economia consistente ao longo do mês.` };
    }
    return { text: "📋 Registre mais transações para que o Persona Contábil possa oferecer análises personalizadas." };
  }
  if (q.includes("saldo") || q.includes("sobra")) {
    return { text: `💰 Posição atual — Saldo: ${fmt(props.balance)}. Entradas no período: ${fmt(props.totalIncome)}. Saídas no período: ${fmt(props.totalExpenses)}.` };
  }
  return { text: "Posso te ajudar com: resumo de despesas, análise por categoria, sugestões de economia e sua posição financeira. Você também pode registrar lançamentos direto aqui — ex: \"recebi salário 1700\" ou \"paguei vivo 45\"." };
}

export default function AiAssistant(props: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou o Persona Contábil, seu assistente de inteligência financeira. Pergunte sobre seus gastos, categorias, projeções — ou registre lançamentos direto pelo chat. 📊\n\nExemplos:\n• \"recebi salário 1700\"\n• \"paguei vivo 45\"\n• \"quanto gastei?\"" },
  ]);
  const [input, setInput] = useState("");

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const { text, transaction } = generateResponse(input, props);

    let assistantContent: string;
    if (transaction) {
      // Create the transaction
      props.onAddTransaction({
        value: transaction.value,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        time: transaction.time || undefined,
        description: transaction.description,
        paymentMethod: PAYMENT_METHOD_LABELS[transaction.method] || transaction.method,
        method: transaction.method,
        recurring: false,
        aiConfidence: 0.85,
      });

      const typeLabel = transaction.type === 'income' ? '📥 Receita' : transaction.type === 'expense' ? '📤 Despesa' : '🔄 Transferência';
      const catLabel = CATEGORY_LABELS[transaction.category] || transaction.category;
      assistantContent = `✅ Lançamento criado:\n\n${typeLabel} · ${catLabel}\n💰 ${fmt(transaction.value)}\n📅 ${new Date(transaction.date + 'T12:00:00').toLocaleDateString('pt-BR')}${transaction.time ? ' ' + transaction.time : ''}\n📝 ${transaction.description}`;
      toast.success("Lançamento registrado pelo assistente");
    } else {
      assistantContent = text;
    }

    setMessages(prev => [...prev, userMsg, { role: "assistant", content: assistantContent }]);
    setInput("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold text-foreground mb-1">Persona Contábil — Assistente</h1>
      <p className="text-sm text-muted-foreground mb-4">Seu assistente contábil pessoal. Pergunte sobre suas finanças ou registre lançamentos.</p>

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
              className={`rounded-xl px-4 py-3 max-w-[80%] text-sm whitespace-pre-line ${
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
          placeholder="Pergunte sobre suas finanças ou registre: &quot;recebi salário 1700&quot;"
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
