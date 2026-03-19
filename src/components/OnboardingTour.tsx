import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BotMessageSquare, Receipt, Scale, ChevronRight, ChevronLeft, X, PlusCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps = [
  { icon: LayoutDashboard, title: 'Dashboard', description: 'Visão geral das suas finanças: saldo, entradas, saídas e insights inteligentes. Registre lançamentos rápidos diretamente aqui.' },
  { icon: PlusCircle, title: 'Registrar', description: 'Registre manualmente ou importe notificações bancárias. O Cognit analisa o conteúdo e organiza automaticamente valor, data, método e categoria.' },
  { icon: BotMessageSquare, title: 'Assistente IA', description: 'Chat único para tudo: registrar entradas/saídas, consultar saldo, criar metas e dívidas. Fale naturalmente em português.' },
  { icon: Receipt, title: 'Lançamentos', description: 'Visualize, edite, duplique ou exclua qualquer transação. Filtros por mês, categoria, tipo e método de pagamento.' },
  { icon: Scale, title: 'Balanço / DRE', description: 'Relatórios contábeis profissionais: Balanço Patrimonial (Ativo/Passivo) e DRE (Receita → Resultado). Exportação CSV disponível.' },
];

export function OnboardingTour({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else { onComplete(); onClose(); setStep(0); }
  };

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="bg-card border-border text-foreground max-w-md p-0 overflow-hidden max-h-[90vh]">
        <div className="relative">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10 text-muted-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>

          <div className="gradient-gold p-8 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="bg-primary-foreground/20 rounded-full p-4">
                <Icon className="h-10 w-10 text-primary-foreground" />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-6">
            <div className="flex gap-1.5 justify-center mb-4">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-bold text-foreground text-center mb-2">{current.title}</h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">{current.description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <Button variant="ghost" size="sm" onClick={handlePrev} disabled={step === 0} className="text-muted-foreground">
                <ChevronLeft className="h-4 w-4 mr-1" />Anterior
              </Button>
              <span className="text-xs text-muted-foreground">{step + 1} / {steps.length}</span>
              <Button size="sm" onClick={handleNext} className="gradient-gold text-primary-foreground shadow-gold">
                {step === steps.length - 1 ? 'Começar!' : 'Próximo'}<ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
