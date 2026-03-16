import { LayoutDashboard, PlusCircle, FileText, Table2, Target, BotMessageSquare, Landmark, Import, Receipt, BarChart3, Bell, Shield, TrendingUp, Scale, FileBarChart } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  { title: "Importar", url: "/importar", icon: Import },
  { title: "Registrar", url: "/registrar", icon: PlusCircle },
  { title: "Lançamentos", url: "/lancamentos", icon: Receipt },
  { title: "Planejamento", url: "/planejamento", icon: FileText },
];

const contabilItems = [
  { title: "Balancete", url: "/balancete", icon: BarChart3 },
  { title: "Balanço Patrimonial", url: "/balanco", icon: Scale },
  { title: "DRE", url: "/dre", icon: FileBarChart },
];

const toolItems = [
  { title: "Dívidas", url: "/dividas", icon: Landmark },
  { title: "Metas", url: "/metas", icon: Target },
  { title: "Hábitos", url: "/habitos", icon: TrendingUp },
  { title: "Alertas", url: "/alertas", icon: Bell },
  { title: "IR", url: "/ir", icon: Shield },
  { title: "Assistente IA", url: "/assistente", icon: BotMessageSquare },
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
                Persona<span className="text-foreground"> Contábil</span>
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Inteligência financeira pessoal</p>
            </div>
          )}
          {collapsed && <span className="text-primary font-bold text-xl">P</span>}
        </div>

        {renderGroup("Principal", mainItems)}
        {renderGroup("Contabilidade", contabilItems)}
        {renderGroup("Ferramentas", toolItems)}
      </SidebarContent>
    </Sidebar>
  );
}
