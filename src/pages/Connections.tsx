import { Institution, Connector } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Building2, TrendingUp, Wifi, WifiOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  institutions: Institution[];
  connectors: Connector[];
  onSimulate: (institutionId: string) => void;
}

export default function Connections({ institutions, connectors, onSimulate }: Props) {
  const banks = institutions.filter(i => i.type === 'bank');
  const brokers = institutions.filter(i => i.type === 'broker');

  const getConnector = (id: string) => connectors.find(c => c.institutionId === id);

  const handleSimulate = (id: string) => {
    onSimulate(id);
    toast.success(`Dados simulados gerados para ${institutions.find(i => i.id === id)?.name}`);
  };

  const renderCard = (inst: Institution) => {
    const connector = getConnector(inst.id);
    const isConnected = connector?.status === 'simulado' || connector?.status === 'ativo';

    return (
      <motion.div key={inst.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="gradient-card rounded-xl p-5 border border-border shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="gradient-gold rounded-full p-2">
              {inst.type === 'bank' ? <Building2 className="h-4 w-4 text-primary-foreground" /> : <TrendingUp className="h-4 w-4 text-primary-foreground" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{inst.name}</h3>
              <p className="text-xs text-muted-foreground">{inst.type === 'bank' ? 'Banco' : 'Corretora'}</p>
            </div>
          </div>
          {isConnected ? (
            <Badge variant="outline" className="bg-success/20 text-success border-success/30 text-xs">
              <Wifi className="h-3 w-3 mr-1" />Simulado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
              <WifiOff className="h-3 w-3 mr-1" />Desconectado
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground text-xs" disabled>
            Conectar (Em construção)
          </Button>
          {!isConnected && (
            <Button size="sm" onClick={() => handleSimulate(inst.id)} className="gradient-gold text-primary-foreground text-xs shadow-gold">
              <Sparkles className="h-3 w-3 mr-1" />Simular dados
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Conexões</h1>
      <p className="text-sm text-muted-foreground mb-6">Conecte bancos e corretoras. Integrações reais requerem convênios oficiais.</p>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Bancos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{banks.map(renderCard)}</div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Corretoras</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{brokers.map(renderCard)}</div>
      </div>
    </div>
  );
}
