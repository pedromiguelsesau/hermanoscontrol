import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { TrashItem } from '../../types';

interface TrashViewProps {
  trash: TrashItem[];
  onRestoreTrashItem: (itemId: string) => void;
  onPermanentDeleteTrashItem: (itemId: string) => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  trash,
  onRestoreTrashItem,
  onPermanentDeleteTrashItem
}) => {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Lixeira & Recuperação de Dados</h2>
          <p className="text-xs text-zinc-400">
            Itens excluídos do sistema são movidos para cá para prevenção contra exclusões acidentais.
          </p>
        </div>
      </div>

      {trash.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-12 text-center text-zinc-500">
          <Trash2 className="mx-auto h-10 w-10 opacity-30" />
          <p className="mt-3 text-xs font-bold text-zinc-400">A lixeira está vazia.</p>
          <p className="text-[11px] text-zinc-500">Nenhum item excluído pendente de restauração.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trash.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#121215] p-4 text-xs shadow-lg"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                    {item.type}
                  </span>
                  <span className="font-bold text-white">{item.originalName}</span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">Excluído em: {item.deletedAtFormatted}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRestoreTrashItem(item.id)}
                  className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-bold text-amber-400 hover:bg-amber-500/10"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                </button>
                <button
                  onClick={() => onPermanentDeleteTrashItem(item.id)}
                  className="flex items-center gap-1 rounded-lg bg-rose-500/20 px-3 py-1.5 font-bold text-rose-400 hover:bg-rose-500/30"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir Definitivamente
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
