import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogIn, UserPlus, Mail, Lock, Chrome } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Autenticação em construção. O Cognit ainda opera em modo local.");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Cadastro em construção. O Cognit ainda opera em modo local.");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Cognit</h1>
          <p className="text-sm text-muted-foreground">Inteligência financeira pessoal</p>
          <Badge variant="outline" className="mt-3 border-primary/30 text-primary text-xs">
            Autenticação em construção
          </Badge>
        </div>

        <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="bg-secondary border border-border w-full">
              <TabsTrigger value="login" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs">
                <LogIn className="h-3.5 w-3.5 mr-1" />Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs">
                <UserPlus className="h-3.5 w-3.5 mr-1" />Cadastrar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="bg-secondary border-border text-foreground pl-10" />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-secondary border-border text-foreground pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-gold text-primary-foreground shadow-gold font-semibold">
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Nome</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" className="bg-secondary border-border text-foreground" />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="bg-secondary border-border text-foreground pl-10" />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className="bg-secondary border-border text-foreground pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-gold text-primary-foreground shadow-gold font-semibold">
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="outline" className="w-full border-border text-muted-foreground" disabled>
              <Chrome className="h-4 w-4 mr-2" />Google (Em breve)
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          O Cognit opera atualmente em modo local. Seus dados são salvos no navegador. A autenticação e sincronização com servidor serão ativadas em breve.
        </p>
      </motion.div>
    </div>
  );
}
