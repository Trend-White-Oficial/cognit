import { LayoutDashboard, PlusCircle, FileText, Target, BotMessageSquare, Landmark, Receipt, BarChart3, Bell, Shield, TrendingUp, Scale, FileBarChart, Link2, Wallet, BookOpen, Settings, CalendarCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Registrar", url: "/registrar", icon: PlusCircle },
  { title: "Lançamentos", url: "/lancamentos", icon: Receipt },
  { title: "Planejamento", url: "/planejamento", icon: FileText },
];

const contabilItems = [
  { title: "Balancete", url: "/balancete", icon: BarChart3 },
  { title: "Balanço Patrimonial", url: "/balanco", icon: Scale },
  { title: "DRE", url: "/dre", icon: FileBarChart },
  { title: "Config. Contábeis", url: "/configuracoes-contabeis", icon: Settings },
];

const toolItems = [
  { title: "Dívidas", url: "/dividas", icon: Landmark },
  { title: "Dívidas CPF", url: "/dividas-cpf", icon: Shield },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Investimentos", url: "/investimentos", icon: Wallet },
  { title: "Conexões", url: "/conexoes", icon: Link2 },
  { title: "Hábitos", url: "/habitos", icon: TrendingUp },
  { title: "Alertas", url: "/alertas", icon: Bell },
  { title: "IR", url: "/ir", icon: Shield },
];

const otherItems = [
  { title: "Assistente IA", url: "/assistente", icon: BotMessageSquare },
  { title: "Conteúdos", url: "/conteudos", icon: BookOpen },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-widest">
        {!collapsed && label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end={item.url === "/"} className="hover:bg-muted/50 transition-colors" activeClassName="bg-primary/10 text-primary font-medium">
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 mb-2">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-primary tracking-tight">
                Cognit
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Inteligência financeira pessoal</p>
            </div>
          )}
          {collapsed && <span className="text-primary font-bold text-xl">C</span>}
        </div>

        {renderGroup("Principal", mainItems)}
        {renderGroup("Contabilidade", contabilItems)}
        {renderGroup("Ferramentas", toolItems)}
        {renderGroup("Outros", otherItems)}
      </SidebarContent>
    </Sidebar>
  );
}
