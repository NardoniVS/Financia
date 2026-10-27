/**
 * Modelos de dados TypeScript para o Finology
 */

export type TransactionType = 'expense' | 'income' | 'investment' | 'transfer';

export type CategoryType = 
  | 'Alimentação'
  | 'Transporte'
  | 'Moradia'
  | 'Lazer & Compras'
  | 'Saúde'
  | 'Educação'
  | 'Trabalho / Salário'
  | 'Freelance'
  | 'Vendas'
  | 'Reembolso'
  | 'Benefícios'
  | 'Investimentos'
  | 'Serviços & Assinaturas'
  | 'Cuidados pessoais'
  | 'Pets'
  | 'Viagens'
  | 'Impostos & Taxas'
  | 'Outros';

export interface Transaction {
  id: string;
  title: string;
  subtitle?: string;
  category: CategoryType;
  amount: number; // Positivo para receitas, negativo para despesas
  date: string; // ISO string
  type: TransactionType;
  accountId?: string;
  paymentMethod?: string;
  status: 'completed' | 'pending';
}

export interface BankCard {
  id: string;
  bankName: string;
  cardNumber: string; // Mascarado, ex: "•••• •••• •••• 5083"
  cardHolderName: string;
  expirationDate: string; // MM/AA
  cvv: string;
  cardBrand: 'Mastercard' | 'Visa' | 'Elo';
  cardTier?: string; // ex: "Black", "Platinum", "Infinite"
  balanceOrLimit: number;
  availableLimit: number;
  isDefault: boolean;
  themeColor: 'blue' | 'black' | 'purple' | 'emerald' | 'rose' | 'amber';
}

export interface ConnectedAccount {
  id: string;
  institutionName: string;
  institutionCode: string;
  accountType: 'Corrente' | 'Poupança' | 'Investimentos' | 'Cartão de Crédito';
  balance: number;
  lastSync: string;
  status: 'connected' | 'syncing' | 'action_required';
  logoColor: string;
}

export interface Budget {
  id: string;
  category: CategoryType;
  limit: number;
  spent: number;
  iconName: string;
  color: string;
  month: string; // ex: "Outubro 2026"
}

export type AssetCategory = 'Ações' | 'Fundos Imobiliários' | 'Renda Fixa' | 'Cripto' | 'Internacional';

export interface AssetHistoryPoint {
  date: string;
  price: number;
}

export interface InvestmentAsset {
  id: string;
  ticker: string; // ex: "PETR4", "MXRF11", "VALE3"
  name: string;
  category: AssetCategory;
  currentPrice: number;
  changePercent: number; // ex: +3.41 ou -1.80
  changeValue: number;
  quantity: number;
  averagePrice: number;
  dividendYield?: number; // ex: 8.4%
  peRatio?: number; // P/L ex: 4.8
  week52Min?: number;
  week52Max?: number;
  volume24h?: string;
  history: {
    '1D': AssetHistoryPoint[];
    '1W': AssetHistoryPoint[];
    '1M': AssetHistoryPoint[];
    '3M': AssetHistoryPoint[];
    '1Y': AssetHistoryPoint[];
    'ALL': AssetHistoryPoint[];
  };
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: string;
  changePercent: number;
  isPositive: boolean;
  subtext?: string;
}

export interface Subscription {
  id: string;
  serviceName: string;
  category: string;
  amount: number;
  nextBillingDate: string;
  billingFrequency: 'mensal' | 'anual';
  status: 'active' | 'paused';
  brandColor: string;
  isPaidThisMonth: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  birthDate: string;
  accountLevel: 'Pro' | 'Premium' | 'Gratuito';
  privacyMode: boolean; // Ocultar saldos
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'dividend' | 'budget_alert' | 'subscription' | 'security' | 'transfer';
}
