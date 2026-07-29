import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Calendar, Search } from 'lucide-react';
import { CashFlowEntry } from '../../types';

interface CashFlowViewProps {
  cashFlow: CashFlowEntry[];
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({ cashFlow }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS');

  const filteredEntries = cashFlow.filter((cf) => {
    const matchesSearch =
      cf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cf.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'TODOS' || cf.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalIn = cashFlow.filter((c) => c.type === 'ENTRADA').reduce((s, c) => s + c.amount, 0);
  const totalOut = cashFlow.filter((c) => c.type === 'SAIDA').reduce((s, c) => s + c.amount, 0);
  const netBalance = totalIn - totalOut;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Fluxo de Caixa em Tempo Real</h2>
          <p className="text-xs text-zinc-400">
            Extrato detalhado com todas as entradas de vendas e saídas de compras/despesas operacionais.
          </p>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Total de Entradas</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">
            + R$ {totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold">Total de Saídas</span>
            <ArrowDownRight className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-400">
            - R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-zinc-900 to-[#121215] p-5">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold">Saldo Líquido em Caixa</span>
            <Activity className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400">
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-[#121215] p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por descrição da movimentação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['TODOS', 'ENTRADA', 'SAIDA'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                typeFilter === t
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#121215] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Descrição / Referência</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3 text-right">Saldo Pós</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {filteredEntries.map((cf) => (
              <tr key={cf.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-mono text-zinc-400">{cf.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      cf.type === 'ENTRADA'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {cf.type === 'ENTRADA' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {cf.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{cf.category}</td>
                <td className="px-4 py-3 font-semibold text-white">{cf.description}</td>
                <td
                  className={`px-4 py-3 text-right font-mono font-bold ${
                    cf.type === 'ENTRADA' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {cf.type === 'ENTRADA' ? '+' : '-'} R$ {cf.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                  R$ {cf.balanceAfter.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
