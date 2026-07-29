import React from 'react';
import { FileText, Download, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { AppData } from '../../types';

interface ReportsViewProps {
  data: AppData;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ data }) => {
  const totalRevenue = data.sales.reduce((s, x) => s + x.totalAmount, 0);
  const totalCost = data.sales.reduce(
    (s, x) => s + x.items.reduce((sum, i) => sum + i.unitCost * i.quantity, 0),
    0
  );
  const grossProfit = totalRevenue - totalCost;
  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Relatórios Gerenciais & DRE</h2>
          <p className="text-xs text-zinc-400">Demonstrativo do Resultado do Exercício e Curva ABC de Vendas.</p>
        </div>
      </div>

      {/* DRE Simplificado */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3">DRE Simplificado — Consolidado</h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-2 border-b border-zinc-800/60 font-semibold text-white">
            <span>(+) Receita Bruta de Vendas</span>
            <span className="font-mono text-emerald-400">R$ {totalRevenue.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-zinc-800/60 text-zinc-400">
            <span>(-) Custo das Mercadorias Vendidas (CMV)</span>
            <span className="font-mono text-rose-400">- R$ {totalCost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-zinc-800/60 font-bold text-white bg-zinc-900/50 px-3 rounded-lg">
            <span>(=) Lucro Bruto Operacional</span>
            <span className="font-mono text-emerald-400">R$ {grossProfit.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-zinc-800/60 text-zinc-400">
            <span>(-) Despesas Operacionais (Embalagens, Mkt, Frete)</span>
            <span className="font-mono text-rose-400">- R$ {totalExpenses.toFixed(2)}</span>
          </div>

          <div className="flex justify-between py-3 font-black text-amber-400 bg-amber-500/10 px-4 rounded-xl border border-amber-500/20 text-sm">
            <span>(=) LUCRO LÍQUIDO DO PERÍODO</span>
            <span className="font-mono">R$ {netProfit.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
