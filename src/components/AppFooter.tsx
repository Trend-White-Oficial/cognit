import { Link } from "react-router-dom";
import { Shield, FileText, Lock, HelpCircle } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30 px-6 py-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <span className="text-xs text-primary font-bold">Persona</span>
          <span className="text-xs text-foreground font-bold">Contábil</span>
          <span className="text-xs text-muted-foreground ml-2">© 2026</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/legal/privacidade" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <Shield className="h-3 w-3" />Privacidade
          </Link>
          <Link to="/legal/termos" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <FileText className="h-3 w-3" />Termos
          </Link>
          <Link to="/legal/lgpd" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <Lock className="h-3 w-3" />LGPD
          </Link>
          <Link to="/conteudos" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />Links Úteis
          </Link>
        </div>
        <p className="text-[10px] text-muted-foreground w-full text-center mt-2">
          As informações têm caráter orientativo e não substituem assessoria contábil profissional.
        </p>
      </div>
    </footer>
  );
}
