import { LayoutDashboard, PlusCircle, FileText, Table2, Target, BotMessageSquare, Landmark, Import, Receipt, BarChart3, Bell, Shield, TrendingUp } from "lucide-react";
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
  { title: "Balancete", url: "/balancete", icon: BarChart3 },
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-widest">
            {!collapsed && "Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs uppercase tracking-widest">
            {!collapsed && "Ferramentas"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50 transition-colors" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
