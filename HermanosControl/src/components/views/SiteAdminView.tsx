import React, { useState } from 'react';
import {
  Globe,
  Image as ImageIcon,
  Sparkles,
  Eye,
  CheckCircle2,
  RotateCcw,
  Upload,
  Trash2,
  Save,
  Clock,
  History,
  Layers,
  Layout,
  Sliders,
  Type,
  Video,
  Instagram,
  Phone,
  Mail,
  Share2,
  Shield,
  Smartphone,
  Monitor,
  Tablet,
  Plus,
  AlertTriangle,
  FolderOpen,
  Check,
  Tag,
  ShoppingBag
} from 'lucide-react';
import {
  SiteConfig,
  Product,
  MediaItem,
  SiteCollectionItem,
  SiteCategoryItem,
  SiteVersionHistory,
  AppData
} from '../../types';
import { ImageInput } from '../media/ImageInput';
import { apiService } from '../../services/api';

interface SiteAdminViewProps {
  siteConfig: SiteConfig;
  products: Product[];
  mediaLibrary?: MediaItem[];
  onUpdateSiteConfig: (config: SiteConfig) => void;
  onRefreshData?: () => void;
}

type SubTab = 'identity' | 'home' | 'header_footer' | 'collections_categories' | 'history' | 'preview';

export const SiteAdminView: React.FC<SiteAdminViewProps> = ({
  siteConfig,
  products,
  mediaLibrary = [],
  onUpdateSiteConfig,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('identity');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Form State initialized from siteConfig
  const [configDraft, setConfigDraft] = useState<SiteConfig>({
    ...siteConfig,
    collectionsList: siteConfig.collectionsList || [],
    categoriesList: siteConfig.categoriesList || [],
    carouselImages: siteConfig.carouselImages || [],
    versions: siteConfig.versions || []
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Log Tracking
  const [changeLogs, setChangeLogs] = useState<string[]>([]);

  // Update a field in configDraft
  const updateDraft = (field: keyof SiteConfig, value: any, logDescription?: string) => {
    setConfigDraft((prev) => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);

    if (logDescription) {
      setChangeLogs((prev) => [...prev, logDescription]);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    const updated = {
      ...configDraft,
      status: 'Rascunho' as const
    };
    onUpdateSiteConfig(updated);
    setHasUnsavedChanges(false);
    setStatusMsg({ type: 'success', text: 'Rascunho do site salvo com sucesso!' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Publish Site (Creates a new version history entry & logs audit)
  const handlePublish = () => {
    const newVersionNumber = (configDraft.versions?.length || 0) + 1;
    const now = new Date().toISOString();
    const versionEntry: SiteVersionHistory = {
      id: `ver-${Date.now()}`,
      versionNumber: newVersionNumber,
      savedAt: now,
      savedBy: 'Pedro (Hermano)',
      status: 'Publicado',
      changeLog: changeLogs.length > 0 ? changeLogs : ['Atualização das configurações do site e layout visual.'],
      configSnapshot: JSON.parse(JSON.stringify(configDraft))
    };

    const updatedConfig: SiteConfig = {
      ...configDraft,
      status: 'Publicado',
      lastPublishedAt: now,
      lastPublishedBy: 'Pedro (Hermano)',
      versions: [versionEntry, ...(configDraft.versions || [])]
    };

    onUpdateSiteConfig(updatedConfig);
    setConfigDraft(updatedConfig);
    setHasUnsavedChanges(false);
    setChangeLogs([]);
    setStatusMsg({ type: 'success', text: `Versão v${newVersionNumber} publicada com sucesso no e-commerce!` });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Restore previous version
  const handleRestoreVersion = (version: SiteVersionHistory) => {
    if (
      window.confirm(
        `Tem certeza que deseja restaurar a Versão v${version.versionNumber} de ${new Date(
          version.savedAt
        ).toLocaleString('pt-BR')}?`
      )
    ) {
      const restored = {
        ...version.configSnapshot,
        status: 'Rascunho' as const,
        versions: configDraft.versions
      };
      setConfigDraft(restored);
      onUpdateSiteConfig(restored);
      setHasUnsavedChanges(true);
      setStatusMsg({
        type: 'success',
        text: `Versão v${version.versionNumber} restaurada para o rascunho. Clique em "Publicar" para ir ao ar.`
      });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Publish Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-gradient-to-r from-[#121216] via-[#16161c] to-[#0f0f13] p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Editor Visual Completo do E-Commerce</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  configDraft.status === 'Publicado' && !hasUnsavedChanges
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
                }`}
              >
                {hasUnsavedChanges ? 'Alterações Não Salvas' : configDraft.status || 'Publicado'}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              Gerencie identidades, banners, coleções, rodapé e mídias sem mexer no código.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={!hasUnsavedChanges}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:bg-zinc-700 disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            <span>Salvar Rascunho</span>
          </button>

          <button
            onClick={handlePublish}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400"
          >
            <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
            <span>Publicar Alterações no Site</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-5 py-3 text-xs font-medium ${
            statusMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-800 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('identity')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'identity'
              ? 'border border-amber-500/40 bg-amber-500/20 text-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>1. Identidade Visual</span>
        </button>

        <button
          onClick={() => setActiveTab('home')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'home'
              ? 'border border-amber-500/40 bg-amber-500/20 text-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>2. Página Inicial (Home)</span>
        </button>

        <button
          onClick={() => setActiveTab('header_footer')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'header_footer'
              ? 'border border-amber-500/40 bg-amber-500/20 text-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Layout className="h-4 w-4" />
          <span>3. Cabeçalho & Rodapé</span>
        </button>

        <button
          onClick={() => setActiveTab('collections_categories')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'collections_categories'
              ? 'border border-amber-500/40 bg-amber-500/20 text-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>4. Coleções & Categorias</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'history'
              ? 'border border-amber-500/40 bg-amber-500/20 text-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <History className="h-4 w-4" />
          <span>5. Versionamento & Histórico</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'preview'
              ? 'border border-amber-500/40 bg-amber-500/20 text-amber-400'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>6. Pré-Visualização em Tempo Real</span>
        </button>
      </div>

      {/* SUB-TAB 1: IDENTIDADE VISUAL */}
      {activeTab === 'identity' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Identidade Visual da Marca</h3>
              <p className="text-xs text-zinc-400">
                Altere logos, avatares, favicon, marcas d’água e selos do site com pré-visualização em tempo real.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Logo Principal */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <label className="text-xs font-bold text-white block">Logo Principal da Marca</label>
                <ImageInput
                  value={configDraft.logoUrl || ''}
                  onChange={(url) => updateDraft('logoUrl', url, 'Logo Principal alterada')}
                  mediaLibrary={mediaLibrary}
                  onRefreshMedia={onRefreshData}
                  category="Logos"
                  placeholder="Selecione a logo principal..."
                />
              </div>

              {/* Foto de Perfil da Marca */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <label className="text-xs font-bold text-white block">Foto de Perfil da Marca</label>
                <ImageInput
                  value={configDraft.profilePicUrl || ''}
                  onChange={(url) => updateDraft('profilePicUrl', url, 'Foto de Perfil alterada')}
                  mediaLibrary={mediaLibrary}
                  onRefreshMedia={onRefreshData}
                  category="Logos"
                  placeholder="Selecione o avatar oficial..."
                />
              </div>

              {/* Favicon do Navegador */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <label className="text-xs font-bold text-white block">Favicon / Ícone da Aba</label>
                <ImageInput
                  value={configDraft.faviconUrl || ''}
                  onChange={(url) => updateDraft('faviconUrl', url, 'Favicon alterado')}
                  mediaLibrary={mediaLibrary}
                  onRefreshMedia={onRefreshData}
                  category="Logos"
                  placeholder="Favicon (32x32)..."
                />
              </div>

              {/* Imagem Open Graph (OG Image) */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <label className="text-xs font-bold text-white block">Imagem de Compartilhamento (Open Graph / WhatsApp)</label>
                <ImageInput
                  value={configDraft.ogImageUrl || ''}
                  onChange={(url) => updateDraft('ogImageUrl', url, 'Imagem Open Graph alterada')}
                  mediaLibrary={mediaLibrary}
                  onRefreshMedia={onRefreshData}
                  category="Marketing"
                  placeholder="Imagem para redes sociais (1200x630)..."
                />
              </div>

              {/* Marca d'Água */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <label className="text-xs font-bold text-white block">Marca d'Água para Fotos de Produtos</label>
                <ImageInput
                  value={configDraft.watermarkUrl || ''}
                  onChange={(url) => updateDraft('watermarkUrl', url, 'Marca d’água alterada')}
                  mediaLibrary={mediaLibrary}
                  onRefreshMedia={onRefreshData}
                  category="Logos"
                  placeholder="Selo ou marca d'água em PNG transparente..."
                />
              </div>

              {/* Símbolo / Monograma */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <label className="text-xs font-bold text-white block">Símbolo Textual / Monograma (Abreviatura)</label>
                <input
                  type="text"
                  value={configDraft.symbolUrl || ''}
                  onChange={(e) => updateDraft('symbolUrl', e.target.value, 'Símbolo textual alterado')}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Ex: HO"
                />
              </div>
            </div>

            {/* Save Notice Bar */}
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
              <span className="text-xs text-zinc-400">
                {hasUnsavedChanges ? 'Existem alterações pendentes. Lembre-se de salvar.' : 'Identidade visual em dia.'}
              </span>
              <button
                onClick={handleSaveDraft}
                className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black hover:bg-amber-400"
              >
                Salvar Rascunho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PÁGINA INICIAL (HOME) */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Configuração da Página Inicial (Homepage)</h3>
              <p className="text-xs text-zinc-400">
                Gerencie todos os banners, títulos hero, vídeos de entrada e imagens do carrossel da loja.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Banner Principal (Hero) */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <label className="text-xs font-bold text-white block">Banner Principal Hero (Primeira Dobra)</label>
                <ImageInput
                  value={configDraft.bannerUrl || ''}
                  onChange={(url) => updateDraft('bannerUrl', url, 'Banner Principal alterado')}
                  mediaLibrary={mediaLibrary}
                  onRefreshMedia={onRefreshData}
                  category="Banners"
                  placeholder="Banner Principal (1920x800)..."
                />
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-semibold text-zinc-400">Título do Banner Hero</label>
                  <input
                    type="text"
                    value={configDraft.heroText || ''}
                    onChange={(e) => updateDraft('heroText', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
                  />
                  <label className="text-[11px] font-semibold text-zinc-400">Subtítulo do Banner Hero</label>
                  <textarea
                    rows={2}
                    value={configDraft.heroSubtext || ''}
                    onChange={(e) => updateDraft('heroSubtext', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Banner Secundário & Promocional */}
              <div className="space-y-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <label className="text-xs font-bold text-white block">Banner Secundário (Meio da Página)</label>
                  <ImageInput
                    value={configDraft.secondaryBannerUrl || ''}
                    onChange={(url) => updateDraft('secondaryBannerUrl', url, 'Banner Secundário alterado')}
                    mediaLibrary={mediaLibrary}
                    onRefreshMedia={onRefreshData}
                    category="Banners"
                    placeholder="Banner Secundário..."
                  />
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <label className="text-xs font-bold text-white block">Banner Promocional (Rodapé da Home)</label>
                  <ImageInput
                    value={configDraft.promoBannerUrl || ''}
                    onChange={(url) => updateDraft('promoBannerUrl', url, 'Banner Promocional alterado')}
                    mediaLibrary={mediaLibrary}
                    onRefreshMedia={onRefreshData}
                    category="Banners"
                    placeholder="Banner de Ofertas / Promocional..."
                  />
                </div>
              </div>
            </div>

            {/* Vídeo da Página Inicial */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-amber-400" />
                <span>Vídeo da Página Inicial (Loop Hero / Teaser)</span>
              </label>
              <input
                type="text"
                value={configDraft.heroVideoUrl || ''}
                onChange={(e) => updateDraft('heroVideoUrl', e.target.value, 'Vídeo da Home alterado')}
                placeholder="https://... (URL do vídeo MP4 ou embedding)"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
              />
            </div>

            {/* Carrossel de Imagens */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">Carrossel de Imagens em Destaque</label>
                <button
                  type="button"
                  onClick={() => {
                    const newArr = [...(configDraft.carouselImages || []), ''];
                    updateDraft('carouselImages', newArr);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Imagem ao Carrossel
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(configDraft.carouselImages || []).map((imgUrl, idx) => (
                  <div key={idx} className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400">Imagem #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newArr = configDraft.carouselImages?.filter((_, i) => i !== idx);
                          updateDraft('carouselImages', newArr, 'Imagem do carrossel removida');
                        }}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <ImageInput
                      value={imgUrl}
                      onChange={(url) => {
                        const newArr = [...(configDraft.carouselImages || [])];
                        newArr[idx] = url;
                        updateDraft('carouselImages', newArr, 'Imagem do carrossel alterada');
                      }}
                      mediaLibrary={mediaLibrary}
                      onRefreshMedia={onRefreshData}
                      category="Banners"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CABEÇALHO & RODAPÉ */}
      {activeTab === 'header_footer' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Configurações de Cabeçalho e Rodapé</h3>
              <p className="text-xs text-zinc-400">
                Edite os avisos do topo, redes sociais, telefones de suporte e e-mails oficiais.
              </p>
            </div>

            {/* Cabeçalho */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Top Bar & Cabeçalho</h4>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Faixa de Anúncio Superior (Tarja Preta / Destaques)
                </label>
                <input
                  type="text"
                  value={configDraft.announcementBar || ''}
                  onChange={(e) => updateDraft('announcementBar', e.target.value, 'Tarja de anúncio alterada')}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ImageInput
                  label="Logo Específica do Cabeçalho"
                  value={configDraft.headerLogoUrl || ''}
                  onChange={(url) => updateDraft('headerLogoUrl', url)}
                  mediaLibrary={mediaLibrary}
                  category="Logos"
                />

                <ImageInput
                  label="Logo Específica do Rodapé"
                  value={configDraft.footerLogoUrl || ''}
                  onChange={(url) => updateDraft('footerLogoUrl', url)}
                  mediaLibrary={mediaLibrary}
                  category="Logos"
                />
              </div>
            </div>

            {/* Rodapé & Texto Institucional */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Conteúdo Institucional do Rodapé
              </h4>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Texto "Sobre a Marca" (História da Hermano’s Outfit)
                </label>
                <textarea
                  rows={3}
                  value={configDraft.aboutText || ''}
                  onChange={(e) => updateDraft('aboutText', e.target.value, 'Texto institucional alterado')}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Rodapé Direitos Autorais e CNPJ</label>
                <input
                  type="text"
                  value={configDraft.footerText || ''}
                  onChange={(e) => updateDraft('footerText', e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
                />
              </div>

              {/* Redes Sociais */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Instagram (@handle)</label>
                  <input
                    type="text"
                    value={configDraft.instagramHandle || ''}
                    onChange={(e) => updateDraft('instagramHandle', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">WhatsApp de Vendas</label>
                  <input
                    type="text"
                    value={configDraft.whatsappNumber || ''}
                    onChange={(e) => updateDraft('whatsappNumber', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">TikTok (@handle)</label>
                  <input
                    type="text"
                    value={configDraft.tiktokHandle || ''}
                    onChange={(e) => updateDraft('tiktokHandle', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Canal do YouTube</label>
                  <input
                    type="text"
                    value={configDraft.youtubeUrl || ''}
                    onChange={(e) => updateDraft('youtubeUrl', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs text-white focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: COLEÇÕES & CATEGORIAS */}
      {activeTab === 'collections_categories' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Imagens de Coleções e Categorias</h3>
                <p className="text-xs text-zinc-400">
                  Defina imagens de capa, banners de coleção e ícones das categorias do site.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newCol: SiteCollectionItem = {
                    id: `col-${Date.now()}`,
                    name: 'Nova Coleção',
                    coverImage: '',
                    bannerImage: '',
                    description: ''
                  };
                  updateDraft('collectionsList', [...(configDraft.collectionsList || []), newCol]);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
              >
                <Plus className="h-4 w-4" />
                <span>Nova Coleção</span>
              </button>
            </div>

            {/* List of Collections */}
            <div className="space-y-4">
              {(configDraft.collectionsList || []).map((col, idx) => (
                <div key={col.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => {
                        const newCols = [...(configDraft.collectionsList || [])];
                        newCols[idx].name = e.target.value;
                        updateDraft('collectionsList', newCols);
                      }}
                      className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-bold text-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newCols = configDraft.collectionsList?.filter((_, i) => i !== idx);
                        updateDraft('collectionsList', newCols, `Coleção "${col.name}" removida`);
                      }}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ImageInput
                      label="Imagem de Capa da Coleção"
                      value={col.coverImage}
                      onChange={(url) => {
                        const newCols = [...(configDraft.collectionsList || [])];
                        newCols[idx].coverImage = url;
                        updateDraft('collectionsList', newCols, `Capa da coleção ${col.name} alterada`);
                      }}
                      mediaLibrary={mediaLibrary}
                      category="Coleções"
                    />

                    <ImageInput
                      label="Banner Principal da Coleção"
                      value={col.bannerImage}
                      onChange={(url) => {
                        const newCols = [...(configDraft.collectionsList || [])];
                        newCols[idx].bannerImage = url;
                        updateDraft('collectionsList', newCols, `Banner da coleção ${col.name} alterado`);
                      }}
                      mediaLibrary={mediaLibrary}
                      category="Coleções"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: VERSIONAMENTO & HISTÓRICO */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Histórico de Versões e Auditoria do Site</h3>
              <p className="text-xs text-zinc-400">
                Todas as alterações de imagens e layouts são salvas automaticamente. Restaure qualquer versão anterior em 1 clique.
              </p>
            </div>

            <div className="divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
              {(configDraft.versions || []).map((ver) => (
                <div key={ver.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400 text-sm">Versão v{ver.versionNumber}</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          ver.status === 'Publicado'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {ver.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(ver.savedAt).toLocaleString('pt-BR')}
                      </span>
                      <span>•</span>
                      <span>Por: {ver.savedBy}</span>
                    </div>

                    {ver.changeLog && ver.changeLog.length > 0 && (
                      <ul className="mt-2 list-disc pl-4 text-[11px] text-zinc-300 space-y-0.5">
                        {ver.changeLog.map((log, i) => (
                          <li key={i}>{log}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button
                    onClick={() => handleRestoreVersion(ver)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 shrink-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Restaurar esta Versão</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SIMULADOR E-COMMERCE EM TEMPO REAL */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <Eye className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-white">Simulador do E-Commerce Hermano's Outfit</span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-1">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  previewDevice === 'desktop' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="h-4 w-4" /> Desktop
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  previewDevice === 'tablet' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tablet className="h-4 w-4" /> Tablet
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  previewDevice === 'mobile' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-4 w-4" /> Mobile
              </button>
            </div>
          </div>

          {/* Interactive Frame Container */}
          <div className="flex justify-center bg-black/60 p-4 rounded-2xl border border-zinc-800 overflow-x-auto">
            <div
              className={`transition-all duration-300 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-5xl'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              }`}
            >
              {/* E-Commerce Top Bar Announcement */}
              <div className="bg-amber-500 px-4 py-2 text-center text-[11px] font-black tracking-wider text-black">
                {configDraft.announcementBar || 'HERMANO’S OUTFIT — DRIP & STREETWEAR'}
              </div>

              {/* Header Navigation */}
              <div className="flex items-center justify-between border-b border-zinc-800 bg-[#0a0a0c] px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  {configDraft.logoUrl ? (
                    <img src={configDraft.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                  ) : (
                    <span className="text-base font-black tracking-widest text-amber-400 uppercase">
                      {configDraft.storeName}
                    </span>
                  )}
                </div>

                {previewDevice !== 'mobile' && (
                  <div className="flex items-center gap-6 text-xs font-bold text-zinc-300">
                    <span className="hover:text-amber-400 cursor-pointer">DROP GOLD</span>
                    <span className="hover:text-amber-400 cursor-pointer">CAMISETAS</span>
                    <span className="hover:text-amber-400 cursor-pointer">CALÇAS</span>
                    <span className="hover:text-amber-400 cursor-pointer">ACESSÓRIOS</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-amber-400" />
                </div>
              </div>

              {/* Hero Banner Section */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-zinc-900">
                {configDraft.bannerUrl ? (
                  <img
                    src={configDraft.bannerUrl}
                    alt="Hero Banner"
                    className="h-full w-full object-cover opacity-80"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-600">
                    Nenhum Banner Configurado
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-6">
                  <h1 className="text-lg sm:text-2xl font-black text-white">{configDraft.heroText}</h1>
                  <p className="mt-1 text-xs text-zinc-300 max-w-xl">{configDraft.heroSubtext}</p>
                </div>
              </div>

              {/* Collections Showcase Grid */}
              {(configDraft.collectionsList || []).length > 0 && (
                <div className="p-6 border-b border-zinc-900 space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Coleções em Destaque
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {(configDraft.collectionsList || []).slice(0, 3).map((col) => (
                      <div
                        key={col.id}
                        className="group relative h-28 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
                      >
                        {col.coverImage && (
                          <img
                            src={col.coverImage}
                            alt={col.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-end p-3">
                          <span className="text-xs font-bold text-white truncate">{col.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    Lançamentos Exclusivos
                  </h3>
                  <span className="text-[11px] text-zinc-500">Ver Catálogo Completo</span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {products.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="group rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 transition-all hover:border-amber-500/40"
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
                        <img
                          src={p.photos?.[0]}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <p className="truncate text-xs font-bold text-white">{p.name}</p>
                        <p className="text-xs font-mono font-bold text-amber-400">R$ {p.sellPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Section */}
              <div className="border-t border-zinc-800 bg-[#070709] p-6 text-zinc-400 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div className="max-w-md space-y-2">
                    <span className="text-sm font-black text-amber-400 uppercase">{configDraft.storeName}</span>
                    <p className="text-xs leading-relaxed text-zinc-400">{configDraft.aboutText}</p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white">Contato & Suporte</p>
                    <p>{configDraft.contactEmail}</p>
                    <p>{configDraft.contactPhone}</p>
                    <p className="text-amber-400 font-semibold">{configDraft.instagramHandle}</p>
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-4 text-center text-[10px] text-zinc-600">
                  {configDraft.footerText}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
