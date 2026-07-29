import { AppData } from '../types';

export const initialAppData: AppData = {
  trashRetentionDays: 30,
  companyConfig: {
    name: "Hermano’s Outfit Concept Store",
    cnpj: "48.912.304/0001-98",
    phone: "(11) 98765-4321",
    email: "financeiro@hermanosoutfit.com.br",
    instagram: "@hermanos.outfit",
    address: "Rua Oscar Freire, 1020 - São Paulo, SP",
    currency: "BRL"
  },
  products: [
    {
      id: 'prod-1',
      code: 'HO-0001',
      name: 'Camiseta Oversized Heavyweight Gold Emblem',
      category: 'Camisetas',
      brand: "Hermano's Outfit",
      color: 'Preto',
      size: 'G',
      description: 'Camiseta 100% algodão fiação penteada 260g com logo bordado em fio dourado metalizado.',
      photos: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80'
      ],
      costPrice: 48.0,
      sellPrice: 149.9,
      margin: 67.98,
      stock: 18,
      initialStock: 50, // stock < 25 triggers alert (< 50% of initial)
      createdAt: '2026-07-01T10:00:00.000Z',
      updatedAt: '2026-07-20T14:30:00.000Z',
      history: [
        {
          id: 'log-p1-1',
          timestamp: '2026-07-01T10:00:00.000Z',
          dateFormatted: '01/07/2026 10:00',
          user: 'hermanosconceito',
          entity: 'Produto HO-0001',
          action: 'Criação de Produto',
          details: 'Produto cadastrado com estoque inicial de 50 unidades.'
        }
      ]
    },
    {
      id: 'prod-2',
      code: 'HO-0002',
      name: 'Calça Cargo Streetwear Tactical Black',
      category: 'Calças',
      brand: "Hermano's Outfit",
      color: 'Preto',
      size: '42',
      description: 'Calça cargo com 6 bolsos utilitários, ajuste no tornozelo e tecido ripstop impermeável.',
      photos: [
        'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80'
      ],
      costPrice: 85.0,
      sellPrice: 249.9,
      margin: 65.99,
      stock: 12,
      initialStock: 30, // alert triggers (< 15)
      createdAt: '2026-07-02T11:00:00.000Z',
      updatedAt: '2026-07-22T09:15:00.000Z',
      history: []
    },
    {
      id: 'prod-3',
      code: 'HO-0003',
      name: 'Moletom Hoodie Heavyweight Luxury Gold',
      category: 'Moletons',
      brand: "Hermano's Outfit",
      color: 'Preto',
      size: 'GG',
      description: 'Moletom 3 cabos 400g macio, capuz duplo reforçado e etiqueta em couro sintético com timbre dourado.',
      photos: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80'
      ],
      costPrice: 110.0,
      sellPrice: 299.9,
      margin: 63.32,
      stock: 8,
      initialStock: 25, // alert triggers (< 12.5)
      createdAt: '2026-07-05T14:20:00.000Z',
      updatedAt: '2026-07-25T16:00:00.000Z',
      history: []
    },
    {
      id: 'prod-4',
      code: 'HO-0004',
      name: 'Boné Dad Hat Hermano’s Monogram Gold Edition',
      category: 'Acessórios',
      brand: "Hermano's Outfit",
      color: 'Preto',
      size: 'Único',
      description: 'Boné aba curva com fivela de metal personalizada e bordado alto relevo em fios de ouro.',
      photos: [
        'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80'
      ],
      costPrice: 28.0,
      sellPrice: 89.9,
      margin: 68.85,
      stock: 45,
      initialStock: 60,
      createdAt: '2026-07-10T09:00:00.000Z',
      updatedAt: '2026-07-26T11:00:00.000Z',
      history: []
    },
    {
      id: 'prod-5',
      code: 'HO-0005',
      name: 'Jaqueta Puffer Hermano’s Thermal Shield',
      category: 'Jaquetas',
      brand: "Hermano's Outfit",
      color: 'Cinza Escuro',
      size: 'G',
      description: 'Jaqueta acolchoada térmica resistente à água, zíper selado e forro interno customizado.',
      photos: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80'
      ],
      costPrice: 160.0,
      sellPrice: 429.9,
      margin: 62.78,
      stock: 4,
      initialStock: 15, // alert! (< 7.5)
      createdAt: '2026-07-12T16:40:00.000Z',
      updatedAt: '2026-07-27T10:00:00.000Z',
      history: []
    },
    {
      id: 'prod-6',
      code: 'HO-0006',
      name: 'Camiseta Basic Minimalist Clean White',
      category: 'Camisetas',
      brand: "Hermano's Outfit",
      color: 'Branco',
      size: 'M',
      description: 'Camiseta minimalista gola alta ribana 2x1, corte estruturado e caimento reto impecável.',
      photos: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
      ],
      costPrice: 38.0,
      sellPrice: 119.9,
      margin: 68.31,
      stock: 35,
      initialStock: 40,
      createdAt: '2026-07-15T08:30:00.000Z',
      updatedAt: '2026-07-27T12:00:00.000Z',
      history: []
    }
  ],
  stockMovements: [
    {
      id: 'mv-1',
      productId: 'prod-1',
      productCode: 'HO-0001',
      productName: 'Camiseta Oversized Heavyweight Gold Emblem',
      color: 'Preto',
      size: 'G',
      type: 'ENTRADA',
      quantity: 50,
      date: '2026-07-01 10:00',
      reason: 'Compra inicial de lote HO-01',
      user: 'hermanosconceito'
    },
    {
      id: 'mv-2',
      productId: 'prod-1',
      productCode: 'HO-0001',
      productName: 'Camiseta Oversized Heavyweight Gold Emblem',
      color: 'Preto',
      size: 'G',
      type: 'SAIDA',
      quantity: 2,
      date: '2026-07-20 14:30',
      reason: 'Venda #VD-001',
      user: 'hermanosconceito'
    }
  ],
  purchases: [
    {
      id: 'CMP-2026-001',
      supplier: 'Têxtil Premium SP Indústria',
      date: '2026-07-01',
      paymentMethod: 'PIX',
      notes: 'Lote inicial de camisetas oversized e bonés com alta densidade de fios.',
      freight: 120.0,
      totalAmount: 4080.0,
      createdAt: '2026-07-01T10:00:00.000Z',
      items: [
        {
          productId: 'prod-1',
          productCode: 'HO-0001',
          productName: 'Camiseta Oversized Heavyweight Gold Emblem',
          category: 'Camisetas',
          brand: "Hermano's Outfit",
          color: 'Preto',
          size: 'G',
          quantity: 50,
          unitCost: 48.0,
          unitSellPrice: 149.9
        },
        {
          productId: 'prod-4',
          productCode: 'HO-0004',
          productName: 'Boné Dad Hat Hermano’s Monogram Gold Edition',
          category: 'Acessórios',
          brand: "Hermano's Outfit",
          color: 'Preto',
          size: 'Único',
          quantity: 60,
          unitCost: 28.0,
          unitSellPrice: 89.9
        }
      ]
    },
    {
      id: 'CMP-2026-002',
      supplier: 'Confecções Streetwear Sul',
      date: '2026-07-05',
      paymentMethod: 'Boleto',
      notes: 'Lote de moletons heavy e calças cargo ripstop.',
      freight: 180.0,
      totalAmount: 5480.0,
      createdAt: '2026-07-05T14:00:00.000Z',
      items: [
        {
          productId: 'prod-2',
          productCode: 'HO-0002',
          productName: 'Calça Cargo Streetwear Tactical Black',
          category: 'Calças',
          brand: "Hermano's Outfit",
          color: 'Preto',
          size: '42',
          quantity: 30,
          unitCost: 85.0,
          unitSellPrice: 249.9
        },
        {
          productId: 'prod-3',
          productCode: 'HO-0003',
          productName: 'Moletom Hoodie Heavyweight Luxury Gold',
          category: 'Moletons',
          brand: "Hermano's Outfit",
          color: 'Preto',
          size: 'GG',
          quantity: 25,
          unitCost: 110.0,
          unitSellPrice: 299.9
        }
      ]
    }
  ],
  sales: [
    {
      id: 'VD-2026-001',
      customerId: 'cli-1',
      customerName: 'Lucas Oliveira',
      date: '2026-07-28',
      discount: 20.0,
      freight: 0.0,
      totalAmount: 379.7,
      profitAmount: 236.7,
      paymentMethod: 'PIX',
      salesperson: 'Pedro (Hermano)',
      notes: 'Cliente fiel, entregou presencial no showroom.',
      createdAt: '2026-07-28T09:15:00.000Z',
      items: [
        {
          productId: 'prod-1',
          code: 'HO-0001',
          productName: 'Camiseta Oversized Heavyweight Gold Emblem',
          color: 'Preto',
          size: 'G',
          quantity: 1,
          unitPrice: 149.9,
          unitCost: 48.0,
          total: 149.9
        },
        {
          productId: 'prod-2',
          code: 'HO-0002',
          productName: 'Calça Cargo Streetwear Tactical Black',
          color: 'Preto',
          size: '42',
          quantity: 1,
          unitPrice: 249.9,
          unitCost: 85.0,
          total: 249.9
        }
      ]
    },
    {
      id: 'VD-2026-002',
      customerId: 'cli-2',
      customerName: 'Matheus Barbosa',
      date: '2026-07-27',
      discount: 0.0,
      freight: 25.0,
      totalAmount: 324.9,
      profitAmount: 186.9,
      paymentMethod: 'Cartão de Crédito',
      salesperson: 'Gabriel (Hermano)',
      notes: 'Envio por Sedex para o Rio de Janeiro.',
      createdAt: '2026-07-27T16:20:00.000Z',
      items: [
        {
          productId: 'prod-3',
          code: 'HO-0003',
          productName: 'Moletom Hoodie Heavyweight Luxury Gold',
          color: 'Preto',
          size: 'GG',
          quantity: 1,
          unitPrice: 299.9,
          unitCost: 110.0,
          total: 299.9
        }
      ]
    },
    {
      id: 'VD-2026-003',
      customerId: 'cli-3',
      customerName: 'Felipe Santos',
      date: '2026-07-26',
      discount: 10.0,
      freight: 0.0,
      totalAmount: 229.8,
      profitAmount: 153.8,
      paymentMethod: 'PIX',
      salesperson: 'Pedro (Hermano)',
      createdAt: '2026-07-26T14:10:00.000Z',
      items: [
        {
          productId: 'prod-1',
          code: 'HO-0001',
          productName: 'Camiseta Oversized Heavyweight Gold Emblem',
          color: 'Preto',
          size: 'G',
          quantity: 1,
          unitPrice: 149.9,
          unitCost: 48.0,
          total: 149.9
        },
        {
          productId: 'prod-4',
          code: 'HO-0004',
          productName: 'Boné Dad Hat Hermano’s Monogram Gold Edition',
          color: 'Preto',
          size: 'Único',
          quantity: 1,
          unitPrice: 89.9,
          unitCost: 28.0,
          total: 89.9
        }
      ]
    }
  ],
  customers: [
    {
      id: 'cli-1',
      name: 'Lucas Oliveira',
      phone: '(11) 98765-4321',
      email: 'lucas.oliveira@gmail.com',
      notes: 'Cliente VIP da marca. Prefere peças oversized e tom escuro.',
      totalSpent: 1250.8,
      purchaseCount: 4,
      createdAt: '2026-06-10T12:00:00.000Z',
      lastPurchaseDate: '2026-07-28'
    },
    {
      id: 'cli-2',
      name: 'Matheus Barbosa',
      phone: '(21) 99123-8877',
      email: 'm.barbosa.rj@outlook.com',
      notes: 'Conheceu a marca pelo Instagram.',
      totalSpent: 849.7,
      purchaseCount: 3,
      createdAt: '2026-06-18T15:30:00.000Z',
      lastPurchaseDate: '2026-07-27'
    },
    {
      id: 'cli-3',
      name: 'Felipe Santos',
      phone: '(11) 97111-2233',
      email: 'felipe.santos@tech.com.br',
      notes: 'Gosta de bonés e acessórios.',
      totalSpent: 519.7,
      purchaseCount: 2,
      createdAt: '2026-07-02T10:00:00.000Z',
      lastPurchaseDate: '2026-07-26'
    }
  ],
  expenses: [
    {
      id: 'EXP-001',
      category: 'Embalagens',
      description: 'Caixas personalizadas Hermano’s Outfit com acabamento fosco e fita dourada (200 un)',
      amount: 450.0,
      date: '2026-07-10',
      paymentMethod: 'PIX',
      notes: 'Garantia de unboxing premium.',
      createdAt: '2026-07-10T11:00:00.000Z'
    },
    {
      id: 'EXP-002',
      category: 'Marketing',
      description: 'Anúncios Meta Ads (Instagram Feed & Reels - Campanha Lançamento Coleção Gold)',
      amount: 800.0,
      date: '2026-07-15',
      paymentMethod: 'Cartão de Crédito',
      notes: 'Foco no público masculino de 18 a 32 anos interessado em streetwear premium.',
      createdAt: '2026-07-15T15:00:00.000Z'
    },
    {
      id: 'EXP-003',
      category: 'Equipamentos',
      description: 'Impressora de etiquetas de envio de alta velocidade + rolo de adesivos',
      amount: 620.0,
      date: '2026-07-18',
      paymentMethod: 'PIX',
      notes: 'Acelera a expedição de pedidos do site.',
      createdAt: '2026-07-18T10:20:00.000Z'
    }
  ],
  cashFlow: [
    {
      id: 'cf-1',
      date: '2026-07-28',
      type: 'ENTRADA',
      category: 'Venda',
      description: 'Venda #VD-2026-001 - Lucas Oliveira',
      amount: 379.7,
      balanceAfter: 14890.5,
      paymentMethod: 'PIX',
      referenceId: 'VD-2026-001'
    },
    {
      id: 'cf-2',
      date: '2026-07-27',
      type: 'ENTRADA',
      category: 'Venda',
      description: 'Venda #VD-2026-002 - Matheus Barbosa',
      amount: 324.9,
      balanceAfter: 14510.8,
      paymentMethod: 'Cartão',
      referenceId: 'VD-2026-002'
    },
    {
      id: 'cf-3',
      date: '2026-07-18',
      type: 'SAIDA',
      category: 'Despesa - Equipamentos',
      description: 'Impressora de etiquetas',
      amount: 620.0,
      balanceAfter: 14185.9,
      paymentMethod: 'PIX',
      referenceId: 'EXP-003'
    }
  ],
  financial: {
    accountsPayable: 1500.0,
    accountsReceivable: 3200.0,
    installments: 1200.0,
    profit: 8450.0,
    withdrawals: 2500.0,
    assetsValue: 28400.0,
    availableBalance: 14890.5
  },
  marketingCampaigns: [
    {
      id: 'mkt-1',
      title: 'Lançamento Drop Gold Emblem',
      budget: 850.0,
      spent: 850.0,
      startDate: '2026-07-15',
      endDate: '2026-07-30',
      channel: 'Instagram',
      discountCode: 'HERMANOGOLD',
      discountPercentage: 10,
      salesCount: 18,
      revenueGenerated: 2850.0,
      roas: 3.35,
      status: 'Ativa'
    }
  ],
  goals: [
    {
      id: 'goal-2026-07',
      monthYear: '2026-07',
      targetRevenue: 15000.0,
      targetProfit: 9500.0,
      targetSalesCount: 40,
      targetItemsCount: 80
    }
  ],
  calendarEvents: [
    {
      id: 'evt-1',
      title: 'Lançamento do Drop Especial de Inverno',
      date: '2026-08-05',
      time: '18:30',
      type: 'LANÇAMENTO',
      notes: 'Lançamento oficial das novas puffer jackets e moletons pesados no site e showroom.'
    },
    {
      id: 'evt-2',
      title: 'Reposição de Tecido Algodão Penteado 260g',
      date: '2026-08-02',
      time: '10:00',
      type: 'OUTROS',
      notes: 'Chegada do lote de matéria-prima na confecção fornecedora.'
    }
  ],
  tasks: [
    {
      id: 'tsk-1',
      title: 'Conferir estoque físico de camisetas HO-0001',
      assignee: 'Pedro (Hermano)',
      priority: 'ALTA',
      completed: false,
      notes: 'Verificar se todas as 18 unidades em sistema batem exatamente com as prateleiras.',
      createdAt: '2026-07-28T08:00:00.000Z'
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: '2026-07-28T09:15:00.000Z',
      dateFormatted: '28/07/2026 09:15',
      user: 'hermanosconceito',
      module: 'VENDAS',
      action: 'Nova Venda Registrada',
      details: 'Venda #VD-2026-001 realizada para Lucas Oliveira no valor de R$ 379,70 via PIX.',
      oldValue: '',
      newValue: 'R$ 379,70'
    }
  ],
  trash: [],
  siteConfig: {
    status: 'Publicado',
    lastPublishedAt: '2026-07-28T09:00:00.000Z',
    lastPublishedBy: 'Pedro (Hermano)',
    storeName: "Hermano’s Outfit",
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><circle cx="250" cy="250" r="240" fill="%23000000" stroke="%23FFFFFF" stroke-width="12"/><g fill="%23FFFFFF"><path d="M120 180 C120 160, 155 160, 175 160 C195 160, 210 165, 210 185 C210 205, 190 215, 170 215 C145 215, 120 205, 120 180 Z" stroke="%23FFFFFF" stroke-width="8" fill="none"/><path d="M130 182 C130 172, 155 172, 170 172 C185 172, 200 175, 200 188 C200 200, 185 206, 168 206 C148 206, 130 198, 130 182 Z" fill="%23000000"/><path d="M225 180 C225 165, 240 160, 260 160 C280 160, 300 165, 300 180 C300 205, 280 215, 255 215 C235 215, 225 200, 225 180 Z" stroke="%23FFFFFF" stroke-width="8" fill="none"/><path d="M233 182 C233 172, 246 172, 260 172 C274 172, 290 175, 290 188 C290 200, 276 206, 258 206 C242 206, 233 198, 233 182 Z" fill="%23000000"/><rect x="210" y="180" width="15" height="6" fill="%23FFFFFF"/><path d="M105 180 L120 180" stroke="%23FFFFFF" stroke-width="6"/><path d="M300 180 L305 180" stroke="%23FFFFFF" stroke-width="6"/><path d="M130 152 Q165 142 200 152 Q165 148 130 152 Z" fill="%23FFFFFF"/><path d="M225 152 Q260 142 295 152 Q260 148 225 152 Z" fill="%23FFFFFF"/><path d="M180 235 Q212 230 245 235 Q235 250 212 258 Q190 250 180 235 Z" fill="%23FFFFFF"/><path d="M200 242 Q212 240 224 242 Q212 248 200 242 Z" fill="%23000000"/><path d="M190 262 C185 285, 200 300, 212 305 C225 300, 240 285, 235 262 C225 280, 200 280, 190 262 Z" fill="%23FFFFFF"/><path d="M202 278 Q212 272 222 278 Q212 292 202 278 Z" fill="%23000000"/></g><line x1="320" y1="140" x2="320" y2="280" stroke="%23FFFFFF" stroke-width="4"/><g fill="%23FFFFFF"><circle cx="380" cy="185" r="32" stroke="%23FFFFFF" stroke-width="8" fill="%23000000"/><circle cx="455" cy="185" r="32" stroke="%23FFFFFF" stroke-width="8" fill="%23000000"/><line x1="412" y1="185" x2="423" y2="185" stroke="%23FFFFFF" stroke-width="6"/><path d="M352 145 Q380 135 408 145 Q380 140 352 145 Z" fill="%23FFFFFF"/><path d="M428 145 Q455 135 482 145 Q455 140 428 145 Z" fill="%23FFFFFF"/><path d="M375 238 Q418 232 460 238 Q468 258 440 258 Q418 248 395 258 Q368 258 375 238 Z" fill="%23FFFFFF"/></g><text x="250" y="360" text-anchor="middle" fill="%23FFFFFF" font-family="Arial, sans-serif" font-weight="900" font-size="42" letter-spacing="6">HERMANO&apos;S</text><text x="250" y="402" text-anchor="middle" fill="%23FFFFFF" font-family="Arial, sans-serif" font-weight="700" font-size="24" letter-spacing="12">CONCEITO</text><text x="250" y="435" text-anchor="middle" fill="%23FFFFFF" font-family="Arial, sans-serif" font-weight="600" font-size="15" letter-spacing="4">— DO BASICO AO BRABO —</text></svg>',
    profilePicUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><circle cx="250" cy="250" r="235" fill="%23000000" stroke="%23FFFFFF" stroke-width="16"/><g fill="%23FFFFFF"><path d="M100 220 C100 195, 140 195, 165 195 C190 195, 205 200, 205 225 C205 250, 180 262, 155 262 C125 262, 100 250, 100 220 Z" stroke="%23FFFFFF" stroke-width="10" fill="none"/><path d="M112 222 C112 210, 140 210, 160 210 C180 210, 194 214, 194 228 C194 242, 178 250, 156 250 C132 250, 112 240, 112 222 Z" fill="%23000000"/><path d="M225 220 C225 200, 245 195, 270 195 C295 195, 315 200, 315 220 C315 250, 290 262, 260 262 C235 262, 225 245, 225 220 Z" stroke="%23FFFFFF" stroke-width="10" fill="none"/><path d="M235 222 C235 210, 252 210, 270 210 C288 210, 303 214, 303 228 C303 242, 286 250, 264 250 C246 250, 235 240, 235 222 Z" fill="%23000000"/><rect x="205" y="220" width="20" height="8" fill="%23FFFFFF"/><path d="M115 185 Q155 172 198 185 Q155 180 115 185 Z" fill="%23FFFFFF"/><path d="M225 185 Q268 172 310 185 Q268 180 225 185 Z" fill="%23FFFFFF"/><path d="M170 288 Q210 282 250 288 Q238 308 210 318 Q182 308 170 288 Z" fill="%23FFFFFF"/><path d="M192 296 Q210 293 228 296 Q210 304 192 296 Z" fill="%23000000"/><path d="M182 322 C175 350, 195 370, 210 376 C225 370, 245 350, 238 322 C228 344, 192 344, 182 322 Z" fill="%23FFFFFF"/><path d="M198 342 Q210 334 222 342 Q210 360 198 342 Z" fill="%23000000"/></g><line x1="335" y1="175" x2="335" y2="345" stroke="%23FFFFFF" stroke-width="6"/><g fill="%23FFFFFF"><circle cx="400" cy="228" r="40" stroke="%23FFFFFF" stroke-width="10" fill="%23000000"/><circle cx="480" cy="228" r="40" stroke="%23FFFFFF" stroke-width="10" fill="%23000000"/><line x1="440" y1="228" x2="440" y2="228" stroke="%23FFFFFF" stroke-width="8"/><path d="M365 178 Q400 165 435 178 Q400 172 365 178 Z" fill="%23FFFFFF"/><path d="M445 178 Q480 165 515 178 Q480 172 445 178 Z" fill="%23FFFFFF"/><path d="M390 292 Q440 285 490 292 Q500 318 468 318 Q440 305 412 318 Q380 318 390 292 Z" fill="%23FFFFFF"/></g></svg>',
    symbolUrl: 'HO',
    emblemUrl: 'HERMANO’S CONCEITO',
    faviconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><circle cx="250" cy="250" r="235" fill="%23000000" stroke="%23FFFFFF" stroke-width="16"/><g fill="%23FFFFFF"><circle cx="400" cy="228" r="40" stroke="%23FFFFFF" stroke-width="10" fill="%23000000"/><circle cx="480" cy="228" r="40" stroke="%23FFFFFF" stroke-width="10" fill="%23000000"/><line x1="440" y1="228" x2="440" y2="228" stroke="%23FFFFFF" stroke-width="8"/></g></svg>',
    browserTabIconUrl: '',
    ogImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
    watermarkUrl: '',
    
    announcementBar: "FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 399 | PARCELE EM ATÉ 6X SEM JUROS",
    bannerUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80",
    secondaryBannerUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80",
    promoBannerUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&auto=format&fit=crop&q=80",
    heroVideoUrl: "",
    heroText: "HERMANO’S OUTFIT — GOLD EDITION 2026",
    heroSubtext: "Moda autoral streetwear com tecidos pesados de altíssima gramatura e acabamento em fio metálico.",
    carouselImages: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&auto=format&fit=crop&q=80"
    ],
    
    headerLogoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
    headerBgColor: '#0a0a0c',
    headerTextColor: '#ffffff',
    primaryColor: '#f59e0b',
    backgroundColor: '#09090b',
    fontFamily: 'Plus Jakarta Sans',
    
    footerLogoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
    aboutText: "A Hermano's Outfit é referência em streetwear premium no Brasil, unindo corte estruturado, caimento impecável e matérias-primas nobres para quem busca autenticidade sem abrir mão do luxo discreto.",
    footerText: "© 2026 Hermano's Outfit. Todos os direitos reservados. CNPJ: 48.912.304/0001-98",
    contactPhone: "(11) 98765-4321",
    contactEmail: "contato@hermanosoutfit.com.br",
    instagramHandle: "@hermanos.outfit",
    whatsappNumber: "(11) 98765-4321",
    tiktokHandle: "@hermanosoutfit",
    youtubeUrl: "https://youtube.com/@hermanosoutfit",

    collectionsList: [
      {
        id: 'col-1',
        name: 'Drop Heavyweight Gold',
        coverImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
        description: 'Algodão de 260g com fios de ouro bordados.'
      },
      {
        id: 'col-2',
        name: 'Coleção Tactical Streetwear',
        coverImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&auto=format&fit=crop&q=80',
        description: 'Utilitarismo moderno com tecidos impermeáveis ripstop.'
      },
      {
        id: 'col-3',
        name: 'Monogram Luxury Accessories',
        coverImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1200&auto=format&fit=crop&q=80',
        description: 'Acessórios de alta precisão e acabamento em metal nobre.'
      }
    ],

    categoriesList: [
      {
        id: 'cat-1',
        name: 'Camisetas',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80',
        icon: 'Shirt'
      },
      {
        id: 'cat-2',
        name: 'Calças',
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&auto=format&fit=crop&q=80',
        icon: 'Scissors'
      },
      {
        id: 'cat-3',
        name: 'Moletons',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80',
        icon: 'Smile'
      },
      {
        id: 'cat-4',
        name: 'Acessórios',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1200&auto=format&fit=crop&q=80',
        icon: 'Watch'
      }
    ],

    versions: [
      {
        id: 'v-101',
        versionNumber: 1,
        savedAt: '2026-07-28T09:00:00.000Z',
        savedBy: 'Pedro (Hermano)',
        status: 'Publicado',
        changeLog: ['Lançamento da versão inicial do site com os banners Gold Edition'],
        configSnapshot: {
          storeName: "Hermano’s Outfit",
          bannerUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80",
          announcementBar: "FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS ACIMA DE R$ 399 | PARCELE EM ATÉ 6X SEM JUROS"
        }
      }
    ]
  },
  mediaLibrary: [
    {
      id: 'med-1',
      name: 'camisa-heavyweight-front.jpg',
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      category: 'Produtos',
      size: 1420000,
      sizeFormatted: '1.42 MB',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-07-20T10:00:00.000Z',
      uploadedBy: 'hermanosconceito',
      dimensions: { width: 800, height: 1000 }
    },
    {
      id: 'med-2',
      name: 'camisa-heavyweight-back.jpg',
      url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      category: 'Produtos',
      size: 1180000,
      sizeFormatted: '1.18 MB',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-07-20T10:05:00.000Z',
      uploadedBy: 'hermanosconceito',
      dimensions: { width: 800, height: 1000 }
    },
    {
      id: 'med-3',
      name: 'calca-cargo-tactical.jpg',
      url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      category: 'Produtos',
      size: 1850000,
      sizeFormatted: '1.85 MB',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-07-21T14:20:00.000Z',
      uploadedBy: 'hermanosconceito',
      dimensions: { width: 800, height: 1000 }
    },
    {
      id: 'med-4',
      name: 'banner-hero-principal.jpg',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
      category: 'Banners',
      size: 2450000,
      sizeFormatted: '2.45 MB',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-07-22T09:15:00.000Z',
      uploadedBy: 'hermanosconceito',
      dimensions: { width: 1200, height: 600 }
    },
    {
      id: 'med-5',
      name: 'logo-oficial-hermanos.png',
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
      category: 'Logos',
      size: 380000,
      sizeFormatted: '380 KB',
      mimeType: 'image/png',
      uploadedAt: '2026-07-15T11:00:00.000Z',
      uploadedBy: 'hermanosconceito',
      dimensions: { width: 400, height: 400 }
    },
    {
      id: 'med-6',
      name: 'hoodie-luxury-gold.jpg',
      url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      category: 'Produtos',
      size: 1620000,
      sizeFormatted: '1.62 MB',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-07-25T16:00:00.000Z',
      uploadedBy: 'hermanosconceito',
      dimensions: { width: 800, height: 1000 }
    },
    {
      id: 'med-7',
      name: 'bone-dad-hat.jpg',
      url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
      category: 'Produtos',
      size: 920000,
      sizeFormatted: '920 KB',
      mimeType: 'image/jpeg',
      uploadedAt: '2026-07-26T12:00:00.000Z',
      uploadedBy: 'hermanosconceito',
      dimensions: { width: 800, height: 800 }
    }
  ]
};
