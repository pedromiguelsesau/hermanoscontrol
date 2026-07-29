import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, Search, CheckCircle2, User, X } from 'lucide-react';
import { Sale, SaleItem, Product, Customer } from '../../types';
import { EmptyStateGuideCard } from '../common/EmptyStateGuideCard';

interface SalesViewProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  onAddSale: (sale: Sale) => void;
  onOpenGuideModal?: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  sales,
  products,
  customers,
  onAddSale,
  onOpenGuideModal
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [salesperson, setSalesperson] = useState('Pedro (Hermano)');
  const [discount, setDiscount] = useState<number>(0);
  const [freight, setFreight] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Cart items
  const [cart, setCart] = useState<SaleItem[]>([]);

  // Product Selection helper
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState<number>(1);

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCustomerId(id);
    const cli = customers.find((c) => c.id === id);
    if (cli) {
      setCustomerName(cli.name);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIndex = cart.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      setCart((prev) => {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + Number(selectedQty);
        updated[existingIndex].quantity = newQty;
        updated[existingIndex].total = newQty * updated[existingIndex].unitPrice;
        return updated;
      });
    } else {
      const newItem: SaleItem = {
        productId: prod.id,
        code: prod.code,
        productName: prod.name,
        color: prod.color,
        size: prod.size,
        quantity: Number(selectedQty),
        unitPrice: prod.sellPrice,
        unitCost: prod.costPrice,
        total: Number(selectedQty) * prod.sellPrice
      };
      setCart((prev) => [...prev, newItem]);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotalCart = cart.reduce((sum, item) => sum + item.total, 0);
  const totalSaleAmount = Math.max(0, subtotalCart - Number(discount) + Number(freight));
  const totalCost = cart.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
  const profitAmount = totalSaleAmount - totalCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || cart.length === 0) return;

    const newSale: Sale = {
      id: `VD-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`,
      customerId: selectedCustomerId || undefined,
      customerName,
      date,
      items: cart,
      discount: Number(discount),
      freight: Number(freight),
      totalAmount: totalSaleAmount,
      profitAmount,
      paymentMethod,
      salesperson,
      notes,
      createdAt: new Date().toISOString()
    };

    onAddSale(newSale);
    setIsModalOpen(false);
    // Reset
    setCart([]);
    setCustomerName('');
    setDiscount(0);
    setFreight(0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Registro de Vendas</h2>
          <p className="text-xs text-zinc-400">
            Lance novos pedidos. O estoque de peças, caixa, comissões e indicadores serão atualizados no ato.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Nova Venda</span>
        </button>
      </div>

      {/* Sales List */}
      {sales.length === 0 ? (
        <EmptyStateGuideCard
          title="Nenhuma venda registrada até o momento"
          description="Você zerou os dados de vendas. Quando realizar uma venda no balcão da loja ou pelo WhatsApp, registre para atualizar o caixa e dar baixa no estoque!"
          exampleTitle="🛒 Exemplo de Registro de Venda"
          exampleContent={`• Cliente: Gabriel Santos (ou Cliente Balcão)\n• Item: 1x Camiseta Oversized Streetwear Preta (R$ 89,90)\n• Forma de Pagamento: Pix | Vendedor: Hermano\n• O caixa atualiza na hora e imprime o comprovante!`}
          actionText="Registrar Minha Primeira Venda"
          onAction={() => setIsModalOpen(true)}
          onOpenGuide={onOpenGuideModal}
        />
      ) : (
        <div className="space-y-4">
          {sales.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl transition-all hover:border-zinc-700"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/80 pb-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{s.id}</span>
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      {s.paymentMethod}
                    </span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      Lucro: R$ {s.profitAmount.toFixed(2)}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-white">Cliente: {s.customerName}</h3>
                  <p className="text-[11px] text-zinc-400">Vendedor: {s.salesperson}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-400">{s.date}</p>
                  <p className="text-lg font-black text-emerald-400">
                    R$ {s.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Sale Items */}
              <div className="mt-3 space-y-2">
                <p className="text-[11px] font-semibold text-zinc-400">Peças Vendidas ({s.items.length}):</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {s.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{item.productName}</p>
                        <p className="text-[10px] text-zinc-400">
                          {item.code} • {item.color} | Tam {item.size} • Qtd: {item.quantity} un
                        </p>
                      </div>
                      <div className="text-right font-mono font-bold text-white">
                        R$ {item.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Registrar Nova Venda</h3>
                <p className="text-xs text-zinc-400">Selecione o cliente, adicione os produtos e forma de pagamento.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Selecionar Cliente Cadastrado</label>
                  <select
                    value={selectedCustomerId}
                    onChange={handleSelectCustomer}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- Cliente Avulso --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Nome do Comprador</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Data da Venda</label>
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
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Boleto">Boleto</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Vendedor</label>
                  <input
                    type="text"
                    value={salesperson}
                    onChange={(e) => setSalesperson(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Desconto Concedido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Picker Box */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <p className="mb-2 font-bold text-white">Adicionar Peça ao Carrinho de Venda</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500"
                  >
                    <option value="">-- Escolha um produto em estoque --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name} ({p.color} | {p.size}) [Estoque: {p.stock} un] - R$ {p.sellPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                    className="w-20 rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white text-center"
                  />

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="rounded-xl bg-amber-500 px-4 py-2.5 font-bold text-black hover:bg-amber-400"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Cart Items List */}
              {cart.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-white">Carrinho ({cart.length} itens):</p>
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-3"
                    >
                      <div>
                        <p className="font-bold text-white">{item.productName}</p>
                        <p className="text-[10px] text-zinc-400">
                          {item.code} • {item.color} ({item.size}) | Qtd: {item.quantity} un x R$ {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-amber-400">R$ {item.total.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Financial Calculation Box */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 font-bold text-emerald-400">
                <div>
                  <p className="text-xs text-zinc-400">Total da Venda (com desconto):</p>
                  <p className="text-xl font-black">
                    R$ {totalSaleAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Lucro Estimado:</p>
                  <p className="text-lg font-black text-amber-400">
                    R$ {profitAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
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
                  Finalizar Venda & Dar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
