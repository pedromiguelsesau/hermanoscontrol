import React, { useState } from 'react';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';
import { AuditLogItem } from '../../types';

interface AuditHistoryViewProps {
  logs: AuditLogItem[];
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('TODOS');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'TODOS' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Histórico Geral de Auditoria do Sistema</h2>
          <p className="text-xs text-zinc-400">
            Registro permanente e imutável de todas as ações, edições e movimentações financeiras no ERP.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-[#121215] p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar evento por ação, detalhe ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#121215] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-4 py-3">Data / Hora</th>
              <th className="px-4 py-3">Módulo</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Detalhes</th>
              <th className="px-4 py-3 text-right">Usuário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-mono text-zinc-400">{log.dateFormatted}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                    {log.module}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-white">{log.action}</td>
                <td className="px-4 py-3 text-zinc-300">{log.details}</td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-400">{log.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
