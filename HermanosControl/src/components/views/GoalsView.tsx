import React, { useState } from 'react';
import { Target, Award, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Goal, Sale } from '../../types';

interface GoalsViewProps {
  goals: Goal[];
  sales: Sale[];
  onSaveGoal: (goal: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ goals, sales, onSaveGoal }) => {
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const activeGoal = goals.find((g) => g.monthYear === currentMonthStr) || {
    id: `goal-${currentMonthStr}`,
    monthYear: currentMonthStr,
    targetRevenue: 15000,
    targetProfit: 9500,
    targetSalesCount: 40,
    targetItemsCount: 80
  };

  const salesThisMonth = sales.filter((s) => s.date.startsWith(currentMonthStr));
  const currentRevenue = salesThisMonth.reduce((acc, s) => acc + s.totalAmount, 0);
  const currentProfit = salesThisMonth.reduce((acc, s) => acc + s.profitAmount, 0);
  const currentSalesCount = salesThisMonth.length;
  const currentItemsCount = salesThisMonth.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );

  const [revTarget, setRevTarget] = useState(activeGoal.targetRevenue);
  const [profitTarget, setProfitTarget] = useState(activeGoal.targetProfit);
  const [salesTarget, setSalesTarget] = useState(activeGoal.targetSalesCount);
  const [itemsTarget, setItemsTarget] = useState(activeGoal.targetItemsCount);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGoal({
      id: activeGoal.id,
      monthYear: currentMonthStr,
      targetRevenue: Number(revTarget),
      targetProfit: Number(profitTarget),
      targetSalesCount: Number(salesTarget),
      targetItemsCount: Number(itemsTarget)
    });
  };

  const getPercent = (curr: number, target: number) =>
    target > 0 ? Math.min(100, Math.round((curr / target) * 100)) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Definição & Acompanhamento de Metas ({currentMonthStr})</h2>
        <p className="text-xs text-zinc-400">
          Estipule metas mensais de faturamento, lucro e unidades vendidas.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl">
          <p className="text-xs font-semibold text-zinc-400">Meta de Faturamento</p>
          <p className="mt-2 text-xl font-black text-white">
            R$ {currentRevenue.toFixed(0)} / R$ {activeGoal.targetRevenue.toFixed(0)}
          </p>
          <div className="mt-3 h-2.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${getPercent(currentRevenue, activeGoal.targetRevenue)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-right text-amber-400 font-bold">
            {getPercent(currentRevenue, activeGoal.targetRevenue)}% alcançado
          </p>
        </div>

        {/* Profit */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl">
          <p className="text-xs font-semibold text-zinc-400">Meta de Lucro Líquido</p>
          <p className="mt-2 text-xl font-black text-emerald-400">
            R$ {currentProfit.toFixed(0)} / R$ {activeGoal.targetProfit.toFixed(0)}
          </p>
          <div className="mt-3 h-2.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${getPercent(currentProfit, activeGoal.targetProfit)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-right text-emerald-400 font-bold">
            {getPercent(currentProfit, activeGoal.targetProfit)}% alcançado
          </p>
        </div>

        {/* Sales count */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl">
          <p className="text-xs font-semibold text-zinc-400">Meta de Pedidos</p>
          <p className="mt-2 text-xl font-black text-white">
            {currentSalesCount} / {activeGoal.targetSalesCount} pedidos
          </p>
          <div className="mt-3 h-2.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${getPercent(currentSalesCount, activeGoal.targetSalesCount)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-right text-blue-400 font-bold">
            {getPercent(currentSalesCount, activeGoal.targetSalesCount)}% alcançado
          </p>
        </div>

        {/* Items count */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl">
          <p className="text-xs font-semibold text-zinc-400">Meta de Peças Vendidas</p>
          <p className="mt-2 text-xl font-black text-white">
            {currentItemsCount} / {activeGoal.targetItemsCount} un
          </p>
          <div className="mt-3 h-2.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-purple-500"
              style={{ width: `${getPercent(currentItemsCount, activeGoal.targetItemsCount)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-right text-purple-400 font-bold">
            {getPercent(currentItemsCount, activeGoal.targetItemsCount)}% alcançado
          </p>
        </div>
      </div>

      {/* Adjust Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white">Atualizar Objetivos Comerciais do Mês</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block font-semibold text-zinc-300">Meta Faturamento (R$)</label>
            <input
              type="number"
              value={revTarget}
              onChange={(e) => setRevTarget(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-zinc-300">Meta Lucro Líquido (R$)</label>
            <input
              type="number"
              value={profitTarget}
              onChange={(e) => setProfitTarget(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-zinc-300">Meta Qtd de Pedidos</label>
            <input
              type="number"
              value={salesTarget}
              onChange={(e) => setSalesTarget(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-zinc-300">Meta Qtd de Peças</label>
            <input
              type="number"
              value={itemsTarget}
              onChange={(e) => setItemsTarget(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-black hover:bg-amber-400">
            Salvar Novas Metas
          </button>
        </div>
      </form>
    </div>
  );
};
