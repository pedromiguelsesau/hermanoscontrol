import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<'LANÇAMENTO' | 'PAGAMENTO' | 'REUNIÃO' | 'OUTROS'>('LANÇAMENTO');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      id: `evt-${Date.now()}`,
      title: title.trim(),
      date,
      time,
      type,
      notes,
      completed: false
    });

    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Calendário Integrado de Operações</h2>
          <p className="text-xs text-zinc-400">Agende lançamentos no Instagram, vencimentos de boletos e reuniões.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" /> NOVO COMPROMISSO
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((evt) => (
          <div key={evt.id} className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                {evt.type}
              </span>
              <span className="text-[10px] text-zinc-400">{evt.date} às {evt.time}</span>
            </div>
            <h3 className="text-sm font-bold text-white">{evt.title}</h3>
            {evt.notes && <p className="text-xs text-zinc-400">{evt.notes}</p>}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Agendar Compromisso</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-zinc-300">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Lançamento de Drop 2 no Instagram"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-semibold text-zinc-300">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-zinc-300">Horário</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-zinc-300">Categoria</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                >
                  <option value="LANÇAMENTO">Lançamento</option>
                  <option value="PAGAMENTO">Pagamento</option>
                  <option value="REUNIÃO">Reunião</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold text-zinc-300">Detalhes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-zinc-400"
                >
                  Cancelar
                </button>
                <button type="submit" className="rounded-xl bg-amber-500 px-6 py-2 font-bold text-black">
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
