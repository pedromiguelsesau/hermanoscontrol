import React, { useState } from 'react';
import { Users, Award, Plus, Search, ShoppingBag, Phone, Mail, FileText, X } from 'lucide-react';
import { Customer, Sale } from '../../types';

interface CustomersViewProps {
  customers: Customer[];
  sales: Sale[];
  onAddCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  sales,
  onAddCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const sortedCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent);

  const filteredCustomers = sortedCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCustomer: Customer = {
      id: `cli-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      notes: notes.trim(),
      totalSpent: 0,
      purchaseCount: 0,
      createdAt: new Date().toISOString()
    };

    onAddCustomer(newCustomer);
    setIsModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Base de Clientes & Ranking VIP</h2>
          <p className="text-xs text-zinc-400">
            Acompanhe o comportamento de compra, histórico de pedidos e valor total acumulado.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar cliente por nome, telefone ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-[#121215] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((cli, idx) => {
          const isTop3 = idx < 3;
          const customerSales = sales.filter(
            (s) => s.customerId === cli.id || s.customerName.toLowerCase() === cli.name.toLowerCase()
          );

          return (
            <div
              key={cli.id}
              className={`group relative flex flex-col justify-between rounded-2xl border p-5 shadow-xl transition-all ${
                isTop3
                  ? 'border-amber-500/40 bg-gradient-to-br from-[#18181b] via-[#121215] to-[#121215]'
                  : 'border-zinc-800 bg-[#121215]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                          : idx === 1
                          ? 'bg-zinc-300 text-black'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{cli.name}</h3>
                      {isTop3 && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <Award className="h-3 w-3" /> Cliente VIP Top Ranking
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-zinc-300">
                  {cli.phone && (
                    <p className="flex items-center gap-2 text-zinc-400">
                      <Phone className="h-3.5 w-3.5 text-amber-400" />
                      <span>{cli.phone}</span>
                    </p>
                  )}
                  {cli.email && (
                    <p className="flex items-center gap-2 text-zinc-400">
                      <Mail className="h-3.5 w-3.5 text-amber-400" />
                      <span>{cli.email}</span>
                    </p>
                  )}
                  {cli.notes && (
                    <p className="mt-2 rounded-lg bg-zinc-900/80 p-2 text-[11px] text-zinc-400 italic">
                      Observações: {cli.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-800/80 pt-3 text-center">
                  <div className="rounded-xl bg-zinc-900/60 p-2">
                    <p className="text-[10px] text-zinc-500">Total de Compras</p>
                    <p className="text-sm font-bold text-white">{customerSales.length || cli.purchaseCount}x</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 p-2 border border-amber-500/20">
                    <p className="text-[10px] text-zinc-400">Total Investido</p>
                    <p className="text-sm font-black text-amber-400">
                      R$ {cli.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomerHistory(cli)}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
                <span>Ver Histórico Completo de Pedidos</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Novo Cliente Hermano’s</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Gabriel Siqueira"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Observações de Estilo / Preferências</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Prefere camisetas tamanho G e tom escuro."
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Histórico de Compras: {selectedCustomerHistory.name}</h3>
                <p className="text-[10px] text-amber-400 font-semibold">
                  Total Gasto: R$ {selectedCustomerHistory.totalSpent.toFixed(2)}
                </p>
              </div>
              <button onClick={() => setSelectedCustomerHistory(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {sales
                .filter(
                  (s) =>
                    s.customerId === selectedCustomerHistory.id ||
                    s.customerName.toLowerCase() === selectedCustomerHistory.name.toLowerCase()
                )
                .map((sale) => (
                  <div key={sale.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-xs">
                    <div className="flex justify-between font-bold text-white">
                      <span>{sale.id} • {sale.date}</span>
                      <span className="text-amber-400">R$ {sale.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {sale.items.map((it, i) => (
                        <p key={i} className="text-[11px] text-zinc-400">
                          • {it.productName} ({it.color} | {it.size}) - {it.quantity} un
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
