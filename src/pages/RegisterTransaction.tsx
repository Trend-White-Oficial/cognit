import { useState } from "react";
import { Category, CATEGORY_LABELS, Transaction, TransactionType } from "@/lib/types";
import { classifyTransaction } from "@/lib/ai-classifier";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";

interface Props {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
}

export default function RegisterTransaction({ onAdd }: Props) {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState<TransactionType>("expense");
  const [category, setCategory] = useState<Category>("outros");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Cartão");
  const [recurring, setRecurring] = useState(false);

  const handleDescriptionChange = (v: string) => {
    setDescription(v);
    if (v.length > 2) {
      const detected = classifyTransaction(v);
      if (detected !== "outros") setCategory(detected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value.replace(",", "."));
    if (!numValue || !description) {
      toast.error("Preencha valor e descrição");
      return;
    }
    onAdd({ value: numValue, type, category, date, description, paymentMethod, recurring });
    toast.success("Transação registrada com sucesso!");
    setDescription("");
    setValue("");
    setCategory("outros");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Registrar Transação</h1>
      <p className="text-sm text-muted-foreground mb-6">A IA detecta a categoria automaticamente</p>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="gradient-card rounded-xl p-6 border border-border shadow-card space-y-5"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Descrição</Label>
            <Input
              placeholder="Ex: iFood, Uber, Salário..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Valor (R$)</Label>
            <Input
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Data</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-secondary border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Categoria {category !== "outros" && <span className="text-primary">(IA detectou)</span>}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Forma de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Pix">Pix</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <Switch checked={recurring} onCheckedChange={setRecurring} />
            <Label className="text-foreground text-sm">Recorrente</Label>
          </div>
        </div>
        <Button type="submit" className="w-full gradient-gold text-primary-foreground font-semibold shadow-gold">
          <PlusCircle className="h-4 w-4 mr-2" />
          Registrar
        </Button>
      </motion.form>
    </div>
  );
}
