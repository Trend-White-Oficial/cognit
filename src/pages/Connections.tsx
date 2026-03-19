import { Institution, Connector } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Building2, TrendingUp, Sparkles, Trash2, Info } from "lucide-react";
import { toast } from "sonner";

interface Props {
  institutions: Institution[];
  connectors: Connector[];
  onSimulate: (institutionId: string) => void;
  onClearSimulated: () => void;
}

export default function Connections({ institutions, connectors, onSimulate, onClearSimulated }: Props) {
  const banks = institutions.filter(i => i.type === 'bank');
  const brokers = institutions.filter(i => i.type === 'broker');
  const hasSimulated = connectors.length > 0;

  const getConnector = (id: string) => connectors.find(c => c.institutionId === id);

  const handleSimulate = (id: string) => {
    onSimulate(id);
    toast.success(`Dados simulados gerados para ${institutions.find(i => i.id === id)?.name}`);
  };

  const handleClear = () => {
    onClearSimulated();
    toast.success("Dados simulados removidos");
  };

  const renderCard = (inst: Institution) => {
    const connector = getConnector(inst.id);
    const isConnected = connector?.status === 'simulado' || connector?.status === 'ativo';

    return (
      <motion.div key={inst.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="gradient-gold rounded-full p-1.5">
              {inst.type === 'bank' ? <Building2 className="h-3.5 w-3.5 text-primary-foreground" /> : <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{inst.name}</h3>
              <p className="text-[10px] text-muted-foreground">{inst.type === 'bank' ? 'Banco' : 'Corretora'}</p>
            </div>
          </div>
          {isConnected && (
            <span className="text-[10px] text-muted-foreground italic">simulado</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mb-2">Funcionalidade em construção</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground text-xs h-7" disabled>
            Conectar (Em construção)
          </Button>
          {!isConnected && (
            <Button size="sm" onClick={() => handleSimulate(inst.id)} className="text-xs h-7 bg-secondary text-foreground hover:bg-secondary/80">
              <Sparkles className="h-3 w-3 mr-1" />Simular
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Conexões</h1>
      <p className="text-sm text-muted-foreground mb-4">Conecte bancos e corretoras. Integrações reais requerem convênios oficiais.</p>

      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-secondary/50 border border-border">
        <Info className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">Nenhuma integração bancária real está ativa no momento. Os dados simulados são apenas visuais e não afetam seus relatórios reais.</p>
      </div>

      {hasSimulated && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={handleClear} className="border-border text-muted-foreground text-xs">
            <Trash2 className="h-3 w-3 mr-1" /> Limpar dados simulados
          </Button>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Bancos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{banks.map(renderCard)}</div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Corretoras</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{brokers.map(renderCard)}</div>
      </div>
    </div>
  );
}
