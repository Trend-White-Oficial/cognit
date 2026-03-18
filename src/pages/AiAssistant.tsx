import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Transaction, Category, PAYMENT_METHOD_LABELS, TransactionType, PaymentMethod, ChatMessage, Debt, FinancialGoal } from "@/lib/types";
import { useCategoryStore } from "@/lib/category-store";
import { classifyWithConfidence } from "@/lib/ai-classifier";
import { toast } from "sonner";

interface Props {
  transactions: Transaction[];
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  chatMessages: ChatMessage[];
  onAddChatMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  onAddDebt: (d: Omit<Debt, 'id'>) => void;
  onAddGoal: (g: Omit<FinancialGoal, 'id'>) => void;
  onOpenTour: () => void;
  categoryStore: ReturnType<typeof useCategoryStore>;
}

function parseChatCommand(text: string): { value: number; type: TransactionType; description: string; category: Category; method: PaymentMethod; date: string; time: string } | null {
  const lower = text.toLowerCase();
  const amtMatch = text.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)/i) ||
    text.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/) ||
    text.match(/\b(\d+(?:[.,]\d+)?)\b/);
  if (!amtMatch) return null;
  const value = parseFloat(amtMatch[1].replace(/\./g, '').replace(',', '.'));
  if (!value || value <= 0) return null;

  let type: TransactionType = 'expense';
  if (/\b(recebi|salário|salario|pix\s*recebido|pagamento|entrou|entrada|rendimento|pro\s*labore|freelance)\b/.test(lower)) type = 'income';

  let method: PaymentMethod = 'unknown';
  if (lower.includes('pix')) method = 'pix';
  else if (lower.includes('ted')) method = 'ted';
  else if (lower.includes('débito') || lower.includes('debito')) method = 'debit';
  else if (lower.includes('crédito') || lower.includes('credito') || lower.includes('cartão') || lower.includes('cartao')) method = 'credit';
  else if (lower.includes('boleto')) method = 'boleto';
  else if (lower.includes('dinheiro')) method = 'cash';

  const now = new Date();
  let date = now.toISOString().split('T')[0];
  const dm1 = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const dm2 = text.match(/(\d{2})\/(\d{2})/);
  if (dm1) date = `${dm1[3]}-${dm1[2]}-${dm1[1]}`;
  else if (dm2) date = `${now.getFullYear()}-${dm2[2]}-${dm2[1]}`;

  let time = '';
  const tm = text.match(/(\d{1,2}):(\d{2})/);
  if (tm) time = `${tm[1].padStart(2, '0')}:${tm[2]}`;

  let description = text
    .replace(/R\$\s*\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?/gi, '')
    .replace(/\d{2}\/\d{2}(?:\/\d{4})?/g, '')
    .replace(/\d{1,2}:\d{2}/g, '')
    .replace(/\b\d+(?:[.,]\d+)?\b/g, '')
    .replace(/\b(?:pix|ted|doc|débito|debito|crédito|credito|cartão|cartao|boleto|dinheiro)\b/gi, '')
    .replace(/\b(?:recebi|paguei|pago|comprei|gastei|entrou|enviado|recebido)\b/gi, '')
    .replace(/\b(?:de|no|na|em|para|com|do|da|vence|fixa|mensal)\b/gi, '')
    .trim().replace(/\s+/g, ' ');
  if (description.length > 0) description = description.charAt(0).toUpperCase() + description.slice(1);
  if (!description) description = type === 'income' ? 'Receita' : 'Despesa';

  const { category } = classifyWithConfidence(text + ' ' + description);
  return { value, type, description, category, method, date, time };
}

function parseDebtCommand(text: string): { name: string; value: number; date: string } | null {
  const lower = text.toLowerCase();
  if (!lower.includes('dívida') && !lower.includes('divida') && !lower.includes('debt')) return null;
  const amtMatch = text.match(/\b(\d+(?:[.,]\d+)?)\b/);
  if (!amtMatch) return null;
  const value = parseFloat(amtMatch[1].replace(',', '.'));
  const now = new Date();
  let date = now.toISOString().split('T')[0];
  const dm = text.match(/(\d{2})\/(\d{2})/);
  if (dm) date = `${now.getFullYear()}-${dm[2]}-${dm[1]}`;
  const name = text.replace(/registrar\s*d[ií]vida:?\s*/i, '').replace(/\d+(?:[.,]\d+)?/g, '').replace(/vence?\s*/gi, '').replace(/\d{2}\/\d{2}/g, '').trim() || 'Dívida';
  return { name, value, date };
}

function parseGoalCommand(text: string): { title: string; target: number; deadline?: string } | null {
  const lower = text.toLowerCase();
  if (!lower.includes('meta')) return null;
  const amtMatch = text.match(/\b(\d+(?:[.,]\d+)?)\b/);
  if (!amtMatch) return null;
  const target = parseFloat(amtMatch[1].replace(',', '.'));
  const deadlineMatch = text.match(/até\s+(\d{2}\/\d{4})/i);
  let deadline: string | undefined;
  if (deadlineMatch) { const [m, y] = deadlineMatch[1].split('/'); deadline = `${y}-${m}-01`; }
  const title = text.replace(/adicionar\s*meta:?\s*/i, '').replace(/\d+(?:[.,]\d+)?/g, '').replace(/até\s+\d{2}\/\d{4}/gi, '').trim() || 'Meta financeira';
  return { title, target, deadline };
}

export default function AiAssistant(props: Props) {
  const location = useLocation();
  const prefill = (location.state as any)?.prefill || '';
  const [input, setInput] = useState(prefill);
  const [awaitingType, setAwaitingType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [props.chatMessages]);

  const send = (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim()) return;
    props.onAddChatMessage({ role: 'user', content: text });

    if (awaitingType) {
      const lower = text.toLowerCase();
      const isIncome = lower.includes('entrada') || lower.includes('receita');
      const type = isIncome ? 'income' : 'expense';
      const parsed = parseChatCommand(awaitingType);
      if (parsed) {
        parsed.type = type;
        props.onAddTransaction({
          value: parsed.value, type: parsed.type, category: parsed.category, date: parsed.date,
          time: parsed.time || undefined, description: parsed.description,
          paymentMethod: PAYMENT_METHOD_LABELS[parsed.method] || parsed.method,
          method: parsed.method, recurring: false, aiConfidence: 0.85,
        });
        const catLabel = props.categoryStore.getCategoryLabel(parsed.category);
        const label = type === 'income' ? '📥 Receita' : '📤 Despesa';
        props.onAddChatMessage({ role: 'assistant', content: `✅ Lançamento criado:\n\n${label} · ${catLabel}\n💰 ${fmt(parsed.value)}\n📅 ${parsed.date}\n📝 ${parsed.description}` });
        toast.success("Lançamento registrado");
      }
      setAwaitingType(null);
      setInput("");
      return;
    }

    const q = text.toLowerCase();

    const debt = parseDebtCommand(text);
    if (debt && debt.value > 0) {
      props.onAddDebt({ name: debt.name, totalValue: debt.value, date: debt.date, status: 'ativa', source: 'manual' });
      props.onAddChatMessage({ role: 'assistant', content: `✅ Dívida registrada:\n\n📋 ${debt.name}\n💰 ${fmt(debt.value)}\n📅 ${new Date(debt.date + 'T12:00:00').toLocaleDateString('pt-BR')}` });
      toast.success("Dívida registrada");
      setInput("");
      return;
    }

    const goal = parseGoalCommand(text);
    if (goal && goal.target > 0) {
      props.onAddGoal({ title: goal.title, targetAmount: goal.target, currentAmount: 0, icon: '🎯', status: 'active', deadline: goal.deadline });
      props.onAddChatMessage({ role: 'assistant', content: `✅ Meta criada:\n\n🎯 ${goal.title}\n💰 Valor-alvo: ${fmt(goal.target)}${goal.deadline ? '\n📅 Prazo: ' + new Date(goal.deadline + 'T12:00:00').toLocaleDateString('pt-BR') : ''}` });
      toast.success("Meta criada");
      setInput("");
      return;
    }

    const hasActionWord = /\b(recebi|paguei|pago|comprei|gastei|salário|salario|entrou|assinatura|mensalidade|pix\s*recebido|pix\s*enviado)\b/.test(q);
    if (hasActionWord) {
      const parsed = parseChatCommand(text);
      if (parsed) {
        const isIncome = /\b(recebi|salário|salario|pix\s*recebido|entrou|entrada|rendimento)\b/.test(q);
        const isExpense = /\b(paguei|pago|comprei|gastei|assinatura|mensalidade|pix\s*enviado|fatura|conta)\b/.test(q);
        if (!isIncome && !isExpense) {
          setAwaitingType(text);
          props.onAddChatMessage({ role: 'assistant', content: 'Isso é **Entrada** ou **Saída**?\n\nResponda "entrada" ou "saída".' });
          setInput("");
          return;
        }

        props.onAddTransaction({
          value: parsed.value, type: parsed.type, category: parsed.category, date: parsed.date,
          time: parsed.time || undefined, description: parsed.description,
          paymentMethod: PAYMENT_METHOD_LABELS[parsed.method] || parsed.method,
          method: parsed.method, recurring: /\b(fixa|mensal|todo\s*mês|assinatura)\b/.test(q),
          aiConfidence: 0.85,
        });
        const catLabel = props.categoryStore.getCategoryLabel(parsed.category);
        const typeLabel = parsed.type === 'income' ? '📥 Receita' : '📤 Despesa';
        props.onAddChatMessage({ role: 'assistant', content: `✅ Lançamento criado:\n\n${typeLabel} · ${catLabel}\n💰 ${fmt(parsed.value)}\n📅 ${parsed.date}${parsed.time ? ' ' + parsed.time : ''}\n📝 ${parsed.description}` });
        toast.success("Lançamento registrado");
        setInput("");
        return;
      }
    }

    let response: string;
    if (q.includes("gastei") || q.includes("gasto") || q.includes("despesa")) {
      response = `📊 Suas saídas totalizam ${fmt(props.totalExpenses)}. Saldo: ${fmt(props.balance)}.`;
    } else if (q.includes("mais") || q.includes("categoria") || q.includes("onde")) {
      const top = Object.entries(props.expensesByCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const items = top.map(([k, v]) => `${props.categoryStore.getCategoryLabel(k)}: ${fmt(v)}`).join(", ");
      response = top.length ? `📊 Maiores categorias: ${items}` : "Nenhuma despesa registrada ainda.";
    } else if (q.includes("saldo") || q.includes("sobra")) {
      response = `💰 Saldo: ${fmt(props.balance)}. Entradas: ${fmt(props.totalIncome)}. Saídas: ${fmt(props.totalExpenses)}.`;
    } else if (q.includes("cpf") || q.includes("serasa")) {
      response = "Para consultar dívidas por CPF (simulado), acesse a tela Dívidas CPF. A consulta real depende de integração com serviços oficiais (em construção). Lá você dará consentimento LGPD e verá resultados simulados.";
    } else {
      response = "Posso ajudar com:\n• Registrar lançamentos: \"recebi salário 1700\" ou \"paguei vivo 45\"\n• Criar dívidas: \"registrar dívida: banco inter 760 vence 10/04\"\n• Criar metas: \"adicionar meta: reserva 3000 até 12/2025\"\n• Consultar saldo, gastos por categoria, sugestões";
    }
    props.onAddChatMessage({ role: 'assistant', content: response });
    setInput("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cognit — Assistente</h1>
          <p className="text-sm text-muted-foreground">Chat único para finanças. Registre, consulte e organize.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={props.onOpenTour} className="text-muted-foreground text-xs">
          <HelpCircle className="h-3.5 w-3.5 mr-1" />Tour
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {props.chatMessages.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="gradient-gold rounded-full p-2 h-8 w-8 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`rounded-xl px-4 py-3 max-w-[80%] text-sm whitespace-pre-line ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
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
          placeholder="Pergunte ou registre: &quot;recebi salário 1700&quot;"
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground" />
        <Button onClick={() => send()} className="gradient-gold text-primary-foreground shadow-gold">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
