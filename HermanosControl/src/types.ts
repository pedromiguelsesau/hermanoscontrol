export type NavigationTab =
  | 'dashboard'
  | 'ai'
  | 'products'
  | 'stock'
  | 'purchases'
  | 'sales'
  | 'customers'
  | 'financial'
  | 'expenses'
  | 'cashflow'
  | 'marketing'
  | 'goals'
  | 'calendar'
  | 'tasks'
  | 'reports'
  | 'site_admin'
  | 'media'
  | 'history'
  | 'settings'
  | 'trash';

export type MediaCategory =
  | 'Produtos'
  | 'Logos'
  | 'Banners'
  | 'Institucional'
  | 'Marketing'
  | 'Coleções'
  | 'Clientes'
  | 'Outros';

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: MediaCategory;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  dimensions?: { width: number; height: number };
}

export interface User {
  username: string;
  name: string;
  role: string;
  avatar: string;
}

export interface CompanyConfig {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  instagram: string;
  address: string;
  currency: string;
}

export interface AuditLogItem {
  id: string;
  timestamp?: string;
  dateFormatted: string;
  user: string;
  module?: string;
  entity?: string;
  entityId?: string;
  action: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface Product {
  id: string;
  code: string; // HO-0001
  name: string;
  category: string;
  brand: string;
  color: string;
  size: string;
  description: string;
  photos: string[];
  costPrice: number;
  sellPrice: number;
  margin: number; // percentage
  stock: number;
  initialStock: number;
  minStockAlert?: number;
  createdAt: string;
  updatedAt: string;
  history: AuditLogItem[];
}

export interface StockMovement {
  id: string;
  productId: string;
  productCode?: string;
  productName: string;
  color?: string;
  size?: string;
  type: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  quantity: number;
  date: string;
  reason: string;
  user: string;
}

export interface PurchaseItem {
  productId?: string;
  productCode?: string;
  productName: string;
  category?: string;
  brand?: string;
  color: string;
  size: string;
  quantity: number;
  unitCost: number;
  unitSellPrice?: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  date: string;
  paymentMethod: string;
  notes: string;
  freight: number;
  totalAmount: number;
  items: PurchaseItem[];
  receiptUrl?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  code: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName: string;
  date: string;
  items: SaleItem[];
  discount: number;
  freight: number;
  totalAmount: number;
  profitAmount: number;
  paymentMethod: 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'Boleto' | string;
  salesperson: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalSpent: number;
  purchaseCount: number;
  createdAt: string;
  lastPurchaseDate?: string;
}

export type ExpenseCategory =
  | 'Embalagens'
  | 'Itens'
  | 'Frete'
  | 'Marketing'
  | 'Equipamentos'
  | 'Outros';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface CashFlowEntry {
  id: string;
  date: string;
  type: 'ENTRADA' | 'SAIDA';
  category: string;
  description: string;
  amount: number;
  balanceAfter: number;
  paymentMethod?: string;
  referenceId?: string;
}

export interface FinancialState {
  accountsPayable: number;
  accountsReceivable: number;
  installments: number;
  profit: number;
  withdrawals: number;
  assetsValue: number;
  availableBalance: number;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  channel: 'Instagram' | 'Meta Ads' | 'Influencers' | 'TikTok' | 'Outros';
  discountCode?: string;
  discountPercentage?: number;
  salesCount: number;
  revenueGenerated: number;
  roas: number;
  status: 'Ativa' | 'Pausada' | 'Finalizada';
}

export interface Goal {
  id: string;
  monthYear: string; // YYYY-MM
  targetRevenue: number;
  targetProfit: number;
  targetSalesCount: number;
  targetItemsCount: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type?: string;
  category?: string;
  notes?: string;
  description?: string;
  completed?: boolean;
}

export interface Task {
  id: string;
  title: string;
  assignee?: string;
  priority: 'ALTA' | 'MÉDIA' | 'BAIXA' | 'Alta' | 'Média' | 'Baixa';
  completed?: boolean;
  status?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface TrashItem {
  id: string;
  originalId?: string;
  type: 'PRODUTO' | 'DESPESA' | 'VENDA' | 'COMPRA' | 'CLIENTE' | 'Produto' | 'Venda' | 'Compra' | 'Cliente' | 'Despesa' | 'Tarefa' | 'Evento';
  originalName?: string;
  payload?: any;
  deletedAtFormatted?: string;
  deletedAt?: string;
  expiresAt?: string;
  description?: string;
  data?: any;
}

export interface SiteCollectionItem {
  id: string;
  name: string;
  coverImage: string;
  bannerImage: string;
  customPhoto?: string;
  description?: string;
}

export interface SiteCategoryItem {
  id: string;
  name: string;
  image: string;
  banner: string;
  icon?: string;
}

export interface SiteBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  type: 'principal' | 'secundario' | 'promocional' | 'carrossel';
  active: boolean;
}

export interface SiteVersionHistory {
  id: string;
  versionNumber: number;
  savedAt: string;
  savedBy: string;
  status: 'Rascunho' | 'Publicado';
  changeLog: string[];
  configSnapshot: any;
}

export interface SiteConfig {
  status?: 'Rascunho' | 'Publicado';
  lastPublishedAt?: string;
  lastPublishedBy?: string;
  
  // Identidade Visual
  storeName: string;
  logoUrl?: string;
  profilePicUrl?: string;
  symbolUrl?: string;
  emblemUrl?: string;
  faviconUrl?: string;
  browserTabIconUrl?: string;
  ogImageUrl?: string;
  watermarkUrl?: string;

  // Página Inicial
  announcementBar: string;
  bannerUrl: string; // Banner Principal Hero
  secondaryBannerUrl?: string;
  promoBannerUrl?: string;
  heroVideoUrl?: string;
  heroText?: string;
  heroSubtext?: string;
  carouselImages?: string[];
  featuredProductIds?: string[];

  // Cabeçalho & Estilo
  headerLogoUrl?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;

  // Rodapé & Contatos
  footerLogoUrl?: string;
  aboutText: string;
  footerText?: string;
  contactPhone?: string;
  contactEmail?: string;
  instagramHandle?: string;
  whatsappNumber?: string;
  tiktokHandle?: string;
  youtubeUrl?: string;

  // Coleções e Categorias
  collectionsList?: SiteCollectionItem[];
  categoriesList?: SiteCategoryItem[];
  banners?: SiteBannerItem[];

  // Versionamento
  versions?: SiteVersionHistory[];
}

export interface AIAnalysisResult {
  summary: string;
  stagnantProducts: string[];
  topSellers: string[];
  bottomSellers: string[];
  profitMarginAnalysis: string;
  promoSuggestions: string[];
  replenishmentForecast: string[];
  growthAnalysis: string;
  instagramCampaigns: string[];
  managementTips: string[];
  importantAlerts: string[];
  strategicInsights: string[];
}

export interface AppData {
  companyConfig: CompanyConfig;
  products: Product[];
  stockMovements: StockMovement[];
  purchases: Purchase[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
  cashFlow: CashFlowEntry[];
  financial: FinancialState;
  marketingCampaigns: MarketingCampaign[];
  goals: Goal[];
  calendarEvents: CalendarEvent[];
  tasks: Task[];
  auditLogs: AuditLogItem[];
  trash: TrashItem[];
  siteConfig: SiteConfig;
  mediaLibrary?: MediaItem[];
  trashRetentionDays?: number;
}
