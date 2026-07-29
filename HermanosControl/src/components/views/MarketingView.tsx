import React, { useState } from 'react';
import { Target, Plus, DollarSign, TrendingUp, Instagram, Award, Percent, X } from 'lucide-react';
import { MarketingCampaign } from '../../types';

interface MarketingViewProps {
  campaigns: MarketingCampaign[];
  onAddCampaign: (campaign: MarketingCampaign) => void;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  campaigns,
  onAddCampaign
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState<number>(500);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState<'Instagram' | 'Meta Ads' | 'Influencers' | 'TikTok' | 'Outros'>('Instagram');
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);

  const totalInvested = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalRevenueGenerated = campaigns.reduce((sum, c) => sum + c.revenueGenerated, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newCamp: MarketingCampaign = {
      id: `mkt-${Date.now()}`,
      title: title.trim(),
      budget: Number(budget),
      spent: Number(budget),
      startDate,
      endDate,
      channel,
      discountCode: discountCode.trim() || undefined,
      discountPercentage: Number(discountPercentage) || undefined,
      salesCount: 0,
      revenueGenerated: 0,
      roas: 0,
      status: 'Ativa'
    };

    onAddCampaign(newCamp);
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Gestão de Campanhas & Lançamentos</h2>
          <p className="text-xs text-zinc-400">
            Controle investimentos em anúncios do Instagram, influenciadores e cupons de desconto.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Criar Nova Campanha</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl">
          <p className="text-xs text-zinc-400">Total Investido em Marketing</p>
          <p className="mt-2 text-2xl font-black text-amber-400">
            R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl">
          <p className="text-xs text-zinc-400">Retorno de Vendas Gerado</p>
          <p className="mt-2 text-2xl font-black text-emerald-400">
            R$ {totalRevenueGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl">
          <p className="text-xs text-zinc-400">ROAS Médio das Campanhas</p>
          <p className="mt-2 text-2xl font-black text-blue-400">
            {totalInvested > 0 ? (totalRevenueGenerated / totalInvested).toFixed(2) : '0.00'}x
          </p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-pink-500/10 p-2 text-pink-400">
                  <Instagram className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{camp.title}</h3>
                  <p className="text-[10px] text-zinc-400">Canal: {camp.channel}</p>
                </div>
              </div>
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                {camp.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-zinc-900 p-2.5">
                <p className="text-[10px] text-zinc-500">Investimento</p>
                <p className="font-bold text-white">R$ {camp.budget.toFixed(2)}</p>
              </div>

              <div className="rounded-xl bg-zinc-900 p-2.5">
                <p className="text-[10px] text-zinc-500">Retorno em Vendas</p>
                <p className="font-bold text-emerald-400">R$ {camp.revenueGenerated.toFixed(2)}</p>
              </div>
            </div>

            {camp.discountCode && (
              <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-xs font-semibold text-amber-400">
                <span>Cupom: {camp.discountCode}</span>
                <span>{camp.discountPercentage}% OFF</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Nova Campanha de Marketing</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Título do Lançamento / Ação</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Lançamento Coleção Inverno 2026"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Orçamento Previsto (R$)</label>
                <input
                  type="number"
                  required
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Cupom de Desconto Criado</label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Ex: HERMANO10"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 font-bold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-6 py-2 font-bold text-black hover:bg-amber-400"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
