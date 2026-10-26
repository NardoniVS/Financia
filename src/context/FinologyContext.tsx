import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '../lib/firebase';
import { firestoreService } from '../services/firestoreService';
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
import {
  initialUserProfile,
  initialTransactions,
  initialBudgets,
  initialSubscriptions,
  initialCards,
  initialConnectedAccounts,
  initialMarketIndices,
  initialAssets,
  initialNotifications,
} from '../data/mockData';

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
  currentUser: FirebaseUser | null;
  isAuthenticated: boolean;
  userProfile: UserProfile;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
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

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [cards, setCards] = useState<BankCard[]>(initialCards);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>(initialConnectedAccounts);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [assets, setAssets] = useState<InvestmentAsset[]>(initialAssets);
  const [marketIndices] = useState<MarketIndex[]>(initialMarketIndices);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

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

  // Test Firestore Connection once at startup
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoUser(false);
        setUserProfile({
          name: user.displayName || user.email?.split('@')[0] || 'Usuário Finology',
          email: user.email || '',
          avatarUrl: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=1A5CFF&color=fff`,
          accountLevel: 'Pro',
          privacyMode: false,
        });

        // Seed initial data in Firestore for user if not yet present
        await firestoreService.seedInitialUserData(user.uid);
      } else {
        setCurrentUser(null);
        // keep demo user active so app is immediately usable
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Subscriptions when a real user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubTx = firestoreService.subscribeTransactions(currentUser.uid, (data) => {
      if (data.length > 0) setTransactions(data);
    });

    const unsubCards = firestoreService.subscribeCards(currentUser.uid, (data) => {
      if (data.length > 0) setCards(data);
    });

    const unsubBudgets = firestoreService.subscribeBudgets(currentUser.uid, (data) => {
      if (data.length > 0) setBudgets(data);
    });

    const unsubAccounts = firestoreService.subscribeAccounts(currentUser.uid, (data) => {
      if (data.length > 0) setConnectedAccounts(data);
    });

    const unsubAssets = firestoreService.subscribeAssets(currentUser.uid, (data) => {
      if (data.length > 0) setAssets(data);
    });

    return () => {
      unsubTx();
      unsubCards();
      unsubBudgets();
      unsubAccounts();
      unsubAssets();
    };
  }, [currentUser]);

  // Auth Methods
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setAuthError(err?.message || 'Falha ao autenticar com o Google.');
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setAuthError('Email ou senha incorretos.');
      throw err;
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await firestoreService.saveUserProfile(res.user.uid, {
          name,
          email,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1A5CFF&color=fff`,
          accountLevel: 'Pro',
          privacyMode: false,
        });
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Erro ao registrar usuário.');
      throw err;
    }
  };

  const loginAsDemo = () => {
    setIsDemoUser(true);
    setUserProfile(initialUserProfile);
    setTransactions(initialTransactions);
    setCards(initialCards);
    setConnectedAccounts(initialConnectedAccounts);
    setBudgets(initialBudgets);
    setAssets(initialAssets);
  };

  const logout = async () => {
    if (currentUser) {
      await signOut(auth);
    }
    loginAsDemo();
  };

  // Financial Calculations
  const totalBalance = useMemo(() => {
    return connectedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [connectedAccounts]);

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

  // Actions with Firestore Sync
  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };

    setTransactions(prev => [newTx, ...prev]);

    // Persist in Firestore if authenticated
    if (currentUser) {
      firestoreService.addTransaction(currentUser.uid, newTx);
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
        firestoreService.updateAccount(currentUser.uid, updatedAcc);
      }
    }

    // Update budget
    if (tx.type === 'expense') {
      setBudgets(prev =>
        prev.map(b => {
          if (b.category === tx.category) {
            const updated = { ...b, spent: b.spent + Math.abs(tx.amount) };
            if (currentUser) firestoreService.updateBudget(currentUser.uid, updated);
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
      firestoreService.deleteTransaction(currentUser.uid, id);
    }
  };

  const addCard = (card: Omit<BankCard, 'id'>) => {
    const newCard: BankCard = {
      ...card,
      id: `card-${Date.now()}`,
    };
    setCards(prev => [...prev, newCard]);
    if (currentUser) {
      firestoreService.addCard(currentUser.uid, newCard);
    }
  };

  const setDefaultCard = (id: string) => {
    setCards(prev =>
      prev.map(card => {
        const updated = { ...card, isDefault: card.id === id };
        if (currentUser) firestoreService.addCard(currentUser.uid, updated);
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
          if (currentUser) firestoreService.updateAccount(currentUser.uid, updated);
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
      firestoreService.updateAccount(currentUser.uid, newAccount);
    }
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: `b-${Date.now()}`,
    };
    setBudgets(prev => [...prev, newBudget]);
    if (currentUser) {
      firestoreService.updateBudget(currentUser.uid, newBudget);
    }
  };

  const updateBudgetLimit = (id: string, newLimit: number) => {
    setBudgets(prev =>
      prev.map(b => {
        if (b.id === id) {
          const updated = { ...b, limit: newLimit };
          if (currentUser) firestoreService.updateBudget(currentUser.uid, updated);
          return updated;
        }
        return b;
      })
    );
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

    setSubscriptions(prev =>
      prev.map(s => (s.id === id ? { ...s, isPaidThisMonth: true } : s))
    );
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
      if (currentUser) firestoreService.updateAsset(currentUser.uid, updatedAsset);

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
      if (currentUser) firestoreService.updateAsset(currentUser.uid, updatedAsset);

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
        isAuthenticated: !!currentUser,
        userProfile,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemo,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
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
