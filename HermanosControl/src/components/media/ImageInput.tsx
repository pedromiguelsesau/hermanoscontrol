import React, { useState, useRef } from 'react';
import { Upload, FolderOpen, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { MediaItem, MediaCategory } from '../../types';
import { MediaPickerModal } from './MediaPickerModal';
import { apiService } from '../../services/api';

interface ImageInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  mediaLibrary?: MediaItem[];
  onRefreshMedia?: () => void;
  category?: MediaCategory;
  placeholder?: string;
  className?: string;
}

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  value,
  onChange,
  mediaLibrary = [],
  onRefreshMedia,
  category = 'Outros',
  placeholder = 'https://...',
  className = ''
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await apiService.uploadMediaItem(base64, file.name, category as MediaCategory);
        setIsUploading(false);
        if (res.success && res.url) {
          onChange(res.url);
          if (onRefreshMedia) onRefreshMedia();
        } else {
          alert(res.message || 'Erro ao carregar imagem');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      alert('Falha ao processar arquivo');
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-semibold text-zinc-300">{label}</label>}

      {/* Image Preview Box */}
      {value && (
        <div className="relative mb-2 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 p-2">
          <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-zinc-800 bg-black/50 shrink-0">
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-zinc-200">{value}</p>
            <p className="text-[10px] text-zinc-500">Pré-visualização da imagem vinculada</p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Control Input & Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/90 px-3 py-2 text-xs font-semibold text-zinc-200 transition-all hover:border-amber-500/50 hover:bg-zinc-800 hover:text-white"
          >
            <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
            <span>Biblioteca</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleDirectUpload}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-500/20 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            <span>{isUploading ? 'Enviando...' : 'Upload'}</span>
          </button>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        mediaLibrary={mediaLibrary}
        onRefreshMedia={onRefreshMedia}
        initialCategory={category}
        title={`Selecionar Imagem - ${category}`}
      />
    </div>
  );
};
