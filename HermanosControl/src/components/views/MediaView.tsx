import React, { useState, useRef } from 'react';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Filter,
  Image as ImageIcon,
  Edit2,
  Eye,
  AlertTriangle,
  HardDrive,
  Loader2,
  RefreshCw,
  X,
  FileImage,
  Tag,
  Calendar,
  User,
  Grid,
  List
} from 'lucide-react';
import { MediaItem, MediaCategory, AppData } from '../../types';
import { apiService } from '../../services/api';

interface MediaViewProps {
  data: AppData;
  onUpdateData: (newData: AppData) => void;
  onRefreshData?: () => void;
}

const CATEGORIES: (MediaCategory | 'Todos')[] = [
  'Todos',
  'Produtos',
  'Logos',
  'Banners',
  'Institucional',
  'Marketing',
  'Coleções',
  'Clientes',
  'Outros'
];

export const MediaView: React.FC<MediaViewProps> = ({ data, onUpdateData, onRefreshData }) => {
  const mediaLibrary: MediaItem[] = data.mediaLibrary || [];
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('Produtos');
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals state
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<MediaCategory>('Outros');

  // Deletion Usage Check Modal
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [usageLocations, setUsageLocations] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [itemToReplace, setItemToReplace] = useState<MediaItem | null>(null);

  // Statistics
  const totalFiles = mediaLibrary.length;
  const totalBytes = mediaLibrary.reduce((acc, curr) => acc + (curr.size || 0), 0);
  let totalSizeFormatted = `${(totalBytes / 1024).toFixed(0)} KB`;
  if (totalBytes >= 1024 * 1024) {
    totalSizeFormatted = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Handle Drag & Drop Upload
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleUploadFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFiles = async (files: File[]) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setErrorMsg(`Arquivo "${file.name}" formato não suportado. Utilize JPG, PNG, WEBP ou SVG.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(`Arquivo "${file.name}" excede o tamanho máximo de 10MB.`);
        return;
      }
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        const base64 = await fileToBase64(file);
        const res = await apiService.uploadMediaItem(
          base64,
          file.name,
          uploadCategory,
          data.companyConfig.name || 'hermanosconceito'
        );

        if (!res.success) {
          setErrorMsg(res.message || 'Erro ao enviar arquivo');
          setIsUploading(false);
          return;
        }
      }

      setIsUploading(false);
      setSuccessMsg(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err.message || 'Erro ao processar uploads');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Copy URL
  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(window.location.origin + item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Replace Image
  const handleTriggerReplace = (item: MediaItem) => {
    setItemToReplace(item);
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!itemToReplace || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const base64 = await fileToBase64(file);

    setIsUploading(true);
    const res = await apiService.uploadMediaItem(
      base64,
      itemToReplace.name,
      itemToReplace.category,
      data.companyConfig.name || 'hermanosconceito'
    );
    setIsUploading(false);

    if (res.success && res.url) {
      // Update item URL in database
      const updatedMedia = mediaLibrary.map((m) =>
        m.id === itemToReplace.id ? { ...m, url: res.url!, size: file.size } : m
      );
      onUpdateData({ ...data, mediaLibrary: updatedMedia });
      setSuccessMsg('Imagem substituída com sucesso!');
      setItemToReplace(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg('Erro ao substituir imagem.');
    }
  };

  // Check Usage before Deletion
  const handleInitiateDelete = (item: MediaItem) => {
    const usages: string[] = [];
    const url = item.url;

    // Check Products
    data.products.forEach((p) => {
      if (p.photos && p.photos.some((photo) => photo.includes(url) || url.includes(photo))) {
        usages.push(`Produto HO-${p.code || p.id}: ${p.name}`);
      }
    });

    // Check Site Config
    if (data.siteConfig) {
      if (data.siteConfig.logoUrl && data.siteConfig.logoUrl.includes(url))
        usages.push('Painel do Site: Logotipo Principal');
      if (data.siteConfig.bannerUrl && data.siteConfig.bannerUrl.includes(url))
        usages.push('Painel do Site: Banner Hero Principal');
      if (data.siteConfig.symbolUrl && data.siteConfig.symbolUrl.includes(url))
        usages.push('Painel do Site: Símbolo');
      if (data.siteConfig.emblemUrl && data.siteConfig.emblemUrl.includes(url))
        usages.push('Painel do Site: Emblema');
      if (data.siteConfig.faviconUrl && data.siteConfig.faviconUrl.includes(url))
        usages.push('Painel do Site: Favicon');
    }

    // Check Customers
    data.customers.forEach((c) => {
      if (c.email && c.email.includes(url)) usages.push(`Cliente: ${c.name}`);
    });

    setItemToDelete(item);
    setUsageLocations(usages);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    const res = await apiService.deleteMediaItem(itemToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      const updatedList = mediaLibrary.filter((m) => m.id !== itemToDelete.id);
      onUpdateData({ ...data, mediaLibrary: updatedList });
      setSuccessMsg('Imagem removida permanentemente da biblioteca.');
      setItemToDelete(null);
      setUsageLocations([]);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.message || 'Erro ao excluir mídia');
    }
  };

  // Save Edit Metadata
  const handleOpenEdit = (item: MediaItem) => {
    setEditItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    const res = await apiService.updateMediaItem(editItem.id, {
      name: editName,
      category: editCategory
    });

    if (res.success) {
      const updatedList = mediaLibrary.map((m) =>
        m.id === editItem.id ? { ...m, name: editName, category: editCategory } : m
      );
      onUpdateData({ ...data, mediaLibrary: updatedList });
      setEditItem(null);
      setSuccessMsg('Informações atualizadas com sucesso.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.message || 'Erro ao atualizar.');
    }
  };

  // Filter items
  const filteredItems = mediaLibrary.filter((item) => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFileChange}
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* Header Cards & Storage Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold text-zinc-400">Total de Imagens</p>
            <h3 className="mt-1 text-2xl font-black text-white">{totalFiles}</h3>
            <p className="mt-1 text-[11px] text-zinc-500">Cadastradas na biblioteca</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <FileImage className="h-6 w-6" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold text-zinc-400">Espaço Utilizado</p>
            <h3 className="mt-1 text-2xl font-black text-white">{totalSizeFormatted}</h3>
            <p className="mt-1 text-[11px] text-zinc-500">Armazenamento em servidor local</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <HardDrive className="h-6 w-6" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold text-zinc-400">Categorias Ativas</p>
            <h3 className="mt-1 text-2xl font-black text-white">
              {new Set(mediaLibrary.map((m) => m.category)).size}
            </h3>
            <p className="mt-1 text-[11px] text-zinc-500">Módulos integrados</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
            <Tag className="h-6 w-6" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold text-zinc-400">Formatos Aceitos</p>
            <h3 className="mt-1 text-sm font-bold text-amber-400">JPG, PNG, WEBP, SVG</h3>
            <p className="mt-1 text-[11px] text-zinc-500">Compressão & Otimização Auto</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
            <ImageIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3.5 text-xs font-medium text-red-400">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-xs font-medium text-emerald-400">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver
            ? 'border-amber-500 bg-amber-500/10 ring-4 ring-amber-500/20'
            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
          {isUploading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Upload className="h-7 w-7" />}
        </div>
        <h4 className="mt-3 text-sm font-bold text-white">Arraste e solte suas imagens aqui</h4>
        <p className="mt-1 text-xs text-zinc-400">
          Arquivos aceitos: <strong className="text-zinc-200">JPG, JPEG, PNG, WEBP, SVG</strong> (Máximo 10MB)
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500 font-semibold">Categoria de destino:</span>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
              className="bg-transparent text-amber-400 font-bold focus:outline-none"
            >
              {CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black transition-all hover:bg-amber-400 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Enviando...' : 'Selecionar do Computador'}</span>
          </button>
        </div>
      </div>

      {/* Main Filter & Media Browser Section */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl">
        {/* Controls Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-800/80 pb-5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar imagens por nome ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === 'grid' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Grade"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-1.5 transition-all ${
                  viewMode === 'list' ? 'bg-amber-500 text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="mr-1 h-3.5 w-3.5 text-zinc-500 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content View */}
        {filteredItems.length === 0 ? (
          <div className="my-12 flex flex-col items-center justify-center text-center text-zinc-500">
            <HardDrive className="h-12 w-12 text-zinc-700" />
            <p className="mt-3 text-sm font-bold text-zinc-300">Nenhuma imagem cadastrada nesta categoria</p>
            <p className="mt-1 text-xs text-zinc-600">
              Faça o upload do seu primeiro arquivo para ter acesso na biblioteca.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end justify-between p-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-amber-500 hover:text-black transition-colors"
                      title="Visualizar Imagem"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyUrl(item)}
                        className="rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-amber-500 hover:text-black transition-colors"
                        title="Copiar Link"
                      >
                        {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleInitiateDelete(item)}
                        className="rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-red-500 hover:text-white transition-colors"
                        title="Excluir Mídia"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <span className="absolute top-2 left-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 backdrop-blur-sm border border-amber-500/20">
                    {item.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="truncate text-xs font-bold text-zinc-200" title={item.name}>
                    {item.name}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{item.sizeFormatted}</span>
                    <span>{item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString('pt-BR') : ''}</span>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2 text-[11px]">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-amber-400"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleTriggerReplace(item)}
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-blue-400"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Trocar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="mt-6 divide-y divide-zinc-800/80 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-black">
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white">{item.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-400">
                        {item.category}
                      </span>
                      <span>{item.sizeFormatted}</span>
                      <span>•</span>
                      <span>{item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString('pt-BR') : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    title="Copiar URL"
                  >
                    {copiedId === item.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-amber-400"
                    title="Editar Informações"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleTriggerReplace(item)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-blue-400"
                    title="Substituir Imagem"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleInitiateDelete(item)}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Full Resolution Image Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-xl bg-black">
              <img src={previewItem.url} alt={previewItem.name} className="max-h-[75vh] w-auto object-contain" />
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2">
              <div>
                <h4 className="text-sm font-bold text-white">{previewItem.name}</h4>
                <p className="text-xs text-zinc-400">
                  Categoria: {previewItem.category} | Tamanho: {previewItem.sizeFormatted}
                </p>
              </div>
              <button
                onClick={() => handleCopyUrl(previewItem)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
              >
                <Copy className="h-4 w-4" />
                <span>Copiar Link da Imagem</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Metadata */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0e11] p-6 text-zinc-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-sm font-bold text-white">Editar Detalhes da Imagem</h3>
              <button onClick={() => setEditItem(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300">Nome do Arquivo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300">Categoria</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as MediaCategory)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-zinc-800 pt-4">
              <button
                onClick={() => setEditItem(null)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Deletion Usage Check Warning Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-[#0e0e11] p-6 text-zinc-100 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirmar Exclusão de Mídia</h3>
                <p className="text-xs text-zinc-400">Ação permanente e irreversível</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-zinc-300">
              Você está prestes a excluir o arquivo <strong className="text-amber-400">{itemToDelete.name}</strong> da biblioteca de mídia.
            </p>

            {usageLocations.length > 0 ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Atenção: Esta imagem é utilizada nos seguintes locais:</span>
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-zinc-300 font-mono text-[11px]">
                  {usageLocations.map((loc, idx) => (
                    <li key={idx}>{loc}</li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] text-amber-300/80">
                  Se você excluir a imagem agora, as exibições nesses módulos poderão ficar sem foto ou quebradas.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">
                ✓ Esta imagem não está vinculada a nenhum produto ou configuração ativa do site.
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
              <button
                onClick={() => {
                  setItemToDelete(null);
                  setUsageLocations([]);
                }}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>{isDeleting ? 'Excluindo...' : 'Excluir Definitivamente'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
