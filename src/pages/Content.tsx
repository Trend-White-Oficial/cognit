import { ExternalLink, Facebook, Instagram, MessageCircle, BookOpen, Users, Globe, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sections = [
  { title: 'Blog', icon: BookOpen, description: 'Artigos sobre finanças pessoais, contabilidade e investimentos.', status: 'Em construção' },
  { title: 'Fórum', icon: Users, description: 'Comunidade para troca de experiências e dúvidas financeiras.', status: 'Em construção' },
  { title: 'Site', icon: Globe, description: 'Página institucional do Persona Contábil.', status: 'Em construção' },
];

const socialLinks = [
  { name: 'Facebook', icon: Facebook, url: '#', color: '#1877F2' },
  { name: 'Instagram', icon: Instagram, url: '#', color: '#E4405F' },
  { name: 'WhatsApp', icon: MessageCircle, url: '#', color: '#25D366' },
];

export default function Content() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">Conteúdos</h1>
      <p className="text-sm text-muted-foreground mb-6">Acompanhe nossos canais e conteúdos</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {sections.map(s => (
          <div key={s.title} className="gradient-card rounded-xl p-5 border border-border shadow-card">
            <s.icon className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{s.description}</p>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">{s.status}</Badge>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Share2 className="h-5 w-5 text-primary" />Redes Sociais
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {socialLinks.map(s => (
          <a key={s.name} href={s.url} className="gradient-card rounded-xl p-5 border border-border shadow-card flex items-center gap-3 hover:border-primary/30 transition-colors">
            <div className="rounded-full p-2" style={{ backgroundColor: s.color + '20' }}>
              <s.icon className="h-5 w-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="font-semibold text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground">Em breve</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
          </a>
        ))}
      </div>
    </div>
  );
}
