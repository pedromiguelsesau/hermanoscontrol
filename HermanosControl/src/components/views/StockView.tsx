import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import { Product, StockMovement } from '../../types';

interface StockViewProps {
  products: Product[];
  movements: StockMovement[];
  onAdjustStock: (
    productId: string,
    type: 'ENTRADA' | 'SAIDA' | 'AJUSTE',
    quantity: number,
    reason: string
  ) => void;
}

export const StockView: React.FC<StockViewProps> = ({
  products,
  movements,
  onAdjustStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'ENTRADA' | 'SAIDA' | 'AJUSTE'>('ENTRADA');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState('Ajuste de inventário físico');

  const lowStockCount = products.filter((p) => p.stock < p.initialStock / 2).length;

  const filteredProducts = products.filter((p) => {
    const isLow = p.stock < p.initialStock / 2;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.color.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (!showLowStockOnly || isLow);
  });

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustType('ENTRADA');
    setAdjustQuantity(5);
    setAdjustReason('Reposição de estoque via conferência');
    setIsModalOpen(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustQuantity <= 0) return;

    onAdjustStock(selectedProduct.id, adjustType, Number(adjustQuantity), adjustReason);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Controle de Estoque Inteligente</h2>
          <p className="text-xs text-zinc-400">
            Monitoramento de unidades por produto, cor e tamanho com alerta automático de reposição.
          </p>
        </div>
      </div>

      {/* Alert Banner for Low Stock */}
      {lowStockCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-400">Alerta: {lowStockCount} Produtos em Estoque Crítico</h3>
              <p className="text-xs text-zinc-300">
                Estas peças já consumiram mais de 50% do volume originalmente adquirido. Recomenda-se reposição.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
          >
            {showLowStockOnly ? 'Ver Todo o Estoque' : 'Filtrar Apenas Estoque Baixo'}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="h-5 w-5" />
          <span>Todos os produtos possuem níveis de estoque adequados (&gt; 50% da quantidade inicial).</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar produto por nome, código (HO-XXXX) ou variação..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-[#121215] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Products Stock Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#121215] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Cor / Tam</th>
              <th className="px-4 py-3 text-center">Inicial</th>
              <th className="px-4 py-3 text-center">Atual</th>
              <th className="px-4 py-3 text-right">Valor Total Est.</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {filteredProducts.map((p) => {
              const isLow = p.stock < p.initialStock / 2;
              const totalEstValue = p.stock * p.costPrice;

              return (
                <tr key={p.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-mono font-bold text-amber-400">{p.code}</td>
                  <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {p.color} / <span className="text-white font-medium">{p.size}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-zinc-500">{p.initialStock} un</td>
                  <td className="px-4 py-3 text-center font-bold text-white">{p.stock} un</td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-200">
                    R$ {totalEstValue.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="h-3 w-3" /> Repor (&lt;50%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenModal(p)}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/10"
                    >
                      Ajustar Estoque
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Movements History */}
      <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
        <h3 className="mb-4 text-base font-bold text-white">Histórico de Movimentações de Estoque</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
          {movements.map((mv) => (
            <div
              key={mv.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold ${
                    mv.type === 'ENTRADA'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : mv.type === 'SAIDA'
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {mv.type === 'ENTRADA' ? '+' : mv.type === 'SAIDA' ? '-' : '•'}
                </span>
                <div>
                  <p className="font-bold text-white">{mv.productName}</p>
                  <p className="text-[10px] text-zinc-400">
                    {mv.type} de {mv.quantity} un • Motivo: {mv.reason}
                  </p>
                </div>
              </div>
              <div className="text-right text-[10px] text-zinc-500">
                <p>{mv.date}</p>
                <p>Por: {mv.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adjust Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Ajustar Estoque: {selectedProduct.code}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Tipo de Movimentação</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ENTRADA')}
                    className={`rounded-xl py-2 font-bold ${
                      adjustType === 'ENTRADA'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('SAIDA')}
                    className={`rounded-xl py-2 font-bold ${
                      adjustType === 'SAIDA'
                        ? 'bg-rose-500 text-white'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Saída (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('AJUSTE')}
                    className={`rounded-xl py-2 font-bold ${
                      adjustType === 'AJUSTE'
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    Ajuste
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Quantidade de Peças</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Observação / Motivo</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ex: Chegada de lote, troca ou inventário"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
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
                  className="rounded-xl bg-amber-500 px-6 py-2 font-bold text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
