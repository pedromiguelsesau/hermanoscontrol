import React from 'react';
import {
  Search,
  Bell,
  User,
  LogOut,
  RefreshCw,
  Download,
  Upload,
  Clock,
  Sparkles,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { User as UserType, NavigationTab } from '../../types';
import { HermanosIconLogo } from '../common/HermanosLogos';

interface HeaderProps {
  user?: UserType | null;
  activeTab: NavigationTab;
  onLogout?: () => void;
  lowStockCount?: number;
  uncompletedTasksCount?: number;
  onNavigate?: (tab: NavigationTab) => void;
  onOpenBackupModal?: () => void;
  onOpenResetModal?: () => void;
  onOpenGuideModal?: () => void;
  isSyncing?: boolean;
  onSync?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const tabTitles: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral da saúde e performance do negócio' },
  ai: { title: 'Inteligência Artificial', subtitle: 'Análises avançadas e conselhos estratégicos com Gemini AI' },
  products: { title: 'Produtos', subtitle: 'Gestão de catálogo, precificação e variações' },
  stock: { title: 'Estoque', subtitle: 'Controle de movimentações, quantidades e alertas' },
  purchases: { title: 'Compras', subtitle: 'Lançamento de fornecedores, matérias-primas e custos' },
  sales: { title: 'Vendas', subtitle: 'Registro de pedidos, clientes e comissões' },
  customers: { title: 'Clientes', subtitle: 'Base de compradores, histórico e ranking VIP' },
  financial: { title: 'Financeiro', subtitle: 'Contas a pagar, receber, patrimônio e retiradas' },
  expenses: { title: 'Despesas', subtitle: 'Controle de custos operacionais e comprovantes' },
  cashflow: { title: 'Fluxo de Caixa', subtitle: 'Entradas e saídas detalhadas por meio de pagamento' },
  marketing: { title: 'Marketing', subtitle: 'Planejamento do Instagram, feed e campanhas' },
  goals: { title: 'Metas', subtitle: 'Objetivos mensais de faturamento, lucro e vendas' },
  calendar: { title: 'Calendário', subtitle: 'Lançamentos, eventos, reposições e compromissos' },
  tasks: { title: 'Tarefas', subtitle: 'Quadro de afazeres, prioridades e checklists' },
  reports: { title: 'Relatórios', subtitle: 'Exportação de relatórios gerenciais e estatísticas' },
  site_admin: { title: 'Painel do Site', subtitle: 'Gerenciamento do futuro e-commerce sem código' },
  media: { title: 'Biblioteca de Mídia', subtitle: 'Gerenciamento centralizado de fotos, banners e ativos do sistema' },
  history: { title: 'Histórico', subtitle: 'Trilha de auditoria completa de alterações no sistema' },
  settings: { title: 'Configurações', subtitle: 'Ajustes do ERP, backup e lixeira' },
  trash: { title: 'Lixeira', subtitle: 'Itens excluídos temporariamente e restauração' }
};

export const Header: React.FC<HeaderProps> = ({
  user = null,
  activeTab,
  onLogout = () => {},
  lowStockCount = 0,
  uncompletedTasksCount = 0,
  onNavigate = (_tab: NavigationTab) => {},
  onOpenBackupModal = () => {},
  onOpenResetModal = () => {},
  onOpenGuideModal = () => {},
  isSyncing = false,
  onSync = () => {},
  searchQuery = '',
  setSearchQuery = (_query: string) => {}
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  const totalNotifications = lowStockCount + uncompletedTasksCount;
  const currentTabInfo = tabTitles[activeTab] || { title: 'Hermano’s Control', subtitle: 'ERP Oficial' };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-[#0d0d0f]/90 px-4 backdrop-blur-md md:px-8">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-white md:text-xl">
            {currentTabInfo.title}
            {activeTab === 'ai' && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
                <Sparkles className="h-3 w-3" />
                Gemini AI Active
              </span>
            )}
          </h1>
          <p className="hidden text-xs text-zinc-400 md:block">{currentTabInfo.subtitle}</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar produto, código, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 rounded-lg border border-zinc-800 bg-zinc-900/80 py-1.5 pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-500 transition-all focus:w-64 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        {/* Sync Status Button */}
        <button
          onClick={onSync}
          title="Sincronizar dados permanentemente"
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline">Salvo em Nuvem</span>
        </button>

        {/* Step-by-Step Guide Button */}
        <button
          onClick={onOpenGuideModal}
          title="Guia Passo a Passo com Exemplos"
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-400 transition-all hover:bg-amber-500/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Guia da Loja</span>
        </button>

        {/* Quick Reset Button */}
        <button
          onClick={onOpenResetModal}
          title="Zerar Sistema / Iniciar do Zero"
          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Zerar Dados</span>
        </button>

        {/* Backup Modal Trigger */}
        <button
          onClick={onOpenBackupModal}
          title="Backup & Exportação"
          className="hidden rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-amber-400 sm:block"
        >
          <Download className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-amber-400"
          >
            <Bell className="h-4 w-4" />
            {totalNotifications > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black animate-pulse">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-zinc-800 bg-[#121215] p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between border-b border-zinc-800/80 pb-2">
                <h3 className="text-sm font-semibold text-white">Central de Alertas</h3>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                  {totalNotifications} pendências
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {lowStockCount > 0 ? (
                  <div
                    onClick={() => {
                      onNavigate('stock');
                      setShowNotifications(false);
                    }}
                    className="cursor-pointer rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 transition-colors hover:bg-amber-500/10"
                  >
                    <p className="text-xs font-semibold text-amber-400">🚨 Estoque Baixo Detectado</p>
                    <p className="text-[11px] text-zinc-300">
                      {lowStockCount} produto(s) estão com menos da metade da quantidade inicial adquirida.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                    Estoque em níveis saudáveis
                  </div>
                )}

                {uncompletedTasksCount > 0 && (
                  <div
                    onClick={() => {
                      onNavigate('tasks');
                      setShowNotifications(false);
                    }}
                    className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/90 p-2.5 transition-colors hover:border-zinc-700"
                  >
                    <p className="text-xs font-semibold text-white">📌 Tarefas Pendentes</p>
                    <p className="text-[11px] text-zinc-400">
                      Você possui {uncompletedTasksCount} tarefa(s) aguardando conclusão no quadro.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-1.5 pr-3 transition-colors hover:border-amber-500/40"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black p-0.5 ring-1 ring-amber-500/40 shadow-sm overflow-hidden shrink-0">
              {user?.avatar && !user.avatar.includes('unsplash.com') ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <HermanosIconLogo className="h-full w-full object-contain" />
              )}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-none text-white">{user?.name || 'Hermano'}</p>
              <p className="mt-0.5 text-[10px] text-amber-400 font-medium leading-none">@hermanosconceito</p>
            </div>
          </button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 z-50 w-52 rounded-xl border border-zinc-800 bg-[#121215] p-2 shadow-2xl">
              <div className="border-b border-zinc-800 p-2 text-xs">
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-[10px] text-zinc-400">Administrador Oficial</p>
              </div>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setShowProfileMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <Shield className="h-3.5 w-3.5 text-amber-400" />
                Configurações do ERP
              </button>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair do Sistema
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
