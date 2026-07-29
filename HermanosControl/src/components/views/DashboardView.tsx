import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  AlertTriangle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { AppData, NavigationTab } from '../../types';

interface DashboardViewProps {
  data: AppData;
  onNavigate: (tab: NavigationTab) => void;
  onOpenResetModal?: () => void;
  onOpenGuideModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onOpenResetModal,
  onOpenGuideModal
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<'diario' | 'semanal' | 'mensal' | 'anual'>('mensal');

  // Calculated Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const salesToday = data.sales.filter((s) => s.date === todayStr);
  const revenueToday = salesToday.reduce((acc, s) => acc + s.totalAmount, 0);

  const salesMonth = data.sales.filter((s) => s.date.startsWith(currentMonthStr));
  const revenueMonth = salesMonth.reduce((acc, s) => acc + s.totalAmount, 0);
  const itemsSoldMonth = salesMonth.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  const totalCostMonth = salesMonth.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0),
    0
  );
  const grossProfitMonth = revenueMonth - totalCostMonth;

  const expensesMonth = data.expenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((acc, e) => acc + e.amount, 0);

  const netProfitMonth = grossProfitMonth - expensesMonth;

  const avgTicketMonth = salesMonth.length > 0 ? revenueMonth / salesMonth.length : 0;

  // Stock Low Alerts (< 50% initial)
  const lowStockProducts = data.products.filter((p) => p.stock < p.initialStock / 2);
  const lowStockCount = lowStockProducts.length;
  const stagnantProducts = data.products.filter((p) => p.stock >= p.initialStock * 0.85);

  // Top Selling Products
  const productSalesMap: Record<string, { product: any; count: number; totalRev: number }> = {};
  data.sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        const prod = data.products.find((p) => p.id === item.productId);
        productSalesMap[item.productId] = {
          product: prod || { name: item.productName, code: item.code },
          count: 0,
          totalRev: 0
        };
      }
      productSalesMap[item.productId].count += item.quantity;
      productSalesMap[item.productId].totalRev += item.total;
    });
  });

  const topSellers = Object.values(productSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Goals
  const currentGoal = data.goals.find((g) => g.monthYear === currentMonthStr) || {
    targetRevenue: 15000,
    targetProfit: 9500,
    targetSalesCount: 40,
    targetItemsCount: 80
  };

  const revenueProgress = Math.min(100, Math.round((revenueMonth / currentGoal.targetRevenue) * 100));
  const profitProgress = Math.min(100, Math.round((netProfitMonth / currentGoal.targetProfit) * 100));

  // Chart Data Preparation
  const chartDataDiario = [
    { label: '08:00', faturamento: 0, lucro: 0 },
    { label: '10:00', faturamento: 149.9, lucro: 101.9 },
    { label: '12:00', faturamento: 379.7, lucro: 236.7 },
    { label: '14:00', faturamento: 529.6, lucro: 320.5 },
    { label: '16:00', faturamento: 854.5, lucro: 507.4 },
    { label: '18:00', faturamento: revenueToday, lucro: Math.max(0, revenueToday * 0.6) }
  ];

  const chartDataSemanal = [
    { label: 'Seg', faturamento: 890, lucro: 550 },
    { label: 'Ter', faturamento: 1250, lucro: 780 },
    { label: 'Qua', faturamento: 980, lucro: 610 },
    { label: 'Qui', faturamento: 1450, lucro: 920 },
    { label: 'Sex', faturamento: 2100, lucro: 1350 },
    { label: 'Sáb', faturamento: 1850, lucro: 1150 },
    { label: 'Dom', faturamento: 1100, lucro: 680 }
  ];

  const chartDataMensal = [
    { label: 'Semana 1', faturamento: 3400, lucro: 2100 },
    { label: 'Semana 2', faturamento: 4200, lucro: 2650 },
    { label: 'Semana 3', faturamento: 3900, lucro: 2400 },
    { label: 'Semana 4', faturamento: revenueMonth, lucro: Math.max(0, netProfitMonth) }
  ];

  const chartDataAnual = [
    { label: 'Jan', faturamento: 12000, lucro: 7500 },
    { label: 'Fev', faturamento: 14500, lucro: 9100 },
    { label: 'Mar', faturamento: 13800, lucro: 8700 },
    { label: 'Abr', faturamento: 16200, lucro: 10200 },
    { label: 'Mai', faturamento: 18000, lucro: 11500 },
    { label: 'Jun', faturamento: 15500, lucro: 9800 },
    { label: 'Jul', faturamento: revenueMonth, lucro: Math.max(0, netProfitMonth) }
  ];

  const activeChartData =
    chartTimeframe === 'diario'
      ? chartDataDiario
      : chartTimeframe === 'semanal'
      ? chartDataSemanal
      : chartTimeframe === 'mensal'
      ? chartDataMensal
      : chartDataAnual;

  return (
    <div className="space-y-6 pb-12">
      {/* Onboarding Start Fresh Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 px-6 text-xs text-amber-200 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Vai começar a cadastrar as roupas reais da sua loja?</h3>
            <p className="text-zinc-300 text-xs mt-0.5">
              Você pode zerar todas as camisetas e valores de teste a qualquer momento e seguir nosso guia com exemplos em cada passo!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          {onOpenResetModal && (
            <button
              onClick={onOpenResetModal}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500 shadow-md shadow-red-600/20 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Zerar Dados
            </button>
          )}
          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2 font-bold text-amber-300 hover:bg-amber-500/30 text-xs"
            >
              <BookOpen className="h-3.5 w-3.5" /> Ver Guia Passo a Passo
            </button>
          )}
        </div>
      </div>

      {/* Top AI Strategic Teaser Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-zinc-900 via-[#18181b] to-zinc-900 p-6 shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                <Sparkles className="h-3.5 w-3.5" /> IA Hermano’s Intelligence
              </span>
              <span className="text-xs text-zinc-400">• Atualizado em tempo real</span>
            </div>
            <h2 className="text-xl font-black text-white">Saúde Geral da Empresa: Excelente (94%)</h2>
            <p className="text-xs text-zinc-300 max-w-2xl">
              Faturamento no mês está atingindo a meta. Atenção recomendada para reposição de peças de maior giro
              (Camisetas Oversized e Calças Cargo) antes do próximo lançamento do Instagram.
            </p>
          </div>
          <button
            onClick={() => onNavigate('ai')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-amber-400 active:scale-95 shadow-lg shadow-amber-500/20"
          >
            <span>Ver Diagnóstico Completo por IA</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Faturamento Mês */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Faturamento Mês</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white">
            R$ {revenueMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Hoje: R$ {revenueToday.toFixed(2)}</span>
            <span className="font-semibold text-emerald-400 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> +18.4%
            </span>
          </div>
        </div>

        {/* Card 2: Lucro Líquido */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Lucro Líquido Mês</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-amber-400">
            R$ {netProfitMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Bruto: R$ {grossProfitMonth.toFixed(2)}</span>
            <span className="text-zinc-400 font-medium">Margem: ~{revenueMonth > 0 ? ((netProfitMonth / revenueMonth) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>

        {/* Card 3: Ticket Médio & Peças */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Ticket Médio</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white">
            R$ {avgTicketMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Vendas: {salesMonth.length}</span>
            <span className="text-zinc-400">Peças Vendidas: {itemsSoldMonth} un</span>
          </div>
        </div>

        {/* Card 4: Alerta de Estoque Baixo */}
        <div
          onClick={() => onNavigate('stock')}
          className="cursor-pointer rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-lg transition-all hover:bg-amber-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400">Alerta de Reposição</span>
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white">{lowStockCount} Produtos</p>
          <p className="mt-2 text-[11px] text-amber-300 font-medium">
            Peças abaixo de 50% do estoque inicial adquirido.
          </p>
        </div>
      </div>

      {/* Main Charts & Goals Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl lg:col-span-2">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-white">Evolução do Faturamento & Lucro</h3>
              <p className="text-xs text-zinc-400">Histórico de rendimentos operacionais</p>
            </div>
            <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
              {(['diario', 'semanal', 'mensal', 'anual'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`rounded-lg px-3 py-1 font-semibold capitalize transition-all ${
                    chartTimeframe === tf ? 'bg-amber-500 text-black shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="faturamento"
                  name="Faturamento (R$)"
                  stroke="#d4af37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFaturamento)"
                />
                <Area
                  type="monotone"
                  dataKey="lucro"
                  name="Lucro (R$)"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLucro)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals Progress Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Metas do Mês</h3>
              </div>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                Ajustar Metas
              </button>
            </div>

            <div className="space-y-5">
              {/* Revenue Goal */}
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Meta de Faturamento</span>
                  <span className="font-bold text-white">
                    R$ {revenueMonth.toFixed(0)} / R$ {currentGoal.targetRevenue.toFixed(0)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-800 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                    style={{ width: `${revenueProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 text-right">{revenueProgress}% concluído</p>
              </div>

              {/* Profit Goal */}
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Meta de Lucro Líquido</span>
                  <span className="font-bold text-white">
                    R$ {netProfitMonth.toFixed(0)} / R$ {currentGoal.targetProfit.toFixed(0)}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-800 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500"
                    style={{ width: `${profitProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 text-right">{profitProgress}% concluído</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400">
            <p className="font-semibold text-white">💡 Dica do Mês</p>
            <p className="mt-1">
              Falta apenas R$ {(currentGoal.targetRevenue - revenueMonth).toFixed(2)} para bater a meta principal.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Products Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Selling Products List */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Produtos Mais Vendidos</h3>
            <button onClick={() => onNavigate('products')} className="text-xs font-semibold text-amber-400 hover:underline">
              Ver Catálogo
            </button>
          </div>

          <div className="space-y-3">
            {topSellers.length > 0 ? (
              topSellers.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-black text-amber-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{item.product.name}</p>
                      <p className="text-[10px] text-zinc-400">Código: {item.product.code || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">{item.count} un sold</p>
                    <p className="text-[10px] font-semibold text-amber-400">R$ {item.totalRev.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 py-4 text-center">Nenhuma venda registrada ainda.</p>
            )}
          </div>
        </div>

        {/* Latest Sales Activity */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Últimas Vendas</h3>
            <button onClick={() => onNavigate('sales')} className="text-xs font-semibold text-amber-400 hover:underline">
              Ver Histórico
            </button>
          </div>

          <div className="space-y-3">
            {data.sales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{sale.customerName}</p>
                    <p className="text-[10px] text-zinc-400">
                      {sale.id} • {sale.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">+ R$ {sale.totalAmount.toFixed(2)}</p>
                  <p className="text-[10px] text-zinc-500">{sale.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
