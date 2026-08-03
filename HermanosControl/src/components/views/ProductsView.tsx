import React, { useState } from 'react';
import {
  Plus,
  Search,
  Package,
  Edit3,
  Trash2,
  History,
  Image as ImageIcon,
  DollarSign,
  Tag,
  CheckCircle2,
  X,
  Upload,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { Product, AuditLogItem, MediaItem } from '../../types';
import { MediaPickerModal } from '../media/MediaPickerModal';
import { apiService } from '../../services/api';
import { EmptyStateGuideCard } from '../common/EmptyStateGuideCard';

interface ProductsViewProps {
  products: Product[];
  mediaLibrary?: MediaItem[];
  onSaveProduct: (product: Product, isEdit: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenGuideModal?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  mediaLibrary = [],
  onSaveProduct,
  onDeleteProduct,
  onOpenGuideModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Camisetas');
  const [formBrand, setFormBrand] = useState("Hermano's Outfit");
  const [formColor, setFormColor] = useState('Preto');
  const [formSize, setFormSize] = useState('G');
  const [formDescription, setFormDescription] = useState('');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState('');
  const [formCost, setFormCost] = useState<number>(0);
  const [formSell, setFormSell] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(10);

  // Auto Margin
  const computedMargin =
    formSell > 0 ? (((formSell - formCost) / formSell) * 100).toFixed(2) : '0.00';

  const categories = ['Todas', 'Camisetas', 'Calças', 'Moletons', 'Jaquetas', 'Acessórios', 'Outros'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.color.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const generateNextCode = () => {
    const numbers = products.map((p) => {
      const match = p.code.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = maxNum + 1;
    return `HO-${String(nextNum).padStart(4, '0')}`;
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Camisetas');
    setFormBrand("Hermano's Outfit");
    setFormColor('Preto');
    setFormSize('G');
    setFormDescription('');
    setFormPhotos([
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
    ]);
    setFormCost(40);
    setFormSell(120);
    setFormStock(20);
    setIsModalOpen(true);
  };

  const handleFillExampleProduct = () => {
    setEditingProduct(null);
    setFormName('Camiseta Oversized Streetwear Preta');
    setFormCategory('Camisetas');
    setFormBrand("Hermano's Outfit");
    setFormColor('Preta');
    setFormSize('M');
    setFormDescription('Camiseta 100% algodão premium fio 26.1, modelagem oversized, gola de 3cm.');
    setFormPhotos([
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
    ]);
    setFormCost(35);
    setFormSell(89.9);
    setFormStock(10);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBrand(p.brand);
    setFormColor(p.color);
    setFormSize(p.size);
    setFormDescription(p.description);
    setFormPhotos(p.photos || []);
    setFormCost(p.costPrice);
    setFormSell(p.sellPrice);
    setFormStock(p.stock);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const base64 = reader.result as string;
          const res = await apiService.uploadMediaItem(base64, file.name, 'Produtos');
          if (res.success && res.url) {
            setFormPhotos((prev) => [...prev, res.url!]);
          } else {
            setFormPhotos((prev) => [...prev, base64]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoUrl = () => {
    if (photoInput.trim()) {
      setFormPhotos((prev) => [...prev, photoInput.trim()]);
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!editingProduct;
    const code = isEdit ? editingProduct.code : generateNextCode();
    const nowIso = new Date().toISOString();

    const productObj: Product = {
      id: isEdit ? editingProduct.id : `prod-${Date.now()}`,
      code,
      name: formName,
      category: formCategory,
      brand: formBrand,
      color: formColor,
      size: formSize,
      description: formDescription,
      photos: formPhotos,
      costPrice: Number(formCost),
      sellPrice: Number(formSell),
      margin: parseFloat(computedMargin),
      stock: Number(formStock),
      initialStock: isEdit ? editingProduct.initialStock : Number(formStock),
      createdAt: isEdit ? editingProduct.createdAt : nowIso,
      updatedAt: nowIso,
      history: isEdit ? editingProduct.history : []
    };

    onSaveProduct(productObj, isEdit);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Catálogo de Produtos</h2>
          <p className="text-xs text-zinc-400">
            Cadastre peças com código automático (`HO-XXXX`), variação e fotos para o e-commerce.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 bg-[#121215] p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por código (Ex: HO-0001), nome ou cor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
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
      </div>

      {/* Products Table/Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyStateGuideCard
          title="Nenhum produto cadastrado no catálogo"
          description="Você zerou a lista ou não há itens nesta categoria. Cadastre suas roupas e camisetas reais para iniciar as vendas!"
          exampleTitle="💡 Exemplo de Cadastro de Camiseta"
          exampleContent={`• Nome: Camiseta Oversized Streetwear Preta\n• Categoria: Camisetas | Cor: Preta | Tamanho: M\n• Preço de Custo (Fornecedor): R$ 35,00\n• Preço de Venda (Cliente): R$ 89,90\n• Estoque Disponível: 10 unidades`}
          actionText="Cadastrar Meu Primeiro Produto"
          onAction={handleOpenAddModal}
          onFillExample={handleFillExampleProduct}
          onOpenGuide={onOpenGuideModal}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#121215] p-4 shadow-xl transition-all hover:border-zinc-700"
            >
              <div>
                {/* Product Photo */}
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-zinc-900">
                  <img
                    src={p.photos?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 rounded-lg bg-black/80 px-2.5 py-1 text-[10px] font-black text-amber-400 backdrop-blur-md">
                    {p.code}
                  </span>
                  <span className="absolute top-2 right-2 rounded-lg bg-zinc-900/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-md">
                    {p.category}
                  </span>
                </div>

                {/* Title & Info */}
                <h3 className="line-clamp-2 text-xs font-bold text-white">{p.name}</h3>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
                  <span>Cor: {p.color}</span>
                  <span>•</span>
                  <span>Tam: {p.size}</span>
                </div>

                {/* Price & Margin */}
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/80 pt-2">
                  <div>
                    <p className="text-[10px] text-zinc-500">Custo: R$ {p.costPrice.toFixed(2)}</p>
                    <p className="text-sm font-black text-white">R$ {p.sellPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      +{p.margin.toFixed(1)}%
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Estoque: {p.stock} un</p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 flex items-center gap-2 border-t border-zinc-800/80 pt-3">
                <button
                  onClick={() => setHistoryProduct(p)}
                  title="Histórico de Alterações"
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-white"
                >
                  <History className="h-3.5 w-3.5 text-amber-400" />
                  <span>Histórico</span>
                </button>
                <button
                  onClick={() => handleOpenEditModal(p)}
                  title="Editar Produto"
                  className="inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-zinc-300 hover:text-white"
                >
                  <Edit3 className="h-3.5 w-3.5 text-amber-400" /><span className="ml-1 text-[11px] font-medium">Editar</span>
                </button>
                <button
                  onClick={() => onDeleteProduct(p.id)}
                  title="Excluir para a Lixeira"
                  className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingProduct ? `Editar Produto (${editingProduct.code})` : 'Novo Produto Hermano’s Outfit'}
                </h3>
                <p className="text-xs text-zinc-400">Preencha todas as informações para o e-commerce e estoque.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block font-semibold text-zinc-300">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Camiseta Oversized Heavyweight Gold Emblem"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'Todas').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Marca</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Cor</label>
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    placeholder="Ex: Preto, Branco, Off-White"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Tamanho</label>
                  <input
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="Ex: P, M, G, GG, 42"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSell}
                    onChange={(e) => setFormSell(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Quantidade em Estoque</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-zinc-300">Margem Estimada Calculada</label>
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-400 font-bold">
                    <span>Lucro percentual</span>
                    <span>+{computedMargin}%</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block font-semibold text-zinc-300">Descrição Completa</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalhes de tecido, gramatura e acabamento..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Photos Section */}
              <div>
                <label className="mb-2 block font-semibold text-zinc-300">Fotos do Produto (E-Commerce)</label>
                <div className="mb-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Cole a URL da foto..."
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="rounded-xl bg-zinc-800 px-4 py-2.5 text-white font-bold hover:bg-zinc-700"
                  >
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 font-bold text-amber-400 hover:bg-amber-500/20"
                  >
                    <FolderOpen className="h-4 w-4" /> Biblioteca
                  </button>
                  <label className="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-800 px-4 py-2.5 font-bold text-zinc-300 hover:bg-zinc-700">
                    <Upload className="inline h-4 w-4 mr-1" /> Arquivo
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <MediaPickerModal
                  isOpen={isMediaPickerOpen}
                  onClose={() => setIsMediaPickerOpen(false)}
                  onSelect={(url) => setFormPhotos((prev) => [...prev, url])}
                  mediaLibrary={mediaLibrary}
                  initialCategory="Produtos"
                  title="Selecionar Fotos do Produto"
                />

                <div className="flex flex-wrap gap-2">
                  {formPhotos.map((photo, i) => (
                    <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(i)}
                        className="absolute top-0.5 right-0.5 rounded-full bg-black/80 p-0.5 text-rose-400 hover:text-rose-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
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
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Log Modal */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white">Histórico: {historyProduct.name}</h3>
              <button onClick={() => setHistoryProduct(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {historyProduct.history && historyProduct.history.length > 0 ? (
                historyProduct.history.map((log) => (
                  <div key={log.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-xs">
                    <div className="flex justify-between font-bold text-amber-400">
                      <span>{log.action}</span>
                      <span className="text-[10px] text-zinc-500">{log.dateFormatted}</span>
                    </div>
                    <p className="mt-1 text-zinc-300">{log.details}</p>
                    <p className="mt-1 text-[10px] text-zinc-500">Por: {log.user}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhum registro de alteração anterior.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
