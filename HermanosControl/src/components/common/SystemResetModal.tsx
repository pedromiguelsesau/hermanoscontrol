import React, { useState } from 'react';
import { RefreshCw, Trash2, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, X, Layers, DollarSign, Package } from 'lucide-react';

interface SystemResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetProducts: () => void;
  onResetFinancials: () => void;
  onResetComplete: () => void;
}

export const SystemResetModal: React.FC<SystemResetModalProps> = ({
  isOpen,
  onClose,
  onResetProducts,
  onResetFinancials,
  onResetComplete,
}) => {
  const [resetType, setResetType] = useState<'COMPLETE' | 'PRODUCTS' | 'FINANCIAL'>('COMPLETE');
  const [confirmText, setConfirmText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleExecuteReset = () => {
    if (resetType === 'PRODUCTS') {
      onResetProducts();
      setSuccessMsg('Estoque e catálogo de produtos zerados com sucesso!');
    } else if (resetType === 'FINANCIAL') {
      onResetFinancials();
      setSuccessMsg('Histórico de vendas, compras e caixa zerados com sucesso!');
    } else {
      onResetComplete();
      setSuccessMsg('Sistema zerado por completo! Sua loja está pronta para iniciar do zero.');
    }

    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Zerar Dados & Iniciar Loja do Zero</h3>
              <p className="text-xs text-zinc-400">Limpe os dados fictícios de teste para cadastrar os valores e camisetas reais.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg ? (
          <div className="my-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-bounce" />
            <h4 className="text-base font-bold text-emerald-300">{successMsg}</h4>
            <p className="text-xs text-emerald-400/80">Recarregando ambiente de gestão...</p>
          </div>
        ) : (
          <div className="mt-5 space-y-5 text-xs">
            {/* Warning Banner */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-200">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Atenção antes de zerar:</p>
                <p className="text-zinc-300 mt-0.5">
                  Esta ação irá apagar os dados selecionados para que você possa colocar suas próprias roupas, preços de custo, valores de venda e estoque reais. A identidade e imagens da Hermano's serão mantidas!
                </p>
              </div>
            </div>

            {/* Options Selection */}
            <div>
              <label className="block mb-2 font-bold text-white">Escolha o que deseja zerar:</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setResetType('COMPLETE')}
                  className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                    resetType === 'COMPLETE'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Sparkles className="h-5 w-5 text-amber-400 mb-2" />
                  <span className="font-bold text-xs text-white">Zerar Tudo (Completo)</span>
                  <span className="text-[10px] text-zinc-400 mt-1">Limpa produtos, vendas, despesas, caixa e relatórios</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResetType('PRODUCTS')}
                  className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                    resetType === 'PRODUCTS'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Package className="h-5 w-5 text-amber-400 mb-2" />
                  <span className="font-bold text-xs text-white">Apenas Produtos & Estoque</span>
                  <span className="text-[10px] text-zinc-400 mt-1">Apaga catálogo de teste para você cadastrar suas roupas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResetType('FINANCIAL')}
                  className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition-all ${
                    resetType === 'FINANCIAL'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <DollarSign className="h-5 w-5 text-amber-400 mb-2" />
                  <span className="font-bold text-xs text-white">Apenas Vendas & Caixa</span>
                  <span className="text-[10px] text-zinc-400 mt-1">Zera histórico financeiro e contas a pagar/receber</span>
                </button>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5 text-zinc-300">
              <p className="font-bold text-white mb-1">O que vai acontecer:</p>
              {resetType === 'COMPLETE' && (
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                  <li>O catálogo de produtos será limpo (0 produtos).</li>
                  <li>O estoque de todas as camisetas e peças será zerado.</li>
                  <li>O histórico de vendas, compras e despesas será reiniciado.</li>
                  <li>Os saldos de caixa e banco serão ajustados para R$ 0,00.</li>
                  <li>Sua marca (Hermano's Conceito, Logo, Instagram) será mantida intacta!</li>
                </ul>
              )}
              {resetType === 'PRODUCTS' && (
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                  <li>Todas as camisetas e roupas fictícias serão removidas do catálogo.</li>
                  <li>A lista de estoque ficará pronta para novo cadastro.</li>
                  <li>Seu histórico financeiro atual continuará salvo.</li>
                </ul>
              )}
              {resetType === 'FINANCIAL' && (
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
                  <li>As vendas de teste serão excluídas do sistema.</li>
                  <li>Os registros de fluxo de caixa e compras serão limpos.</li>
                  <li>Seus produtos cadastrados continuarão no catálogo.</li>
                </ul>
              )}
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="block mb-1 font-medium text-zinc-300">
                Para confirmar, digite <span className="font-bold text-amber-400">ZERAR</span> no campo abaixo:
              </label>
              <input
                type="text"
                placeholder="Digite ZERAR para confirmar"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white uppercase tracking-wider font-mono placeholder:normal-case placeholder:tracking-normal"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-800 px-4 py-2.5 font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmText.trim().toUpperCase() !== 'ZERAR'}
                onClick={handleExecuteReset}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-600/20"
              >
                <Trash2 className="h-4 w-4" />
                Confirmar e Zerar Agora
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
