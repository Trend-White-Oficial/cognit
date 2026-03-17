import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DocumentType = "cpf" | "cnpj";
type Language = "pt-BR" | "en-US" | "es";
type Currency = "BRL" | "USD";

type UserSettingsState = {
  profile: {
    name: string;
    email: string;
    phone: string;
    avatarDataUrl?: string;
  };
  document: {
    type: DocumentType;
  };
  preferences: {
    sounds: boolean;
    notifications: boolean;
    theme: "coming_soon";
  };
  locale: {
    language: Language;
    currency: Currency;
  };
};

const STORAGE_KEY = "cognit_user_settings_v1";

const DEFAULT_STATE: UserSettingsState = {
  profile: {
    name: "",
    email: "",
    phone: "",
  },
  document: {
    type: "cpf",
  },
  preferences: {
    sounds: true,
    notifications: true,
    theme: "coming_soon",
  },
  locale: {
    language: "pt-BR",
    currency: "BRL",
  },
};

function loadState(): UserSettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<UserSettingsState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
      document: { ...DEFAULT_STATE.document, ...(parsed.document || {}) },
      preferences: {
        ...DEFAULT_STATE.preferences,
        ...(parsed.preferences || {}),
      },
      locale: { ...DEFAULT_STATE.locale, ...(parsed.locale || {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: UserSettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

export default function UserSettings() {
  const [state, setState] = useState<UserSettingsState>(() => loadState());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isCnpjComingSoon = true;
  const canSave = useMemo(() => {
    if (!state.profile.email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.profile.email);
  }, [state.profile.email]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const onPickAvatar = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Envie um arquivo de imagem");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 1,5MB)");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setState((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatarDataUrl: dataUrl },
      }));
      toast.success("Foto atualizada");
    } catch {
      toast.error("Não foi possível carregar a imagem");
    }
  };

  const onSave = () => {
    if (!canSave) {
      toast.error("E-mail inválido");
      return;
    }
    saveState(state);
    toast.success("Configurações salvas");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Preferências do Cognit (persistência local por enquanto).
        </p>
      </div>

      {/* Perfil */}
      <section className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-border">
              <AvatarImage src={state.profile.avatarDataUrl} alt={state.profile.name || "Avatar"} />
              <AvatarFallback className="bg-secondary text-foreground">
                {initials(state.profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-base font-semibold text-foreground">Perfil</h2>
              <p className="text-xs text-muted-foreground">
                Dados básicos do usuário (sem autenticação ainda).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              ref={(el) => (fileInputRef.current = el)}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickAvatar(e.target.files?.[0])}
            />
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload foto
            </Button>
            {state.profile.avatarDataUrl && (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, avatarDataUrl: undefined },
                  }))
                }
              >
                Remover
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Nome</Label>
            <Input
              value={state.profile.name}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, name: e.target.value },
                }))
              }
              placeholder="Seu nome"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Email</Label>
            <Input
              value={state.profile.email}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, email: e.target.value },
                }))
              }
              placeholder="seu@email.com"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
            {!canSave && (
              <p className="text-xs text-destructive">E-mail inválido</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Telefone</Label>
            <Input
              value={state.profile.phone}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  profile: { ...prev.profile, phone: e.target.value },
                }))
              }
              placeholder="(11) 99999-9999"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center justify-end mt-6">
          <Button
            type="button"
            className="gradient-gold text-primary-foreground shadow-gold"
            onClick={onSave}
            disabled={!canSave}
          >
            Salvar alterações
          </Button>
        </div>
      </section>

      {/* Documento */}
      <section className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h2 className="text-base font-semibold text-foreground">Documento</h2>
        <p className="text-xs text-muted-foreground mb-4">
          CPF ativo. CNPJ aparece, mas está em construção.
        </p>
        <div className="max-w-sm space-y-2">
          <Label className="text-muted-foreground text-xs">Tipo</Label>
          <Select
            value={state.document.type}
            onValueChange={(v) =>
              setState((prev) => ({
                ...prev,
                document: { ...prev.document, type: v as DocumentType },
              }))
            }
          >
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cnpj" disabled={isCnpjComingSoon}>
                CNPJ (Em construção)
              </SelectItem>
            </SelectContent>
          </Select>
          {state.document.type === "cnpj" && (
            <p className="text-xs text-muted-foreground">
              CNPJ ficará disponível em breve.
            </p>
          )}
        </div>
      </section>

      {/* Preferências */}
      <section className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h2 className="text-base font-semibold text-foreground">Preferências</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Ajustes de experiência (tema ainda não implementado).
        </p>

        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Sons</p>
              <p className="text-xs text-muted-foreground">Feedback sonoro em ações do app.</p>
            </div>
            <Switch
              checked={state.preferences.sounds}
              onCheckedChange={(checked) =>
                setState((prev) => ({
                  ...prev,
                  preferences: { ...prev.preferences, sounds: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Notificações</p>
              <p className="text-xs text-muted-foreground">Alertas e avisos dentro do app.</p>
            </div>
            <Switch
              checked={state.preferences.notifications}
              onCheckedChange={(checked) =>
                setState((prev) => ({
                  ...prev,
                  preferences: { ...prev.preferences, notifications: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4 opacity-70">
            <div>
              <p className="text-sm font-medium text-foreground">Tema</p>
              <p className="text-xs text-muted-foreground">Em construção.</p>
            </div>
            <Button type="button" variant="outline" disabled>
              Em construção
            </Button>
          </div>
        </div>
      </section>

      {/* Idioma e Moeda */}
      <section className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h2 className="text-base font-semibold text-foreground">Idioma e Moeda</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Persistência pronta para i18n e conversão futura (sem alterar exibição agora).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Idioma</Label>
            <Select
              value={state.locale.language}
              onValueChange={(v) =>
                setState((prev) => ({
                  ...prev,
                  locale: { ...prev.locale, language: v as Language },
                }))
              }
            >
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">PT-BR (padrão)</SelectItem>
                <SelectItem value="en-US">EN-US</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Moeda</Label>
            <Select
              value={state.locale.currency}
              onValueChange={(v) =>
                setState((prev) => ({
                  ...prev,
                  locale: { ...prev.locale, currency: v as Currency },
                }))
              }
            >
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">BRL (padrão)</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Valores continuam exibidos em BRL por enquanto.
            </p>
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section className="gradient-card rounded-xl p-6 border border-border shadow-card">
        <h2 className="text-base font-semibold text-foreground">Segurança</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Autenticação e senha serão integradas futuramente.
        </p>

        <div className="flex items-center justify-between gap-4 opacity-80">
          <div>
            <p className="text-sm font-medium text-foreground">Alterar senha</p>
            <p className="text-xs text-muted-foreground">
              Placeholder — disponível quando houver login (Auth).
            </p>
          </div>
          <Button type="button" variant="outline" disabled>
            Em breve
          </Button>
        </div>
      </section>
    </div>
  );
}

