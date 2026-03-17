import { useParams, Link } from "react-router-dom";
import { Shield, FileText, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const pages: Record<string, { title: string; icon: typeof Shield; content: string }> = {
  privacidade: {
    title: 'Política de Privacidade',
    icon: Shield,
    content: `## Política de Privacidade — Persona Contábil

**Última atualização:** Março de 2026

### 1. Coleta de Dados
Coletamos apenas os dados necessários para o funcionamento do serviço: informações financeiras que você registra voluntariamente, dados de navegação e preferências de uso.

### 2. Uso dos Dados
Seus dados são utilizados exclusivamente para:
- Organizar e exibir suas informações financeiras
- Gerar análises e insights personalizados
- Melhorar a experiência do serviço

### 3. Armazenamento
Os dados são armazenados em servidores seguros com criptografia em trânsito e em repouso. Dados sensíveis como CPF são armazenados apenas como hash irreversível.

### 4. Compartilhamento
**Não compartilhamos seus dados com terceiros** sem sua autorização expressa.

### 5. Seus Direitos
Você tem direito a: acessar, corrigir, excluir seus dados, revogar consentimento e solicitar portabilidade.

### 6. Contato
Para dúvidas sobre privacidade, entre em contato pelo suporte da plataforma.

---
*As informações têm caráter orientativo e não substituem assessoria contábil profissional.*`,
  },
  termos: {
    title: 'Termos de Uso',
    icon: FileText,
    content: `## Termos de Uso — Persona Contábil

**Última atualização:** Março de 2026

### 1. Aceitação
Ao utilizar o Persona Contábil, você concorda com estes termos.

### 2. Serviço
O Persona Contábil é uma ferramenta de organização financeira pessoal com caráter orientativo. **Não substituímos assessoria contábil, financeira ou jurídica profissional.**

### 3. Responsabilidades do Usuário
- Fornecer informações corretas
- Manter suas credenciais seguras
- Não usar o serviço para atividades ilícitas

### 4. Limitações
- Consultas de CPF são simuladas e não acessam bases reais
- Conexões com bancos e corretoras estão em fase de desenvolvimento
- Não nos responsabilizamos por decisões financeiras baseadas exclusivamente nas análises do sistema

### 5. Modificações
Podemos alterar estes termos com aviso prévio de 30 dias.

---
*As informações têm caráter orientativo e não substituem assessoria contábil profissional.*`,
  },
  lgpd: {
    title: 'LGPD — Proteção de Dados',
    icon: Lock,
    content: `## Lei Geral de Proteção de Dados (LGPD) — Persona Contábil

**Última atualização:** Março de 2026

### Base Legal
O tratamento de dados pessoais pelo Persona Contábil segue a Lei nº 13.709/2018 (LGPD), utilizando como bases legais:
- **Consentimento** (Art. 7º, I) — para dados sensíveis como CPF
- **Execução de contrato** (Art. 7º, V) — para dados necessários ao serviço
- **Legítimo interesse** (Art. 7º, IX) — para melhorias do serviço

### Princípios Adotados
- **Finalidade**: dados coletados apenas para fins específicos e informados
- **Necessidade**: limitamos a coleta ao mínimo necessário
- **Transparência**: informamos claramente como seus dados são tratados
- **Segurança**: medidas técnicas e administrativas de proteção

### Dados Sensíveis
- CPF: armazenado apenas como hash irreversível (nunca em texto puro)
- Consentimento explícito exigido para qualquer operação com CPF
- Sem compartilhamento com terceiros sem autorização

### Seus Direitos (Art. 18)
1. Confirmação da existência de tratamento
2. Acesso aos dados
3. Correção de dados incompletos ou desatualizados
4. Anonimização, bloqueio ou eliminação
5. Portabilidade dos dados
6. Informação sobre compartilhamento
7. Revogação do consentimento

### Encarregado de Dados (DPO)
Para exercer seus direitos ou esclarecer dúvidas, entre em contato pelo suporte da plataforma.

---
*Tratamento de dados conforme LGPD, com consentimento explícito para dados sensíveis.*`,
  },
};

export default function Legal() {
  const { page } = useParams<{ page: string }>();
  const data = pages[page || ''];

  if (!data) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Página não encontrada.</p>
        <Button asChild variant="ghost" className="mt-4"><Link to="/">Voltar</Link></Button>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground">
        <Link to="/"><ArrowLeft className="h-3.5 w-3.5 mr-1" />Voltar</Link>
      </Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="gradient-gold rounded-full p-2"><Icon className="h-5 w-5 text-primary-foreground" /></div>
        <h1 className="text-2xl font-bold text-foreground">{data.title}</h1>
      </div>
      <div className="gradient-card rounded-xl p-6 border border-border shadow-card prose prose-sm prose-invert max-w-none [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_strong]:text-foreground">
        {data.content.split('\n').map((line, i) => {
          if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
          if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-3 mb-1">{line.replace('### ', '')}</h3>;
          if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm">{line.replace('- ', '')}</li>;
          if (line.startsWith('---')) return <hr key={i} className="border-border my-4" />;
          if (line.startsWith('*')) return <p key={i} className="text-xs italic">{line.replace(/\*/g, '')}</p>;
          if (line.trim()) return <p key={i} className="text-sm leading-relaxed">{line}</p>;
          return null;
        })}
      </div>
    </div>
  );
}
