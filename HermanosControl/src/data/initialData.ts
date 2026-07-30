import { AppData } from '../types';

// Empty shell — no demo/test data. Real data lives in Supabase.
export const initialAppData: AppData = {
  trashRetentionDays: 30,
  companyConfig: {
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    instagram: '',
    address: '',
    currency: 'BRL'
  },
  products: [],
  stockMovements: [],
  purchases: [],
  sales: [],
  customers: [],
  expenses: [],
  cashFlow: [],
  financial: {
    accountsPayable: 0,
    accountsReceivable: 0,
    installments: 0,
    profit: 0,
    withdrawals: 0,
    assetsValue: 0,
    availableBalance: 0
  },
  marketingCampaigns: [],
  goals: [],
  calendarEvents: [],
  tasks: [],
  auditLogs: [],
  trash: [],
  siteConfig: {
    storeName: '',
    announcementBar: '',
    bannerUrl: '',
    aboutText: ''
  },
  mediaLibrary: []
};
