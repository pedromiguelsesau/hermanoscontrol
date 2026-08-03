import React, { useState } from 'react';
import { ShoppingBag, Plus, Trash2, Calendar, FileText, CheckCircle2, DollarSign, X, Edit3 } from 'lucide-react';
import { Purchase, PurchaseItem, Product } from '../../types';

interface PurchasesViewProps {
  purchases: Purchase[];
  products: Product[];
  onAddPurchase: (purchase: Purchase) => void;
  onEditPurchase: (purchase: Purchase) => void;
  onDeletePurchase: (purchaseId: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  products,
  onAddPurchase,
  onEditPurchase,
  onDeletePurchase
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  // Form State
  const [supplier, setSupplier] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [freight, setFreight] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Purchase items state
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      productName: 'Camiseta Oversized Heavyweight Gold Emblem',
      category: 'Camisetas',
      brand: "Hermano's Outfit",
      color: 'Preto',
      size: 'G',
      quantity: 20,
      unitCost: 48.0,
      unitSellPrice: 149.9
    }
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productName: '',
        category: 'Camisetas',
        brand: "Hermano's Outfit",
        color: 'Preto',
        size: 'G',
        quantity: 10,
        unitCost: 50.0,
        unitSellPrice: 149.9
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const itemsTotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0), 0);
  const totalPurchaseAmount = itemsTotal + (Number(freight) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || items.length === 0) return;

    const purchaseObj: Purchase = {
      id: editingPurchase
        ? editingPurchase.id
        : `CMP-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, '0')}`,
      supplier,
      date,
      paymentMethod,
      freight: Number(freight),
      notes,
      totalAmount: totalPurchaseAmount,
      items,
      receiptUrl: receiptUrl.trim() || undefined,
      createdAt: editingPurchase ? editingPurchase.createdAt : new Date().toISOString()
    };

    if (editingPurchase) onEditPurchase(purchaseObj);
    else onAddPurchase(purchaseObj);

    setIsModalOpen(false);
    setEditingPurchase(null);
    // Reset
    setSupplier('');
    setNotes('');
    setFreight(0);
  };

  const openEditPurchase = (cmp: Purchase) => {
    setEditingPurchase(cmp);
    setSupplier(cmp.supplier);
    setDate(cmp.date);
    setPaymentMethod(cmp.paymentMethod);
    setFreight(cmp.freight);
    setNotes(cmp.notes || '');
    setReceiptUrl(cmp.receiptUrl || '');
    setItems(cmp.items);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Registro de Compras & Lotes</h2>
          <p className="text-xs text-zinc-400">
            Lance pedidos de fornecedores. O estoque, caixa, gráficos e relatórios serão atualizados automaticamente.
          </p>
        </div>
        <button
          onClick={() => { setEditingPurchase(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Nova Compra</span>
        </button>
      </div>

      {/* Purchase Cards / List */}
      <div className="space-y-4">
        {purchases.map((cmp) => (
          <div
            key={cmp.id}
            className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl transition-all hover:border-zinc-700"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/80 pb-3 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400">{cmp.id}</span>
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                    {cmp.paymentMethod}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-white">{cmp.supplier}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">Data: {cmp.date}</p>
                <p className="text-base font-black text-amber-400">
                  R$ {cmp.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Items inside purchase */}
            <div className="mt-3 space-y-2">
              <p className="text-[11px] font-semibold text-zinc-400">Itens do Lote ({cmp.items.length}):</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cmp.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{item.productName}</p>
                      <p className="text-[10px] text-zinc-400">
                        {item.color} | Tam {item.size} • Qtd: {item.quantity} un
                      </p>
                    </div>
                    <div className="text-right font-mono text-zinc-300">
                      R$ {item.unitCost.toFixed(2)}/un
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {cmp.notes && (
              <p className="mt-3 text-[11px] text-zinc-400 italic">Observações: {cmp.notes}</p>
            )}

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-800/80 pt-3">
              <button
                onClick={() => openEditPurchase(cmp)}
                title="Editar Lote"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-zinc-300 hover:text-white"
              >
                <Edit3 className="h-3.5 w-3.5 text-amber-400" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => onDeletePurchase(cmp.id)}
                title="Excluir lote e estornar o estoque"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">{editingPurchase ? `Editar Lote (${editingPurchase.id})` : 'Lançar Nova Compra de Lote'}</h3>
                <p className="text-xs text-zinc-400">Insira fornecedor, frete e adicione os produtos do lote.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block font-semibold text-zinc-300">Fornecedor / Indústria</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ex: Têxtil Premium SP Indústria"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Data da Compra</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Transferência">Transferência Bancária</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Frete / Transporte (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={freight}
                    onChange={(e) => setFreight(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Comprovante (URL / Foto)</label>
                  <input
                    type="text"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="URL ou anexo de nota fiscal"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="border-t border-zinc-800 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-bold text-white">Itens Adicionados no Pedido ({items.length})</p>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar Produto ao Lote
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 sm:grid-cols-6"
                    >
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-zinc-400">Nome do Produto</label>
                        <input
                          type="text"
                          required
                          value={item.productName}
                          onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                          placeholder="Ex: Camiseta Oversized"
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-400">Cor</label>
                        <input
                          type="text"
                          value={item.color}
                          onChange={(e) => handleUpdateItem(idx, 'color', e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-400">Tamanho</label>
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) => handleUpdateItem(idx, 'size', e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-400">Qtd</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-zinc-400">Custo Un (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-white"
                          />
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="mt-4 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 font-bold text-amber-400">
                <span>Valor Total da Compra (Itens + Frete):</span>
                <span className="text-lg">
                  R$ {totalPurchaseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
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
                  Finalizar & Atualizar Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
