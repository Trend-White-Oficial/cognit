import { useState } from "react";
import { Alert as AlertType, AlertSeverity, AlertChannel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, PlusCircle, MessageCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Props {
  alerts: AlertType[];
  onAdd: (a: Omit<AlertType, 'id' | 'createdAt'>) => void;
  onMarkDelivered: (id: string) => void;
}

const SEVERITY_CONFIG: Record<AlertSeverity, { color: string; icon: typeof AlertTriangle; badge: string }> = {
  high: { color: "text-destructive", icon: AlertTriangle, badge: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { color: "text-primary", icon: BellRing, badge: "bg-primary/20 text-primary border-primary/30" },
  low: { color: "text-muted-foreground", icon: Info, badge: "bg-secondary text-muted-foreground border-border" },
};

export default function Alerts({ alerts, onAdd, onMarkDelivered }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertSeverity>("medium");
  const [channel, setChannel] = useState<AlertChannel>("inApp");
  const [scheduledFor, setScheduledFor] = useState("");

  const handleAdd = () => {
    if (!title.trim() || !message.trim()) { toast.error("Preencha título e mensagem"); return; }
    onAdd({
      type: 'dueDate',
      title, message, severity, channel,
      scheduledFor: scheduledFor || undefined,
      delivered: false,
    });
    toast.success(channel === 'simulatedWhatsApp' ? "📅 Lembrete criado — Mensagem enviada pelo canal WhatsApp (simulação). Essa funcionalidade será automatizada futuramente." : "📅 Lembrete financeiro criado com sucesso");
    setTitle(""); setMessage(""); setScheduledFor(""); setShowForm(false);
  };

  const pending = alerts.filter(a => !a.delivered);
  const delivered = alerts.filter(a => a.delivered);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lembretes Financeiros</h1>
          <p className="text-sm text-muted-foreground">Acompanhe vencimentos, alertas e notificações importantes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gradient-gold text-primary-foreground shadow-gold">
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Alerta
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="gradient-card rounded-xl p-5 border border-border shadow-card mb-6 overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-muted-foreground text-xs">Título</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Fatura vence amanhã" className="bg-secondary border-border text-foreground" />
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground text-xs">Mensagem</Label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Detalhes do alerta..." className="bg-secondary border-border text-foreground min-h-[60px]" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Severidade</Label>
                <Select value={severity} onValueChange={v => setSeverity(v as AlertSeverity)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Canal</Label>
                <Select value={channel} onValueChange={v => setChannel(v as AlertChannel)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inApp">No App</SelectItem>
                    <SelectItem value="simulatedWhatsApp">WhatsApp (simulado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Agendar para (opcional)</Label>
                <Input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} className="bg-secondary border-border text-foreground" />
              </div>
            </div>
            <Button onClick={handleAdd} className="mt-4 gradient-gold text-primary-foreground shadow-gold">Criar Alerta</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending alerts */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Pendentes ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((a, i) => {
              const cfg = SEVERITY_CONFIG[a.severity];
              const Icon = cfg.icon;
              return (
                <motion.div key={a.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="gradient-card rounded-xl p-4 border border-border shadow-card flex items-start gap-3"
                >
                  <div className={`rounded-full p-2 bg-secondary ${cfg.color}`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm">{a.title}</p>
                      <Badge variant="outline" className={`text-xs ${cfg.badge}`}>{a.severity}</Badge>
                      {a.channel === 'simulatedWhatsApp' && (
                        <Badge variant="outline" className="text-xs border-success/30 text-success">
                          <MessageCircle className="h-3 w-3 mr-1" />WhatsApp
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{a.message}</p>
                    {a.scheduledFor && <p className="text-xs text-muted-foreground mt-1">📅 {new Date(a.scheduledFor).toLocaleString("pt-BR")}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { onMarkDelivered(a.id); toast.info("Alerta marcado como entregue"); }} className="text-muted-foreground text-xs">
                    Marcar entregue
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delivered */}
      {delivered.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Entregues ({delivered.length})</h2>
          <div className="space-y-2">
            {delivered.map(a => {
              const cfg = SEVERITY_CONFIG[a.severity];
              return (
                <div key={a.id} className="gradient-card rounded-xl p-3 border border-border shadow-card flex items-center gap-3 opacity-60">
                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.message}</p>
                  </div>
                  {a.channel === 'simulatedWhatsApp' && (
                    <span className="text-xs text-success">✓ Enviado via WhatsApp (simulado)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
