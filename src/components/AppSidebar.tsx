import { LayoutDashboard, PlusCircle, Target, BotMessageSquare, Landmark, Receipt, BarChart3, Bell, Shield, TrendingUp, Scale, FileBarChart, Link2, Wallet, BookOpen, Settings, LogIn } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useI18n } from "@/lib/i18n";
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

export function AppSidebar() {
  const { state } = useSidebar();
  const { t } = useI18n();
  const collapsed = state === "collapsed";

  const mainItems = [
    { title: t('dashboard'), url: "/", icon: LayoutDashboard },
    { title: t('register'), url: "/registrar", icon: PlusCircle },
    { title: t('transactions'), url: "/lancamentos", icon: Receipt },
  ];

  const contabilItems = [
    { title: t('trial_balance'), url: "/balancete", icon: BarChart3 },
    { title: t('balance_sheet'), url: "/balanco", icon: Scale },
    { title: t('dre'), url: "/dre", icon: FileBarChart },
    { title: t('accounting_settings'), url: "/configuracoes-contabeis", icon: Settings },
  ];

  const toolItems = [
    { title: t('debts'), url: "/dividas", icon: Landmark },
    { title: t('debts_cpf'), url: "/dividas-cpf", icon: Shield },
    { title: t('goals'), url: "/metas", icon: Target },
    { title: t('investments'), url: "/investimentos", icon: Wallet },
    { title: t('connections'), url: "/conexoes", icon: Link2 },
    { title: t('habits'), url: "/habitos", icon: TrendingUp },
    { title: t('alerts'), url: "/alertas", icon: Bell },
    { title: t('tax'), url: "/ir", icon: Shield },
  ];

  const otherItems = [
    { title: t('assistant'), url: "/assistente", icon: BotMessageSquare },
    { title: t('content'), url: "/conteudos", icon: BookOpen },
    { title: t('settings'), url: "/configuracoes", icon: Settings },
    { title: 'Login', url: "/login", icon: LogIn },
  ];

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
              <h1 className="text-lg font-bold text-primary tracking-tight">Cognit</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">Inteligência financeira pessoal</p>
            </div>
          )}
          {collapsed && <span className="text-primary font-bold text-xl">C</span>}
        </div>

        {renderGroup(t('main'), mainItems)}
        {renderGroup(t('accounting'), contabilItems)}
        {renderGroup(t('tools'), toolItems)}
        {renderGroup(t('others'), otherItems)}
      </SidebarContent>
    </Sidebar>
  );
}
