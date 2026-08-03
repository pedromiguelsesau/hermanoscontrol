import React, { useState, useEffect } from 'react';
import { AppData, NavigationTab, Product, Sale, Purchase, Expense, Customer, FinancialState, Goal, CalendarEvent, Task, CompanyConfig, SiteConfig, TrashItem, AuditLogItem, User } from './types';
import { initialAppData } from './data/initialData';
import { apiService } from './services/api';

import { LoginView } from './components/auth/LoginView';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { DashboardView } from './components/views/DashboardView';
import { IAView } from './components/views/IAView';
import { ProductsView } from './components/views/ProductsView';
import { StockView } from './components/views/StockView';
import { PurchasesView } from './components/views/PurchasesView';
import { SalesView } from './components/views/SalesView';
import { CustomersView } from './components/views/CustomersView';
import { FinancialView } from './components/views/FinancialView';
import { ExpensesView } from './components/views/ExpensesView';
import { CashFlowView } from './components/views/CashFlowView';
import { MarketingView } from './components/views/MarketingView';
import { GoalsView } from './components/views/GoalsView';
import { CalendarView } from './components/views/CalendarView';
import { TasksView } from './components/views/TasksView';
import { ReportsView } from './components/views/ReportsView';
import { SiteAdminView } from './components/views/SiteAdminView';
import { MediaView } from './components/views/MediaView';
import { AuditHistoryView } from './components/views/AuditHistoryView';
import { SettingsView } from './components/views/SettingsView';
import { TrashView } from './components/views/TrashView';
import { SystemResetModal } from './components/common/SystemResetModal';
import { StepByStepGuideModal } from './components/common/StepByStepGuideModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [data, setData] = useState<AppData>(initialAppData);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Check Supabase session on load
  useEffect(() => {
    apiService.getCurrentUser().then((u) => {
      setUser(u);
      setIsAuthenticated(u !== null);
      setAuthChecked(true);
    });
  }, []);

  // Load backend data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadData = async () => {
      setIsSyncing(true);
      const backendData = await apiService.getInitialData();
      if (backendData) {
        setData(backendData);
      }
      setIsSyncing(false);
    };
    loadData();
  }, [isAuthenticated]);

  const handleLogin = async (u: string, p: string) => {
    const res = await apiService.login(u, p);
    if (res.success && res.user) {
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Sync state changes with backend
  const updateAndSaveData = async (newData: AppData) => {
    setData(newData);
    setIsSyncing(true);
    await apiService.saveData(newData);
    setIsSyncing(false);
  };

  const createAuditLog = (module: string, action: string, details: string): AuditLogItem => ({
    id: `log-${Date.now()}`,
    module,
    action,
    details,
    dateFormatted: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    user: 'Hermano Admin'
  });

  // Every cash flow entry carries a running balance, so editing or removing one
  // invalidates the balance of every entry after it. Rebuilding the whole chain
  // from the oldest entry is simpler and safer than patching it in place.
  // The list is stored newest-first, hence the backwards walk.
  const OPENING_BALANCE = 5000;
  const recalcCashFlow = (entries: AppData['cashFlow']) => {
    const out = [...entries];
    let balance = OPENING_BALANCE;
    for (let i = out.length - 1; i >= 0; i--) {
      balance += out[i].type === 'ENTRADA' ? out[i].amount : -out[i].amount;
      out[i] = { ...out[i], balanceAfter: balance };
    }
    return out;
  };

  // Sales, purchases and expenses each own one cash flow entry, linked by
  // referenceId. Editing the source record rewrites that entry; deleting it
  // drops the entry, so the balance never keeps a value with nothing behind it.
  const replaceCashEntry = (
    entries: AppData['cashFlow'],
    referenceId: string,
    replacement: AppData['cashFlow'][number] | null
  ) => {
    const without = entries.filter((c) => c.referenceId !== referenceId);
    if (!replacement) return recalcCashFlow(without);
    const at = entries.findIndex((c) => c.referenceId === referenceId);
    const next = [...without];
    next.splice(at === -1 ? 0 : at, 0, replacement);
    return recalcCashFlow(next);
  };

  // System Reset Handlers
  const handleResetProducts = () => {
    const log = createAuditLog('PRODUTOS', 'RESET_PRODUTOS', 'Catálogo de produtos e estoque zerados pelo usuário.');
    updateAndSaveData({
      ...data,
      products: [],
      stockMovements: [],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  const handleResetFinancials = () => {
    const log = createAuditLog('FINANCEIRO', 'RESET_FINANCEIRO', 'Histórico de vendas, compras, despesas e caixa zerados.');
    updateAndSaveData({
      ...data,
      sales: [],
      purchases: [],
      expenses: [],
      cashFlow: [],
      financial: {
        ...data.financial,
        caixaAtual: 0,
        bancoAtual: 0,
        aReceber: 0,
        aPagar: 0,
        faturamentoMes: 0,
        lucroLiquidoMes: 0
      },
      goals: [],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  const handleResetComplete = () => {
    const log = createAuditLog('SISTEMA', 'RESET_SISTEMA_COMPLETO', 'Sistema zerado por completo pelo administrador. Pronto para início do zero.');
    updateAndSaveData({
      ...data,
      products: [],
      stockMovements: [],
      sales: [],
      purchases: [],
      expenses: [],
      customers: [],
      cashFlow: [],
      financial: {
        ...data.financial,
        caixaAtual: 0,
        bancoAtual: 0,
        aReceber: 0,
        aPagar: 0,
        faturamentoMes: 0,
        lucroLiquidoMes: 0
      },
      goals: [],
      tasks: [],
      calendarEvents: [],
      trash: [],
      marketingCampaigns: [],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // Product Actions
  const handleSaveProduct = (product: Product, isEdit: boolean) => {
    let updatedProducts = [...data.products];
    if (isEdit) {
      updatedProducts = updatedProducts.map((p) => (p.id === product.id ? product : p));
    } else {
      updatedProducts.unshift(product);
    }

    const log = createAuditLog(
      'PRODUTOS',
      isEdit ? 'ALTERAÇÃO_PRODUTO' : 'CADASTRO_PRODUTO',
      `Produto ${product.code} (${product.name}) ${isEdit ? 'atualizado' : 'cadastrado'}.`
    );

    updateAndSaveData({
      ...data,
      products: updatedProducts,
      auditLogs: [log, ...data.auditLogs]
    });
  };

  const handleDeleteProduct = (productId: string) => {
    const prod = data.products.find((p) => p.id === productId);
    if (!prod) return;

    const trashItem: TrashItem = {
      id: `trash-${Date.now()}`,
      type: 'PRODUTO',
      originalId: prod.id,
      originalName: `${prod.code} - ${prod.name}`,
      payload: prod,
      deletedAtFormatted: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedProducts = data.products.filter((p) => p.id !== productId);
    const log = createAuditLog('PRODUTOS', 'EXCLUSÃO_PRODUTO', `Produto ${prod.code} movido para a lixeira.`);

    updateAndSaveData({
      ...data,
      products: updatedProducts,
      trash: [trashItem, ...data.trash],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // Stock Adjustment
  const handleAdjustStock = (
    productId: string,
    type: 'ENTRADA' | 'SAIDA' | 'AJUSTE',
    quantity: number,
    reason: string
  ) => {
    const prod = data.products.find((p) => p.id === productId);
    if (!prod) return;

    let newStock = prod.stock;
    if (type === 'ENTRADA') newStock += quantity;
    else if (type === 'SAIDA') newStock = Math.max(0, newStock - quantity);
    else if (type === 'AJUSTE') newStock = quantity;

    const updatedProducts = data.products.map((p) =>
      p.id === productId ? { ...p, stock: newStock, updatedAt: new Date().toISOString() } : p
    );

    const movement = {
      id: `mv-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      type,
      quantity,
      reason,
      date: new Date().toISOString().split('T')[0],
      user: 'Hermano Admin'
    };

    const log = createAuditLog('ESTOQUE', 'AJUSTE_ESTOQUE', `${type} de ${quantity} un no produto ${prod.code}. Motivo: ${reason}`);

    updateAndSaveData({
      ...data,
      products: updatedProducts,
      stockMovements: [movement, ...data.stockMovements],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // Purchase Action
  const handleAddPurchase = (purchase: Purchase) => {
    // 1. Update/Add Products Stock
    const updatedProducts = [...data.products];
    purchase.items.forEach((item) => {
      const existing = updatedProducts.find(
        (p) =>
          p.name.toLowerCase() === item.productName.toLowerCase() &&
          p.color.toLowerCase() === item.color.toLowerCase() &&
          p.size.toLowerCase() === item.size.toLowerCase()
      );

      if (existing) {
        existing.stock += item.quantity;
        existing.costPrice = item.unitCost;
        if (item.unitSellPrice) existing.sellPrice = item.unitSellPrice;
      } else {
        const nextCode = `HO-${String(updatedProducts.length + 1).padStart(4, '0')}`;
        updatedProducts.unshift({
          id: `prod-${Date.now()}-${Math.random()}`,
          code: nextCode,
          name: item.productName,
          category: item.category || 'Camisetas',
          brand: item.brand || "Hermano's Outfit",
          color: item.color,
          size: item.size,
          description: 'Cadastrado automaticamente via Compra de Lote.',
          photos: [
            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
          ],
          costPrice: item.unitCost,
          sellPrice: item.unitSellPrice || item.unitCost * 2.5,
          margin: 60,
          stock: item.quantity,
          initialStock: item.quantity,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: []
        });
      }
    });

    // 2. Cash Flow Entry
    const lastBalance = data.cashFlow.length > 0 ? data.cashFlow[0].balanceAfter : 5000;
    const newBalance = lastBalance - purchase.totalAmount;

    const cashEntry = {
      id: `cf-${Date.now()}`,
      date: purchase.date,
      type: 'SAIDA' as const,
      category: 'Compra de Estoque / Lote',
      description: `Compra Lote ${purchase.id} - Fornecedor: ${purchase.supplier}`,
      amount: purchase.totalAmount,
      balanceAfter: newBalance,
      referenceId: purchase.id
    };

    const log = createAuditLog('COMPRAS', 'NOVA_COMPRA', `Lançamento de lote ${purchase.id} no valor de R$ ${purchase.totalAmount.toFixed(2)}.`);

    updateAndSaveData({
      ...data,
      purchases: [purchase, ...data.purchases],
      products: updatedProducts,
      cashFlow: [cashEntry, ...data.cashFlow],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // Sale Action
  const handleAddSale = (sale: Sale) => {
    // 1. Decrement Stock
    const updatedProducts = [...data.products];
    sale.items.forEach((cartItem) => {
      const prod = updatedProducts.find((p) => p.id === cartItem.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - cartItem.quantity);
      }
    });

    // 2. Update Customer
    const updatedCustomers = [...data.customers];
    if (sale.customerId) {
      const cli = updatedCustomers.find((c) => c.id === sale.customerId);
      if (cli) {
        cli.purchaseCount += 1;
        cli.totalSpent += sale.totalAmount;
      }
    }

    // 3. Cash Flow Entry
    const lastBalance = data.cashFlow.length > 0 ? data.cashFlow[0].balanceAfter : 5000;
    const newBalance = lastBalance + sale.totalAmount;

    const cashEntry = {
      id: `cf-${Date.now()}`,
      date: sale.date,
      type: 'ENTRADA' as const,
      category: 'Venda de Produtos',
      description: `Venda ${sale.id} - Cliente: ${sale.customerName}`,
      amount: sale.totalAmount,
      balanceAfter: newBalance,
      referenceId: sale.id
    };

    const log = createAuditLog('VENDAS', 'NOVA_VENDA', `Venda ${sale.id} no valor de R$ ${sale.totalAmount.toFixed(2)} realizada por ${sale.salesperson}.`);

    updateAndSaveData({
      ...data,
      sales: [sale, ...data.sales],
      products: updatedProducts,
      customers: updatedCustomers,
      cashFlow: [cashEntry, ...data.cashFlow],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // Expense Action
  const handleAddExpense = (expense: Expense) => {
    const lastBalance = data.cashFlow.length > 0 ? data.cashFlow[0].balanceAfter : 5000;
    const newBalance = lastBalance - expense.amount;

    const cashEntry = {
      id: `cf-${Date.now()}`,
      date: expense.date,
      type: 'SAIDA' as const,
      category: `Despesa: ${expense.category}`,
      description: expense.description,
      amount: expense.amount,
      balanceAfter: newBalance,
      referenceId: expense.id
    };

    const log = createAuditLog('DESPESAS', 'NOVA_DESPESA', `Despesa ${expense.description} de R$ ${expense.amount.toFixed(2)} lançada.`);

    updateAndSaveData({
      ...data,
      expenses: [expense, ...data.expenses],
      cashFlow: [cashEntry, ...data.cashFlow],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  const handleEditExpense = (expense: Expense) => {
    const old = data.expenses.find((e) => e.id === expense.id);
    if (!old) return;

    const cashEntry = {
      id: `cf-${expense.id}`,
      date: expense.date,
      type: 'SAIDA' as const,
      category: `Despesa: ${expense.category}`,
      description: expense.description,
      amount: expense.amount,
      balanceAfter: 0, // recalculated by replaceCashEntry
      referenceId: expense.id
    };

    const log = createAuditLog(
      'DESPESAS',
      'ALTERAÇÃO_DESPESA',
      `Despesa ${expense.description} alterada de R$ ${old.amount.toFixed(2)} para R$ ${expense.amount.toFixed(2)}.`
    );

    updateAndSaveData({
      ...data,
      expenses: data.expenses.map((e) => (e.id === expense.id ? expense : e)),
      cashFlow: replaceCashEntry(data.cashFlow, expense.id, cashEntry),
      auditLogs: [log, ...data.auditLogs]
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    const exp = data.expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    const trashItem: TrashItem = {
      id: `trash-${Date.now()}`,
      type: 'DESPESA',
      originalId: exp.id,
      originalName: exp.description,
      payload: exp,
      deletedAtFormatted: new Date().toLocaleDateString('pt-BR')
    };

    const log = createAuditLog('DESPESAS', 'EXCLUSÃO_DESPESA', `Despesa ${exp.description} movida para lixeira.`);

    updateAndSaveData({
      ...data,
      expenses: data.expenses.filter((e) => e.id !== expenseId),
      // The matching cash flow entry has to go too, otherwise the balance keeps
      // subtracting an expense that no longer exists.
      cashFlow: replaceCashEntry(data.cashFlow, expenseId, null),
      trash: [trashItem, ...data.trash],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // --- Sale edit / delete ---
  // Both work the same way: undo the stock and customer effects the original
  // sale caused, then apply the new ones (or none, when deleting).
  const applySaleEffects = (
    products: Product[],
    customers: Customer[],
    sale: Sale,
    direction: 1 | -1
  ) => {
    const nextProducts = products.map((p) => ({ ...p }));
    sale.items.forEach((item) => {
      const prod = nextProducts.find((p) => p.id === item.productId);
      // direction -1 = sale applied (stock leaves), +1 = sale undone (stock returns)
      if (prod) prod.stock = Math.max(0, prod.stock + direction * item.quantity);
    });

    const nextCustomers = customers.map((c) => ({ ...c }));
    if (sale.customerId) {
      const cli = nextCustomers.find((c) => c.id === sale.customerId);
      if (cli) {
        cli.purchaseCount = Math.max(0, cli.purchaseCount - direction);
        cli.totalSpent = Math.max(0, cli.totalSpent - direction * sale.totalAmount);
      }
    }
    return { nextProducts, nextCustomers };
  };

  const handleEditSale = (sale: Sale) => {
    const old = data.sales.find((s) => s.id === sale.id);
    if (!old) return;

    const undone = applySaleEffects(data.products, data.customers, old, 1);
    const redone = applySaleEffects(undone.nextProducts, undone.nextCustomers, sale, -1);

    const cashEntry = {
      id: `cf-${sale.id}`,
      date: sale.date,
      type: 'ENTRADA' as const,
      category: 'Venda de Produtos',
      description: `Venda ${sale.id} - Cliente: ${sale.customerName}`,
      amount: sale.totalAmount,
      balanceAfter: 0,
      referenceId: sale.id
    };

    const log = createAuditLog(
      'VENDAS',
      'ALTERAÇÃO_VENDA',
      `Venda ${sale.id} alterada de R$ ${old.totalAmount.toFixed(2)} para R$ ${sale.totalAmount.toFixed(2)}. Estoque e cliente reajustados.`
    );

    updateAndSaveData({
      ...data,
      sales: data.sales.map((s) => (s.id === sale.id ? sale : s)),
      products: redone.nextProducts,
      customers: redone.nextCustomers,
      cashFlow: replaceCashEntry(data.cashFlow, sale.id, cashEntry),
      auditLogs: [log, ...data.auditLogs]
    });
  };

  const handleDeleteSale = (saleId: string) => {
    const sale = data.sales.find((s) => s.id === saleId);
    if (!sale) return;

    const { nextProducts, nextCustomers } = applySaleEffects(data.products, data.customers, sale, 1);

    const trashItem: TrashItem = {
      id: `trash-${Date.now()}`,
      type: 'VENDA',
      originalId: sale.id,
      originalName: `Venda ${sale.id} - ${sale.customerName}`,
      payload: sale,
      deletedAtFormatted: new Date().toLocaleDateString('pt-BR')
    };

    const log = createAuditLog('VENDAS', 'EXCLUSÃO_VENDA', `Venda ${sale.id} de R$ ${sale.totalAmount.toFixed(2)} movida para lixeira. Estoque devolvido.`);

    updateAndSaveData({
      ...data,
      sales: data.sales.filter((s) => s.id !== saleId),
      products: nextProducts,
      customers: nextCustomers,
      cashFlow: replaceCashEntry(data.cashFlow, saleId, null),
      trash: [trashItem, ...data.trash],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // --- Purchase (lote) edit / delete ---
  // A purchase only ever adds stock to products matched by name/color/size, so
  // undoing one subtracts the same quantities back out.
  const applyPurchaseStock = (products: Product[], purchase: Purchase, direction: 1 | -1) => {
    const next = products.map((p) => ({ ...p }));
    purchase.items.forEach((item) => {
      const prod = next.find(
        (p) =>
          p.name.toLowerCase() === item.productName.toLowerCase() &&
          p.color.toLowerCase() === item.color.toLowerCase() &&
          p.size.toLowerCase() === item.size.toLowerCase()
      );
      if (prod) prod.stock = Math.max(0, prod.stock + direction * item.quantity);
    });
    return next;
  };

  const handleEditPurchase = (purchase: Purchase) => {
    const old = data.purchases.find((p) => p.id === purchase.id);
    if (!old) return;

    const undone = applyPurchaseStock(data.products, old, -1);
    const redone = applyPurchaseStock(undone, purchase, 1);

    const cashEntry = {
      id: `cf-${purchase.id}`,
      date: purchase.date,
      type: 'SAIDA' as const,
      category: 'Compra de Estoque / Lote',
      description: `Compra Lote ${purchase.id} - Fornecedor: ${purchase.supplier}`,
      amount: purchase.totalAmount,
      balanceAfter: 0,
      referenceId: purchase.id
    };

    const log = createAuditLog(
      'COMPRAS',
      'ALTERAÇÃO_COMPRA',
      `Lote ${purchase.id} alterado de R$ ${old.totalAmount.toFixed(2)} para R$ ${purchase.totalAmount.toFixed(2)}. Estoque reajustado.`
    );

    updateAndSaveData({
      ...data,
      purchases: data.purchases.map((p) => (p.id === purchase.id ? purchase : p)),
      products: redone,
      cashFlow: replaceCashEntry(data.cashFlow, purchase.id, cashEntry),
      auditLogs: [log, ...data.auditLogs]
    });
  };

  const handleDeletePurchase = (purchaseId: string) => {
    const purchase = data.purchases.find((p) => p.id === purchaseId);
    if (!purchase) return;

    const trashItem: TrashItem = {
      id: `trash-${Date.now()}`,
      type: 'COMPRA',
      originalId: purchase.id,
      originalName: `Lote ${purchase.id} - ${purchase.supplier}`,
      payload: purchase,
      deletedAtFormatted: new Date().toLocaleDateString('pt-BR')
    };

    const log = createAuditLog('COMPRAS', 'EXCLUSÃO_COMPRA', `Lote ${purchase.id} de R$ ${purchase.totalAmount.toFixed(2)} movido para lixeira. Estoque estornado.`);

    updateAndSaveData({
      ...data,
      purchases: data.purchases.filter((p) => p.id !== purchaseId),
      products: applyPurchaseStock(data.products, purchase, -1),
      cashFlow: replaceCashEntry(data.cashFlow, purchaseId, null),
      trash: [trashItem, ...data.trash],
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // --- Stock movement edit / delete ---
  // ENTRADA and SAIDA carry a reversible delta. AJUSTE sets the stock to an
  // absolute number and the movement never recorded what it was before, so its
  // quantity cannot be undone — the views only let the reason be edited there.
  const movementDelta = (m: { type: string; quantity: number }) =>
    m.type === 'ENTRADA' ? m.quantity : m.type === 'SAIDA' ? -m.quantity : 0;

  const handleEditStockMovement = (movement: AppData['stockMovements'][number]) => {
    const old = data.stockMovements.find((m) => m.id === movement.id);
    if (!old) return;

    const delta = movementDelta(movement) - movementDelta(old);
    const updatedProducts = data.products.map((p) =>
      p.id === movement.productId
        ? { ...p, stock: Math.max(0, p.stock + delta), updatedAt: new Date().toISOString() }
        : p
    );

    const log = createAuditLog(
      'ESTOQUE',
      'ALTERAÇÃO_MOVIMENTO',
      `Movimento ${movement.id} do produto ${movement.productName} alterado (${old.type} ${old.quantity} → ${movement.type} ${movement.quantity}).`
    );

    updateAndSaveData({
      ...data,
      products: updatedProducts,
      stockMovements: data.stockMovements.map((m) => (m.id === movement.id ? movement : m)),
      auditLogs: [log, ...data.auditLogs]
    });
  };

  const handleDeleteStockMovement = (movementId: string) => {
    const mv = data.stockMovements.find((m) => m.id === movementId);
    if (!mv) return;

    const updatedProducts = data.products.map((p) =>
      p.id === mv.productId
        ? { ...p, stock: Math.max(0, p.stock - movementDelta(mv)), updatedAt: new Date().toISOString() }
        : p
    );

    const log = createAuditLog('ESTOQUE', 'EXCLUSÃO_MOVIMENTO', `Movimento ${mv.type} de ${mv.quantity} un do produto ${mv.productName} excluído. Estoque estornado.`);

    updateAndSaveData({
      ...data,
      products: updatedProducts,
      stockMovements: data.stockMovements.filter((m) => m.id !== movementId),
      auditLogs: [log, ...data.auditLogs]
    });
  };

  // Trash Restore & Delete
  const handleRestoreTrashItem = (trashId: string) => {
    const item = data.trash.find((t) => t.id === trashId);
    if (!item) return;

    if (item.type === 'PRODUTO') {
      updateAndSaveData({
        ...data,
        products: [item.payload, ...data.products],
        trash: data.trash.filter((t) => t.id !== trashId)
      });
    } else if (item.type === 'DESPESA') {
      updateAndSaveData({
        ...data,
        expenses: [item.payload, ...data.expenses],
        trash: data.trash.filter((t) => t.id !== trashId)
      });
    }
  };

  const handlePermanentDeleteTrashItem = (trashId: string) => {
    updateAndSaveData({
      ...data,
      trash: data.trash.filter((t) => t.id !== trashId)
    });
  };

  const lowStockCount = data.products.filter((p) => p.stock < p.initialStock / 2).length;
  const trashCount = data.trash.length;
  const pendingTasksCount = data.tasks.filter((t) => !t.completed).length;

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans antialiased selection:bg-amber-500 selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNavigate={setActiveTab}
        lowStockCount={lowStockCount}
        trashCount={trashCount}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden md:pl-64">
        {/* Top Header Controls */}
        <Header
          user={user}
          activeTab={activeTab}
          onLogout={handleLogout}
          lowStockCount={lowStockCount}
          uncompletedTasksCount={pendingTasksCount}
          onNavigate={setActiveTab}
          onOpenBackupModal={() => setActiveTab('settings')}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
          isSyncing={isSyncing}
          onSync={async () => {
            setIsSyncing(true);
            await apiService.saveData(data);
            setIsSyncing(false);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'dashboard' && (
              <DashboardView
                data={data}
                onNavigate={setActiveTab}
                onOpenResetModal={() => setIsResetModalOpen(true)}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
              />
            )}
            {activeTab === 'ai' && <IAView data={data} />}
            {activeTab === 'products' && (
              <ProductsView
                products={data.products}
                mediaLibrary={data.mediaLibrary}
                onSaveProduct={handleSaveProduct}
                onDeleteProduct={handleDeleteProduct}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
              />
            )}
            {activeTab === 'stock' && (
              <StockView
                products={data.products}
                movements={data.stockMovements}
                onAdjustStock={handleAdjustStock}
                onEditMovement={handleEditStockMovement}
                onDeleteMovement={handleDeleteStockMovement}
              />
            )}
            {activeTab === 'purchases' && (
              <PurchasesView
                purchases={data.purchases}
                products={data.products}
                onAddPurchase={handleAddPurchase}
                onEditPurchase={handleEditPurchase}
                onDeletePurchase={handleDeletePurchase}
              />
            )}
            {activeTab === 'sales' && (
              <SalesView
                sales={data.sales}
                products={data.products}
                customers={data.customers}
                onAddSale={handleAddSale}
                onEditSale={handleEditSale}
                onDeleteSale={handleDeleteSale}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
              />
            )}
            {activeTab === 'customers' && (
              <CustomersView
                customers={data.customers}
                sales={data.sales}
                onAddCustomer={(newCli) => updateAndSaveData({ ...data, customers: [newCli, ...data.customers] })}
              />
            )}
            {activeTab === 'financial' && (
              <FinancialView
                financial={data.financial}
                cashFlow={data.cashFlow}
                sales={data.sales}
                expenses={data.expenses}
                onUpdateFinancial={(up) =>
                  updateAndSaveData({ ...data, financial: { ...data.financial, ...up } })
                }
              />
            )}
            {activeTab === 'expenses' && (
              <ExpensesView
                expenses={data.expenses}
                onAddExpense={handleAddExpense}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
              />
            )}
            {activeTab === 'cashflow' && <CashFlowView cashFlow={data.cashFlow} />}
            {activeTab === 'marketing' && (
              <MarketingView
                campaigns={data.marketingCampaigns}
                onAddCampaign={(camp) => updateAndSaveData({ ...data, marketingCampaigns: [camp, ...data.marketingCampaigns] })}
              />
            )}
            {activeTab === 'goals' && (
              <GoalsView
                goals={data.goals}
                sales={data.sales}
                onSaveGoal={(goal) => {
                  const updatedGoals = data.goals.filter((g) => g.monthYear !== goal.monthYear);
                  updateAndSaveData({ ...data, goals: [goal, ...updatedGoals] });
                }}
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarView
                events={data.calendarEvents}
                onAddEvent={(evt) => updateAndSaveData({ ...data, calendarEvents: [evt, ...data.calendarEvents] })}
              />
            )}
            {activeTab === 'tasks' && (
              <TasksView
                tasks={data.tasks}
                onAddTask={(tk) => updateAndSaveData({ ...data, tasks: [tk, ...data.tasks] })}
                onToggleTask={(id) => {
                  const updated = data.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
                  updateAndSaveData({ ...data, tasks: updated });
                }}
              />
            )}
            {activeTab === 'reports' && <ReportsView data={data} />}
            {activeTab === 'site_admin' && (
              <SiteAdminView
                siteConfig={data.siteConfig}
                products={data.products}
                mediaLibrary={data.mediaLibrary}
                onUpdateSiteConfig={(sc) => updateAndSaveData({ ...data, siteConfig: sc })}
                onRefreshData={async () => {
                  const fresh = await apiService.getInitialData();
                  if (fresh) setData(fresh);
                }}
              />
            )}
            {activeTab === 'media' && (
              <MediaView
                data={data}
                onUpdateData={updateAndSaveData}
                onRefreshData={async () => {
                  const fresh = await apiService.getInitialData();
                  if (fresh) setData(fresh);
                }}
              />
            )}
            {activeTab === 'history' && <AuditHistoryView logs={data.auditLogs} />}
            {activeTab === 'settings' && (
              <SettingsView
                companyConfig={data.companyConfig}
                data={data}
                onUpdateCompany={(c) => updateAndSaveData({ ...data, companyConfig: c })}
                onRestoreData={(restored) => updateAndSaveData(restored)}
                onOpenResetModal={() => setIsResetModalOpen(true)}
                onOpenGuideModal={() => setIsGuideModalOpen(true)}
              />
            )}
            {activeTab === 'trash' && (
              <TrashView
                trash={data.trash}
                onRestoreTrashItem={handleRestoreTrashItem}
                onPermanentDeleteTrashItem={handlePermanentDeleteTrashItem}
              />
            )}
          </div>
        </main>
      </div>

      {/* System Reset Modal */}
      <SystemResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetProducts={handleResetProducts}
        onResetFinancials={handleResetFinancials}
        onResetComplete={handleResetComplete}
      />

      {/* Step by Step Guide Modal */}
      <StepByStepGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onNavigate={setActiveTab}
        onOpenResetModal={() => setIsResetModalOpen(true)}
      />
    </div>
  );
}
