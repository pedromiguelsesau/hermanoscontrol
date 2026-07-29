import React, { useState } from 'react';
import { CheckSquare, Plus, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import { Task } from '../../types';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, onAddTask, onToggleTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('Hermano Team');
  const [priority, setPriority] = useState<'BAIXA' | 'MÉDIA' | 'ALTA'>('ALTA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: `task-${Date.now()}`,
      title: title.trim(),
      assignee,
      priority,
      completed: false,
      createdAt: new Date().toISOString()
    });

    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Tarefas Operacionais</h2>
          <p className="text-xs text-zinc-400">Lista de pendências internas e prazos da empresa.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" /> NOVA TAREFA
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((tk) => (
          <div
            key={tk.id}
            onClick={() => onToggleTask(tk.id)}
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-xs transition-all ${
              tk.completed
                ? 'border-zinc-800 bg-zinc-900/40 text-zinc-500 line-through'
                : 'border-zinc-800 bg-[#121215] text-white hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  tk.completed
                    ? 'border-emerald-500 bg-emerald-500 text-black'
                    : 'border-zinc-700 bg-zinc-900'
                }`}
              >
                {tk.completed && <CheckCircle2 className="h-4 w-4" />}
              </span>
              <div>
                <p className="font-bold">{tk.title}</p>
                <p className="text-[10px] text-zinc-400 font-normal">Responsável: {tk.assignee}</p>
              </div>
            </div>

            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                tk.priority === 'ALTA'
                  ? 'bg-rose-500/20 text-rose-400'
                  : tk.priority === 'MÉDIA'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {tk.priority}
            </span>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Criar Tarefa</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-zinc-300">Descrição da Tarefa</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Conferir nota fiscal de tecidos"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-zinc-300">Responsável</label>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-zinc-300">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
                >
                  <option value="ALTA">Alta</option>
                  <option value="MÉDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                </select>
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
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
