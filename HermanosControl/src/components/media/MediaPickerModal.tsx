import React, { useState, useRef } from 'react';
import { X, Search, Upload, Check, Image as ImageIcon, Filter, Loader2, HardDrive } from 'lucide-react';
import { MediaItem, MediaCategory } from '../../types';
import { apiService } from '../../services/api';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, mediaItem?: MediaItem) => void;
  mediaLibrary: MediaItem[];
  onRefreshMedia?: () => void;
  initialCategory?: MediaCategory | 'Todos';
  title?: string;
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

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  mediaLibrary = [],
  onRefreshMedia,
  initialCategory = 'Todos',
  title = 'Biblioteca de Mídia'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'Todos'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processUpload(files[0]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Formato não suportado. Por favor utilize JPG, PNG, WEBP ou SVG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('O tamanho do arquivo não pode exceder 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const uploadCategory: MediaCategory = selectedCategory !== 'Todos' ? selectedCategory : 'Produtos';
        const res = await apiService.uploadMediaItem(base64, file.name, uploadCategory);
        
        setIsUploading(false);
        if (res.success && res.url) {
          if (onRefreshMedia) onRefreshMedia();
          setSelectedUrl(res.url);
          setSelectedItem(res.media || null);
          onSelect(res.url, res.media);
          onClose();
        } else {
          setErrorMessage(res.message || 'Erro ao enviar o arquivo.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Falha ao processar arquivo.');
    }
  };

  const filteredItems = mediaLibrary.filter((item) => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl, selectedItem || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-zinc-800 bg-[#0e0e11] text-zinc-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-zinc-400">Selecione uma imagem cadastrada ou envie uma nova</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Bar (Search & Upload) */}
        <div className="flex flex-col gap-3 border-b border-zinc-800/80 bg-zinc-950/40 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black transition-all hover:bg-amber-400 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{isUploading ? 'Enviando...' : 'Fazer Upload'}</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-800/80 bg-zinc-900/30 px-6 py-2.5 scrollbar-none">
          <Filter className="mr-1 h-3.5 w-3.5 text-zinc-500 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-medium text-red-400">
            {errorMessage}
          </div>
        )}

        {/* Media Grid / Drag Target */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative flex-1 overflow-y-auto p-6 transition-all ${
            dragOver ? 'bg-amber-500/5 ring-2 ring-inset ring-amber-500' : ''
          }`}
        >
          {dragOver && (
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
              <Upload className="h-12 w-12 text-amber-400 animate-bounce" />
              <p className="mt-2 text-sm font-bold text-white">Solte o arquivo para enviar para a biblioteca</p>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500">
              <HardDrive className="h-12 w-12 text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-400">Nenhuma imagem encontrada</p>
              <p className="mt-1 text-xs text-zinc-600">
                Arraste um arquivo JPG, PNG, WEBP ou SVG aqui para enviar para a biblioteca
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-zinc-800"
              >
                Selecionar do Computador
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredItems.map((item) => {
                const isSelected = selectedUrl === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedUrl(item.url);
                      setSelectedItem(item);
                    }}
                    onDoubleClick={() => {
                      onSelect(item.url, item);
                      onClose();
                    }}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border bg-zinc-900/60 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/50'
                        : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="relative aspect-square w-full bg-zinc-950/80 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-amber-500/20 backdrop-blur-[2px]">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg">
                            <Check className="h-5 w-5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-sm">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-xs font-semibold text-zinc-200" title={item.name}>
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-zinc-500">{item.sizeFormatted}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950/60 px-6 py-4">
          <div className="text-xs text-zinc-500">
            {selectedUrl ? (
              <span className="text-amber-400 font-medium">1 imagem selecionada</span>
            ) : (
              <span>{filteredItems.length} imagens disponíveis</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedUrl}
              className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black transition-all hover:bg-amber-400 disabled:opacity-40"
            >
              Confirmar Seleção
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
