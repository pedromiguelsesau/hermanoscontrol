import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  Users,
  DollarSign,
  Receipt,
  TrendingUp,
  Share2,
  Target,
  Calendar,
  CheckSquare,
  FileText,
  Globe,
  Image,
  Sparkles,
  History,
  Settings,
  Trash2,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { NavigationTab } from '../../types';

import { HermanosFullLogo } from '../common/HermanosLogos';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  onNavigate?: (tab: NavigationTab) => void;
  lowStockCount?: number;
  trashCount?: number;
  pendingTasksCount?: number;
}

interface MenuItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  isAI?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onNavigate,
  lowStockCount = 0,
  trashCount = 0,
  pendingTasksCount = 0
}) => {
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);

  const handleTabChange = (tab: NavigationTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onNavigate) onNavigate(tab);
    setIsOpenMobile(false);
  };

  const menuSections: { title?: string; items: MenuItem[] }[] = [
    {
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'ai', label: 'IA Estratégica', icon: Sparkles, isAI: true }
      ]
    },
    {
      title: 'OPERAÇÕES & ESTOQUE',
      items: [
        { id: 'products', label: 'Produtos', icon: Package },
        { id: 'stock', label: 'Estoque', icon: Boxes, badge: lowStockCount },
        { id: 'purchases', label: 'Compras', icon: ShoppingBag },
        { id: 'sales', label: 'Vendas', icon: ShoppingCart },
        { id: 'customers', label: 'Clientes', icon: Users }
      ]
    },
    {
      title: 'FINANCEIRO',
      items: [
        { id: 'financial', label: 'Financeiro', icon: DollarSign },
        { id: 'expenses', label: 'Despesas', icon: Receipt },
        { id: 'cashflow', label: 'Fluxo de Caixa', icon: TrendingUp }
      ]
    },
    {
      title: 'MARKETING & METAS',
      items: [
        { id: 'marketing', label: 'Marketing', icon: Share2 },
        { id: 'goals', label: 'Metas', icon: Target },
        { id: 'calendar', label: 'Calendário', icon: Calendar },
        { id: 'tasks', label: 'Tarefas', icon: CheckSquare, badge: pendingTasksCount },
        { id: 'reports', label: 'Relatórios', icon: FileText },
        { id: 'site_admin', label: 'Painel do Site', icon: Globe },
        { id: 'media', label: 'Biblioteca de Mídia', icon: Image }
      ]
    },
    {
      title: 'SISTEMA & AUDITORIA',
      items: [
        { id: 'history', label: 'Histórico', icon: History },
        { id: 'settings', label: 'Configurações', icon: Settings },
        { id: 'trash', label: 'Lixeira', icon: Trash2, badge: trashCount }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-black shadow-2xl md:hidden"
      >
        {isOpenMobile ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-800/80 bg-[#09090b] transition-transform duration-300 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-zinc-800/80 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black p-0.5 border border-amber-500/40 shadow-lg shadow-amber-500/10 overflow-hidden shrink-0">
              <HermanosFullLogo className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-white uppercase">HERMANO’S</h1>
              <span className="text-[10px] font-bold tracking-wider text-amber-400">CONTROL ERP</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {section.title && (
                <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-zinc-800/90 text-white shadow-md shadow-black/40 ring-1 ring-amber-500/40'
                        : item.isAI
                        ? 'text-amber-400 hover:bg-amber-500/10'
                        : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Left active line accent */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-500 shadow-glow" />
                      )}

                      <Icon
                        className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-amber-400'
                            : item.isAI
                            ? 'text-amber-400'
                            : 'text-zinc-400 group-hover:text-white'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.id === 'stock'
                              ? 'bg-amber-500 text-black'
                              : item.id === 'trash'
                              ? 'bg-zinc-800 text-zinc-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Brand Seal */}
        <div className="border-t border-zinc-800/80 p-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-center">
            <p className="text-[11px] font-bold text-white">Hermano’s Outfit © 2026</p>
            <p className="text-[10px] text-zinc-500">Sistema Oficial de Alta Performance</p>
          </div>
        </div>
      </aside>
    </>
  );
};
