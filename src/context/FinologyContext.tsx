import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { getAuthRedirectUrl, getSupabase, supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import {
  Transaction,
  BankCard,
  ConnectedAccount,
  Budget,
  InvestmentAsset,
  MarketIndex,
  Subscription,
  UserProfile,
  NotificationItem,
} from '../types/finology';

interface FinologyContextType {
  // Theme & App Settings
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setSpecificTheme: (theme: 'light' | 'dark') => void;
  isSystemTheme: boolean;
  resetToSystemTheme: () => void;
  viewMode: 'mobile' | 'responsive';
  toggleViewMode: () => void;
  privacyMode: boolean;
  togglePrivacyMode: () => void;

  // Active Views & Navigation
  activeTopTab: 'manage' | 'invest';
  setActiveTopTab: (tab: 'manage' | 'invest') => void;
  activeBottomTab: string;
  setActiveBottomTab: (tab: string) => void;

  // Auth & User Profile
  currentUser: SupabaseUser | null;
  isAdmin: boolean;
  isAuthReady: boolean;
  isAuthenticated: boolean;
  isPasswordRecovery: boolean;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateAccountProfile: (values: { name: string; email: string; birthDate: string; password?: string }) => Promise<boolean>;
  uploadProfileAvatar: (file: File) => Promise<void>;
  deleteAccount: () => Promise<void>;
  userProfile: UserProfile;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  authError: string | null;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Cards & Accounts
  cards: BankCard[];
  addCard: (card: Omit<BankCard, 'id'>) => void;
  setDefaultCard: (id: string) => void;
  connectedAccounts: ConnectedAccount[];
  syncAccount: (id: string) => Promise<void>;
  isSyncingAccount: boolean;
  connectNewBank: (bankName: string, bankCode: string, initialBalance: number, color: string) => void;

  // Budgets
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudgetLimit: (id: string, newLimit: number) => void;

  // Subscriptions
  subscriptions: Subscription[];
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  paySubscription: (id: string) => void;

  // Investments
  assets: InvestmentAsset[];
  marketIndices: MarketIndex[];
  selectedAsset: InvestmentAsset | null;
  setSelectedAsset: (asset: InvestmentAsset | null) => void;
  tradeAsset: (assetId: string, quantity: number, type: 'buy' | 'sell') => boolean;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Financial Metrics & Summaries
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalInvested: number;
  totalInvestedProfit: number;
  totalInvestedProfitPercent: number;

  // Modals Control
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isAddCardModalOpen: boolean;
  setIsAddCardModalOpen: (open: boolean) => void;
  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAddBudgetOpen: boolean;
  setIsAddBudgetOpen: (open: boolean) => void;
  isConnectBankModalOpen: boolean;
  setIsConnectBankModalOpen: (open: boolean) => void;
}

const FinologyContext = createContext<FinologyContextType | undefined>(undefined);

export const FinologyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: defaults strictly to the user's OS preference (mobile/desktop), or saved preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('finology_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('finology_theme');
    } catch {
      return true;
    }
  });

  // Automatically listen to system theme changes (mobile or PC) when no manual override is active
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemChange = (e: MediaQueryListEvent) => {
      try {
        const saved = localStorage.getItem('finology_theme');
        if (!saved) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch {
        // fallback
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleSystemChange);
      return () => (mediaQuery as any).removeListener(handleSystemChange);
    }
  }, []);

  // Sync DOM classes whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('finology_theme', next);
      } catch {}
      setIsSystemTheme(false);
      return next;
    });
  };

  const setSpecificTheme = (selectedTheme: 'light' | 'dark') => {
    try {
      localStorage.setItem('finology_theme', selectedTheme);
    } catch {}
    setIsSystemTheme(false);
    setTheme(selectedTheme);
  };

  const resetToSystemTheme = () => {
    try {
      localStorage.removeItem('finology_theme');
    } catch {}
    setIsSystemTheme(true);
    const systemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(systemDark ? 'dark' : 'light');
  };

  // View mode
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');
  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'mobile' ? 'responsive' : 'mobile'));
  };

  // Privacy Mode
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const togglePrivacyMode = () => setPrivacyMode(prev => !prev);

  // Tabs & Navigation
  const [activeTopTab, setActiveTopTab] = useState<'manage' | 'invest'>('manage');
  const [activeBottomTab, setActiveBottomTab] = useState<string>('dashboard');

  // Supabase Auth State
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Minha conta',
    email: '',
    avatarUrl: '',
    birthDate: '',
    accountLevel: 'Gratuito',
    privacyMode: false,
  });

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<BankCard[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [assets, setAssets] = useState<InvestmentAsset[]>([]);
  const [marketIndices] = useState<MarketIndex[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Selection & Modals
  const [selectedAsset, setSelectedAsset] = useState<InvestmentAsset | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [isConnectBankModalOpen, setIsConnectBankModalOpen] = useState(false);
  const [isSyncingAccount, setIsSyncingAccount] = useState(false);

  // Listen to Supabase Auth state.
  useEffect(() => {
    if (!supabase) {
      setIsAuthReady(true);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
      const user = session?.user ?? null;
      setCurrentUser(user);
      setIsAuthReady(true);
      if (!user) {
        setIsPasswordRecovery(false);
        setUserProfile({ name: 'Minha conta', email: '', avatarUrl: '', birthDate: '', accountLevel: 'Gratuito', privacyMode: false });
        setTransactions([]);
        setCards([]);
        setConnectedAccounts([]);
        setBudgets([]);
        setSubscriptions([]);
        setAssets([]);
        setNotifications([]);
        setSelectedAsset(null);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const displayName = String(metadata.name ?? metadata.full_name ?? user.email?.split('@')[0] ?? 'Usuário Finology');
      const profile: UserProfile = {
        name: displayName,
        email: user.email || '',
        avatarUrl: String(metadata.avatar_url ?? metadata.picture ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1A5CFF&color=fff`),
        birthDate: '',
        accountLevel: 'Pro',
        privacyMode: false,
      };

      if (event === 'USER_UPDATED') {
        setUserProfile((previous) => ({
          ...previous,
          name: String(metadata.name ?? metadata.full_name ?? previous.name ?? displayName),
          email: user.email || '',
          avatarUrl: String(metadata.avatar_url ?? metadata.picture ?? (previous.avatarUrl || profile.avatarUrl)),
        }));
        queueMicrotask(() => {
          void supabaseService.updateProfileEmail(user.id, user.email || '').catch((error) => {
            console.error('Supabase profile email update failed:', error);
          });
        });
        return;
      }

      setUserProfile(profile);

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // Defer requests until after the auth callback returns to avoid blocking token refresh.
        queueMicrotask(() => {
          void (async () => {
            try {
              const savedProfile = await supabaseService.loadUserProfile(user.id);
              const mergedProfile = {
                ...profile,
                ...savedProfile,
                name: String(metadata.name ?? metadata.full_name ?? savedProfile?.name ?? profile.name),
                avatarUrl: String(metadata.avatar_url ?? savedProfile?.avatarUrl ?? metadata.picture ?? profile.avatarUrl),
                email: user.email || '',
                birthDate: savedProfile?.birthDate ?? '',
              };
              setUserProfile(mergedProfile);
              await supabaseService.saveUserProfile(user.id, mergedProfile);
            } catch (error) {
              console.error('Supabase account setup failed:', error);
            }
          })();
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Real-time Supabase subscriptions when a user is authenticated.
  useEffect(() => {
    if (!currentUser) return;

    const unsubTx = supabaseService.subscribeTransactions(currentUser.id, setTransactions);
    const unsubCards = supabaseService.subscribeCards(currentUser.id, setCards);
    const unsubBudgets = supabaseService.subscribeBudgets(currentUser.id, setBudgets);
    const unsubAccounts = supabaseService.subscribeAccounts(currentUser.id, setConnectedAccounts);
    const unsubAssets = supabaseService.subscribeAssets(currentUser.id, setAssets);
    const unsubSubscriptions = supabaseService.subscribeSubscriptions(currentUser.id, setSubscriptions);

    return () => {
      unsubTx();
      unsubCards();
      unsubBudgets();
      unsubAccounts();
      unsubAssets();
      unsubSubscriptions();
    };
  }, [currentUser]);

  // Auth Methods
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getAuthRedirectUrl() },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const message = String(err?.message ?? '');
      const friendlyMessage = /unsupported provider|provider is not enabled/i.test(message)
        ? 'O login com Google ainda não está habilitado no Supabase. Ative o provedor Google em Authentication → Sign In / Providers e configure as credenciais OAuth.'
        : 'Não foi possível conectar com o Google. Tente novamente.';
      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
    } catch (err: any) {
      const message = /invalid login credentials/i.test(String(err?.message ?? ''))
        ? 'E-mail ou senha incorretos.'
        : 'Não foi possível entrar. Confira os dados e tente novamente.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });
    if (error) {
      setAuthError('Não foi possível enviar o link agora. Tente novamente mais tarde.');
      throw new Error('Não foi possível enviar o link agora. Tente novamente mais tarde.');
    }
  };

  const updatePassword = async (password: string) => {
    setAuthError(null);
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) {
      setAuthError('Não foi possível atualizar a senha. Confira os requisitos e tente novamente.');
      throw new Error('Não foi possível atualizar a senha. Confira os requisitos e tente novamente.');
    }
    setIsPasswordRecovery(false);
    await getSupabase().auth.signOut();
  };

  const updateAccountProfile = async (values: { name: string; email: string; birthDate: string; password?: string }) => {
    if (!currentUser) throw new Error('Faça login novamente para editar seu perfil.');
    setAuthError(null);
    const emailChanged = values.email.trim().toLowerCase() !== (currentUser.email ?? '').toLowerCase();
    const attributes: { data: Record<string, unknown>; email?: string; password?: string } = {
      data: { ...currentUser.user_metadata, name: values.name.trim() },
    };
    if (emailChanged) attributes.email = values.email.trim();
    if (values.password) attributes.password = values.password;
    const { error } = await getSupabase().auth.updateUser(attributes);
    if (error) throw error;

    const updatedProfile = { ...userProfile, name: values.name.trim(), email: currentUser.email ?? '', birthDate: values.birthDate };
    setUserProfile(updatedProfile);
    await supabaseService.saveUserProfile(currentUser.id, updatedProfile);
    return emailChanged;
  };

  const uploadProfileAvatar = async (file: File) => {
    if (!currentUser) throw new Error('Faça login novamente para alterar sua foto.');
    const avatarUrl = await supabaseService.uploadAvatar(currentUser.id, file, userProfile.avatarUrl);
    const { error } = await getSupabase().auth.updateUser({
      data: { ...currentUser.user_metadata, avatar_url: avatarUrl },
    });
    if (error) throw error;
    const updatedProfile = { ...userProfile, avatarUrl };
    setUserProfile(updatedProfile);
    await supabaseService.saveUserProfile(currentUser.id, updatedProfile);
  };

  const deleteAccount = async () => {
    await supabaseService.deleteAccount();
    setIsPasswordRecovery(false);
    await getSupabase().auth.signOut({ scope: 'local' });
  };

  const registerWithEmail = async (name: string, email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A5CFF&color=fff`,
          },
          emailRedirectTo: getAuthRedirectUrl(),
        },
      });
      if (error) throw error;
      return Boolean(data.session);
    } catch (err: any) {
      const providerMessage = String(err?.message ?? '');
      const message = /password.*(weak|short|least|length)|weak password/i.test(providerMessage)
        ? 'A senha não atende aos requisitos definidos. Escolha outra senha.'
        : /already registered|user exists/i.test(providerMessage)
          ? 'Já existe uma conta com esse e-mail.'
          : 'Não foi possível criar a conta. Confira os dados e tente novamente.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    if (currentUser) {
      await getSupabase().auth.signOut();
    }
  };

  // Financial Calculations
  const totalBalance = useMemo(() => {
    if (connectedAccounts.length > 0) {
      return connectedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    }

    // With no linked accounts, derive the available balance from the user's ledger.
    return transactions.reduce((balance, tx) => {
      if (tx.type === 'income') return balance + Math.abs(tx.amount);
      if (tx.type === 'expense') return balance - Math.abs(tx.amount);
      return balance;
    }, 0);
  }, [connectedAccounts, transactions]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [transactions]);

  const totalInvested = useMemo(() => {
    return assets.reduce((sum, ast) => sum + (ast.currentPrice * ast.quantity), 0);
  }, [assets]);

  const totalCostBasis = useMemo(() => {
    return assets.reduce((sum, ast) => sum + (ast.averagePrice * ast.quantity), 0);
  }, [assets]);

  const totalInvestedProfit = useMemo(() => {
    return totalInvested - totalCostBasis;
  }, [totalInvested, totalCostBasis]);

  const totalInvestedProfitPercent = useMemo(() => {
    if (totalCostBasis === 0) return 0;
    return (totalInvestedProfit / totalCostBasis) * 100;
  }, [totalInvestedProfit, totalCostBasis]);

  // Actions with Supabase Sync
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };

    setTransactions(prev => [newTx, ...prev]);

    // Persist in Supabase if authenticated
    if (currentUser) {
      supabaseService.addTransaction(currentUser.id, newTx);
    }

    // Update account balance
    if (connectedAccounts.length > 0) {
      const primary = connectedAccounts[0];
      const updatedBalance = tx.type === 'income' 
        ? primary.balance + tx.amount 
        : primary.balance - Math.abs(tx.amount);
      const updatedAcc: ConnectedAccount = {
        ...primary,
        balance: Math.max(0, updatedBalance),
        lastSync: 'Agora',
      };
      setConnectedAccounts(prev => [updatedAcc, ...prev.slice(1)]);
      if (currentUser) {
        supabaseService.updateAccount(currentUser.id, updatedAcc);
      }
    }

    // Update budget
    if (tx.type === 'expense') {
      setBudgets(prev =>
        prev.map(b => {
          if (b.category === tx.category) {
            const updated = { ...b, spent: b.spent + Math.abs(tx.amount) };
            if (currentUser) supabaseService.updateBudget(currentUser.id, updated);
            return updated;
          }
          return b;
        })
      );
    }
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
    if (currentUser) {
      supabaseService.deleteTransaction(currentUser.id, id);
    }
  };

  const addCard = (card: Omit<BankCard, 'id'>) => {
    const newCard: BankCard = {
      ...card,
      id: `card-${Date.now()}`,
    };
    setCards(prev => [...prev, newCard]);
    if (currentUser) {
      supabaseService.addCard(currentUser.id, newCard);
    }
  };

  const setDefaultCard = (id: string) => {
    setCards(prev =>
      prev.map(card => {
        const updated = { ...card, isDefault: card.id === id };
        if (currentUser) supabaseService.addCard(currentUser.id, updated);
        return updated;
      })
    );
  };

  const syncAccount = async (id: string) => {
    setIsSyncingAccount(true);
    await new Promise(r => setTimeout(r, 1200));
    setConnectedAccounts(prev =>
      prev.map(acc => {
        if (acc.id === id) {
          const updated = { ...acc, lastSync: 'Agora mesmo' };
          if (currentUser) supabaseService.updateAccount(currentUser.id, updated);
          return updated;
        }
        return acc;
      })
    );
    setIsSyncingAccount(false);
  };

  const connectNewBank = (bankName: string, bankCode: string, initialBal: number, color: string) => {
    const newAccount: ConnectedAccount = {
      id: `acc-${Date.now()}`,
      institutionName: bankName,
      institutionCode: bankCode,
      accountType: 'Corrente',
      balance: initialBal,
      lastSync: 'Sincronizado agora',
      status: 'connected',
      logoColor: color,
    };
    setConnectedAccounts(prev => [...prev, newAccount]);
    if (currentUser) {
      supabaseService.updateAccount(currentUser.id, newAccount);
    }
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: `b-${Date.now()}`,
    };
    setBudgets(prev => [...prev, newBudget]);
    if (currentUser) {
      supabaseService.updateBudget(currentUser.id, newBudget);
    }
  };

  const updateBudgetLimit = (id: string, newLimit: number) => {
    setBudgets(prev =>
      prev.map(b => {
        if (b.id === id) {
          const updated = { ...b, limit: newLimit };
          if (currentUser) supabaseService.updateBudget(currentUser.id, updated);
          return updated;
        }
        return b;
      })
    );
  };

  const addSubscription = (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: `sub-${Date.now()}`,
    };
    setSubscriptions(prev => [...prev, newSubscription]);
    if (currentUser) {
      void supabaseService.addSubscription(currentUser.id, newSubscription);
    }
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(subscription => subscription.id !== id));
    if (currentUser) {
      void supabaseService.deleteSubscription(currentUser.id, id);
    }
  };

  const paySubscription = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub || sub.isPaidThisMonth) return;

    addTransaction({
      title: `Assinatura: ${sub.serviceName}`,
      subtitle: 'Pagamento mensal automático',
      category: 'Serviços & Assinaturas',
      amount: -sub.amount,
      date: new Date().toISOString(),
      type: 'expense',
      paymentMethod: 'Cartão de Crédito',
      status: 'completed',
    });

    setSubscriptions(prev => prev.map((subscription) => {
      if (subscription.id !== id) return subscription;
      const updated = { ...subscription, isPaidThisMonth: true };
      if (currentUser) void supabaseService.updateSubscription(currentUser.id, updated);
      return updated;
    }));
  };

  const tradeAsset = (assetId: string, quantity: number, type: 'buy' | 'sell'): boolean => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset || quantity <= 0) return false;

    const totalCost = asset.currentPrice * quantity;

    if (type === 'sell' && asset.quantity < quantity) {
      return false;
    }

    if (type === 'buy') {
      if (totalBalance < totalCost) return false;

      const newTotalQty = asset.quantity + quantity;
      const newAvgPrice = ((asset.averagePrice * asset.quantity) + totalCost) / newTotalQty;

      const updatedAsset = { ...asset, quantity: newTotalQty, averagePrice: newAvgPrice };
      setAssets(prev => prev.map(a => (a.id === assetId ? updatedAsset : a)));
      if (currentUser) supabaseService.updateAsset(currentUser.id, updatedAsset);

      addTransaction({
        title: `Compra de ${asset.ticker}`,
        subtitle: `${quantity} cotas a R$ ${asset.currentPrice.toFixed(2)}`,
        category: 'Investimentos',
        amount: -totalCost,
        date: new Date().toISOString(),
        type: 'investment',
        paymentMethod: 'Saldo em Conta',
        status: 'completed',
      });
    } else {
      const newTotalQty = asset.quantity - quantity;
      const updatedAsset = { ...asset, quantity: newTotalQty };
      setAssets(prev => prev.map(a => (a.id === assetId ? updatedAsset : a)));
      if (currentUser) supabaseService.updateAsset(currentUser.id, updatedAsset);

      addTransaction({
        title: `Venda de ${asset.ticker}`,
        subtitle: `${quantity} cotas a R$ ${asset.currentPrice.toFixed(2)}`,
        category: 'Investimentos',
        amount: totalCost,
        date: new Date().toISOString(),
        type: 'income',
        paymentMethod: 'Conta Corrente',
        status: 'completed',
      });
    }

    return true;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <FinologyContext.Provider
      value={{
        theme,
        toggleTheme,
        setSpecificTheme,
        isSystemTheme,
        resetToSystemTheme,
        viewMode,
        toggleViewMode,
        privacyMode,
        togglePrivacyMode,
        activeTopTab,
        setActiveTopTab,
        activeBottomTab,
        setActiveBottomTab,
        currentUser,
        isAdmin: currentUser?.app_metadata?.role === 'admin',
        isAuthReady,
        isAuthenticated: !!currentUser,
        isPasswordRecovery,
        sendPasswordReset,
        updatePassword,
        updateAccountProfile,
        uploadProfileAvatar,
        deleteAccount,
        userProfile,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        authError,
        transactions,
        addTransaction,
        deleteTransaction,
        cards,
        addCard,
        setDefaultCard,
        connectedAccounts,
        syncAccount,
        isSyncingAccount,
        connectNewBank,
        budgets,
        addBudget,
        updateBudgetLimit,
        subscriptions,
        addSubscription,
        deleteSubscription,
        paySubscription,
        assets,
        marketIndices,
        selectedAsset,
        setSelectedAsset,
        tradeAsset,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        totalBalance,
        totalIncome,
        totalExpense,
        totalInvested,
        totalInvestedProfit,
        totalInvestedProfitPercent,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isAddCardModalOpen,
        setIsAddCardModalOpen,
        isQuickActionOpen,
        setIsQuickActionOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        isSearchOpen,
        setIsSearchOpen,
        isAddBudgetOpen,
        setIsAddBudgetOpen,
        isConnectBankModalOpen,
        setIsConnectBankModalOpen,
      }}
    >
      {children}
    </FinologyContext.Provider>
  );
};

export const useFinology = () => {
  const context = useContext(FinologyContext);
  if (!context) {
    throw new Error('useFinology must be used within a FinologyProvider');
  }
  return context;
};
