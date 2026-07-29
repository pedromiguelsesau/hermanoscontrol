import React, { useState } from 'react';
import { Settings, Save, Download, Upload, Key, Building2, CheckCircle2, RefreshCw, Sparkles, BookOpen, Trash2, AlertTriangle } from 'lucide-react';
import { CompanyConfig, AppData } from '../../types';
import { apiService } from '../../services/api';

interface SettingsViewProps {
  companyConfig: CompanyConfig;
  data: AppData;
  onUpdateCompany: (config: CompanyConfig) => void;
  onRestoreData: (restored: AppData) => void;
  onOpenResetModal?: () => void;
  onOpenGuideModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companyConfig,
  data,
  onUpdateCompany,
  onRestoreData,
  onOpenResetModal,
  onOpenGuideModal
}) => {
  const [name, setName] = useState(companyConfig.name);
  const [cnpj, setCnpj] = useState(companyConfig.cnpj);
  const [phone, setPhone] = useState(companyConfig.phone);
  const [email, setEmail] = useState(companyConfig.email);
  const [instagram, setInstagram] = useState(companyConfig.instagram);
  const [address, setAddress] = useState(companyConfig.address);
  const [currency, setCurrency] = useState(companyConfig.currency);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany({
      name,
      cnpj,
      phone,
      email,
      instagram,
      address,
      currency
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleBackupDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hermanos_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && parsed.sales) {
          onRestoreData(parsed);
          alert('Backup restaurado com sucesso no sistema Hermano’s Control!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Configurações Globais & Backup</h2>
          <p className="text-xs text-zinc-400">
            Gerencie os dados cadastrais da Hermano’s Outfit, backups em JSON e chaves de segurança.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400 text-xs font-bold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Configurações salvas permanentemente no banco de dados!</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company Data Form */}
        <form onSubmit={handleSaveCompany} className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="h-4 w-4 text-amber-400" /> Dados Cadastrais da Empresa
          </h3>

          <div>
            <label className="block mb-1 font-semibold text-zinc-300">Razão Social / Nome de Exibição</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-semibold text-zinc-300">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-zinc-300">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-semibold text-zinc-300">E-mail de Contato</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-zinc-300">Instagram Oficial</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-zinc-300">Endereço Comercial / Sede</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-black hover:bg-amber-400">
              Salvar Dados Globais
            </button>
          </div>
        </form>

        {/* Backup & Restore Panel */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-6 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Download className="h-4 w-4 text-amber-400" /> Backup e Segurança de Dados
          </h3>

          <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="font-bold text-white">Exportar Backup Completo (JSON)</p>
            <p className="text-zinc-400">
              Faça o download de um arquivo com todas as vendas, estoque, histórico, clientes e configurações.
            </p>
            <button
              onClick={handleBackupDownload}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-bold text-black hover:bg-amber-400"
            >
              <Download className="h-4 w-4" /> Baixar Cópia de Segurança
            </button>
          </div>

          <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="font-bold text-white">Restaurar Dados a Partir de Arquivo</p>
            <p className="text-zinc-400">
              Importe um arquivo JSON de backup feito anteriormente para restaurar a base completa.
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 font-bold text-amber-400 hover:bg-amber-500/20">
              <Upload className="h-4 w-4" /> Escolher Arquivo de Backup JSON
              <input type="file" accept=".json" onChange={handleRestoreUpload} className="hidden" />
            </label>
          </div>

          {/* System Reset & Guide Box */}
          <div className="space-y-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <p className="font-bold text-red-400 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Zerar Todos os Dados (Iniciar do Zero)
            </p>
            <p className="text-zinc-300">
              Deseja cadastrar suas roupas e estoque reais? Apague os produtos, vendas e caixa de teste de uma só vez para iniciar a operação limpa!
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onOpenResetModal && (
                <button
                  type="button"
                  onClick={onOpenResetModal}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500 shadow-md shadow-red-600/20"
                >
                  <Trash2 className="h-4 w-4" /> Zerar Sistema Agora
                </button>
              )}
              {onOpenGuideModal && (
                <button
                  type="button"
                  onClick={onOpenGuideModal}
                  className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 font-bold text-amber-400 hover:bg-amber-500/20"
                >
                  <BookOpen className="h-4 w-4" /> Ver Guia Passo a Passo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
