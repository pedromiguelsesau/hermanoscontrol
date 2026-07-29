import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Banknote, ShieldAlert, PieChart as PieIcon, ArrowUpRight } from 'lucide-react';
import { FinancialState, CashFlowEntry, Sale, Expense } from '../../types';

interface FinancialViewProps {
  financial: FinancialState;
  cashFlow: CashFlowEntry[];
  sales: Sale[];
  expenses: Expense[];
  onUpdateFinancial: (updated: Partial<FinancialState>) => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  financial,
  cashFlow,
  sales,
  expenses,
  onUpdateFinancial
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [payables, setPayables] = useState(financial.accountsPayable);
  const [receivables, setReceivables] = useState(financial.accountsReceivable);
  const [installments, setInstallments] = useState(financial.installments);
  const [withdrawals, setWithdrawals] = useState(financial.withdrawals);
  const [assets, setAssets] = useState(financial.assetsValue);

  // Dynamic balance calculations
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const availableBalance = totalSalesRevenue - totalExpenses - withdrawals;

  // Breakdown by payment method
  const pixTotal = sales
    .filter((s) => s.paymentMethod.toUpperCase().includes('PIX'))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const cardTotal = sales
    .filter((s) => s.paymentMethod.toUpperCase().includes('CARTÃO'))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const cashTotal = sales
    .filter((s) => s.paymentMethod.toUpperCase().includes('DINHEIRO'))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const bankTotal = sales
    .filter((s) => s.paymentMethod.toUpperCase().includes('BOLETO') || s.paymentMethod.toUpperCase().includes('TRANSFERÊNCIA'))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFinancial({
      accountsPayable: Number(payables),
      accountsReceivable: Number(receivables),
      installments: Number(installments),
      withdrawals: Number(withdrawals),
      assetsValue: Number(assets)
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Painel Financeiro & Patrimônio</h2>
          <p className="text-xs text-zinc-400">
            Acompanhamento consolidado de saldo disponível, pagamentos por canal, contas e retiradas.
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-amber-400 hover:border-amber-500/40"
        >
          {isEditing ? 'Cancelar Edição' : 'Ajustar Contas & Patrimônio'}
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Saldo Disponível */}
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-zinc-900 via-[#121215] to-[#121215] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Saldo Disponível em Caixa</span>
            <Wallet className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-3 text-2xl font-black text-amber-400">
            R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-[10px] text-zinc-400">Receita Total de Vendas - Despesas - Retiradas</p>
        </div>

        {/* Card 2: Patrimônio Líquido */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Patrimônio Avaliado</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-black text-white">
            R$ {(assets + availableBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-[10px] text-zinc-400">Estoque físico + caixas de capital</p>
        </div>

        {/* Card 3: Contas a Receber */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Contas a Receber</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-3 text-2xl font-black text-white">
            R$ {receivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-[10px] text-zinc-400">Parcelamentos de cartão & boletos a vencer</p>
        </div>

        {/* Card 4: Contas a Pagar */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-lg">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Contas a Pagar</span>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-3 text-2xl font-black text-rose-400">
            R$ {payables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-[10px] text-zinc-400">Fornecedores & boletos de compras</p>
        </div>
      </div>

      {/* Payment Channels Breakdown */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
        <h3 className="mb-4 text-base font-bold text-white">Faturamento por Meio de Pagamento</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Banknote className="h-4 w-4 text-emerald-400" /> PIX Instantâneo
            </div>
            <p className="mt-2 text-lg font-bold text-white">R$ {pixTotal.toFixed(2)}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <CreditCard className="h-4 w-4 text-blue-400" /> Cartão de Crédito / Débito
            </div>
            <p className="mt-2 text-lg font-bold text-white">R$ {cardTotal.toFixed(2)}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <DollarSign className="h-4 w-4 text-amber-400" /> Dinheiro em Espécie
            </div>
            <p className="mt-2 text-lg font-bold text-white">R$ {cashTotal.toFixed(2)}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Wallet className="h-4 w-4 text-purple-400" /> Boleto / Bancário
            </div>
            <p className="mt-2 text-lg font-bold text-white">R$ {bankTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Editing Modal/Section */}
      {isEditing && (
        <form onSubmit={handleSave} className="rounded-2xl border border-amber-500/30 bg-[#121215] p-6 shadow-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-amber-400">Ajustar Lançamentos Financeiros Fixos</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-semibold text-zinc-300">Contas a Pagar (R$)</label>
              <input
                type="number"
                step="0.01"
                value={payables}
                onChange={(e) => setPayables(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-zinc-300">Contas a Receber (R$)</label>
              <input
                type="number"
                step="0.01"
                value={receivables}
                onChange={(e) => setReceivables(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-zinc-300">Retiradas / Pró-labore (R$)</label>
              <input
                type="number"
                step="0.01"
                value={withdrawals}
                onChange={(e) => setWithdrawals(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-black hover:bg-amber-400"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
