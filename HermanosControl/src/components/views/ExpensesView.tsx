import React, { useState } from 'react';
import { Receipt, Plus, Upload, Trash2, FileText, Search, ExternalLink, X } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { EmptyStateGuideCard } from '../common/EmptyStateGuideCard';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenGuideModal?: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onOpenGuideModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('Embalagens');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(100);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [notes, setNotes] = useState('');

  const categoriesList: Array<ExpenseCategory | 'Todas'> = [
    'Todas',
    'Embalagens',
    'Itens',
    'Frete',
    'Marketing',
    'Equipamentos',
    'Outros'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setReceiptUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todas' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    const newExpense: Expense = {
      id: `EXP-${Date.now()}`,
      category,
      description: description.trim(),
      amount: Number(amount),
      date,
      paymentMethod,
      receiptUrl: receiptUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onAddExpense(newExpense);
    setIsModalOpen(false);
    setDescription('');
    setAmount(100);
    setReceiptUrl('');
    setNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Controle de Despesas Operacionais</h2>
          <p className="text-xs text-zinc-400">
            Categorização de custos de embalagens, marketing, fretes e equipamentos com comprovantes.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Lançar Nova Despesa</span>
        </button>
      </div>

      {/* Categories Filter & Total */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-[#121215] p-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-right text-xs">
          <span className="text-zinc-400">Total das Despesas: </span>
          <span className="font-bold text-rose-400">
            R$ {totalExpenseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar despesa por descrição ou observações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-[#121215] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyStateGuideCard
          title="Nenhuma despesa lançada no momento"
          description="Você zerou o histórico de despesas. Lance sacolas, fretes, luz e custos da loja para saber seu Lucro Líquido exato!"
          exampleTitle="💸 Exemplo de Lançamento de Despesa"
          exampleContent={`• Descrição: 100 Sacolas Personalizadas Hermano’s Outfit\n• Categoria: Embalagens | Valor: R$ 180,00\n• Forma de Pagamento: Pix\n• Anexo de comprovante opcional em foto/PDF!`}
          actionText="Lançar Minha Primeira Despesa"
          onAction={() => setIsModalOpen(true)}
          onOpenGuide={onOpenGuideModal}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#121215] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Forma Pagamento</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Comprovante</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {exp.description}
                    {exp.notes && <p className="text-[10px] text-zinc-500 font-normal">{exp.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{exp.date}</td>
                  <td className="px-4 py-3 text-zinc-400">{exp.paymentMethod}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-400">
                    - R$ {exp.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {exp.receiptUrl ? (
                      <a
                        href={exp.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[10px] text-amber-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Ver Anexo
                      </a>
                    ) : (
                      <span className="text-zinc-600 text-[10px]">Sem anexo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="rounded p-1 text-rose-400 hover:bg-rose-500/10"
                      title="Mover para Lixeira"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Nova Despesa Operacional</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500"
                >
                  {categoriesList.filter((c) => c !== 'Todas').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Descrição do Gasto</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Lote de caixas personalizadas com seda"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500"
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Anexar Comprovante / Recibo</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Observações</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalhes adicionais do pagamento"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500"
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
                  Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
