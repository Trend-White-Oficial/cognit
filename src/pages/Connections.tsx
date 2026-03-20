import { Institution, Connector } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Building2, TrendingUp, Sparkles, Trash2, Info, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  institutions: Institution[];
  connectors: Connector[];
  onSimulate: (institutionId: string) => void;
  onClearSimulated: () => void;
}

export default function Connections({ institutions, connectors, onSimulate, onClearSimulated }: Props) {
  const { t } = useI18n();
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="gradient-gold rounded-lg p-1.5">
              {inst.type === 'bank' ? <Building2 className="h-3.5 w-3.5 text-primary-foreground" /> : <TrendingUp className="h-3.5 w-3.5 text-primary-foreground" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{inst.name}</h3>
              <p className="text-[10px] text-muted-foreground">{inst.type === 'bank' ? 'Banco' : 'Corretora'} · {t('feature_building')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connect button (disabled) */}
          <Button variant="outline" size="sm" className="border-border text-muted-foreground text-xs h-7 flex-1" disabled>
            Conectar
          </Button>

          {/* Small square simulate/status button */}
          {isConnected ? (
            <div className="flex items-center gap-1">
              <div className="h-7 w-7 rounded-md bg-success/20 border border-success/30 flex items-center justify-center" title="Simulado ativo">
                <Check className="h-3.5 w-3.5 text-success" />
              </div>
            </div>
          ) : (
            <Button size="icon" variant="outline" onClick={() => handleSimulate(inst.id)} className="h-7 w-7 border-border text-muted-foreground hover:text-primary" title="Simular dados">
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">{t('connections')}</h1>
      <p className="text-sm text-muted-foreground mb-4">Conecte bancos e corretoras. Integrações reais em construção.</p>

      <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-secondary/50 border border-border">
        <Info className="h-4 w-4 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">{t('no_bank_integration')} Dados simulados são apenas visuais e não afetam relatórios reais.</p>
      </div>

      {hasSimulated && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={handleClear} className="border-border text-muted-foreground text-xs">
            <Trash2 className="h-3 w-3 mr-1" /> Limpar simulados
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
