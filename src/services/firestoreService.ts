import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Transaction,
  BankCard,
  ConnectedAccount,
  Budget,
  InvestmentAsset,
  NotificationItem,
  UserProfile,
} from '../types/finology';
import {
  initialTransactions,
  initialBudgets,
  initialCards,
  initialConnectedAccounts,
  initialAssets,
  initialNotifications,
} from '../data/mockData';

export const firestoreService = {
  // --- USER PROFILE ---
  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, 'users', userId), {
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        accountLevel: profile.accountLevel,
        privacyMode: profile.privacyMode,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- SEED INITIAL DEMO DATA FOR NEW USER ---
  async seedInitialUserData(userId: string): Promise<void> {
    try {
      // 1. Transactions
      for (const tx of initialTransactions) {
        const txRef = doc(db, 'users', userId, 'transactions', tx.id);
        await setDoc(txRef, { ...tx, userId });
      }
      // 2. Budgets
      for (const b of initialBudgets) {
        const bRef = doc(db, 'users', userId, 'budgets', b.id);
        await setDoc(bRef, { ...b, userId });
      }
      // 3. Cards
      for (const c of initialCards) {
        const cRef = doc(db, 'users', userId, 'cards', c.id);
        await setDoc(cRef, { ...c, userId });
      }
      // 4. Connected Accounts
      for (const acc of initialConnectedAccounts) {
        const aRef = doc(db, 'users', userId, 'accounts', acc.id);
        await setDoc(aRef, { ...acc, userId });
      }
      // 5. Assets
      for (const ast of initialAssets) {
        const astRef = doc(db, 'users', userId, 'assets', ast.id);
        await setDoc(astRef, { ...ast, userId });
      }
      // 6. Notifications
      for (const notif of initialNotifications) {
        const nRef = doc(db, 'users', userId, 'notifications', notif.id);
        await setDoc(nRef, { ...notif, userId });
      }
    } catch (e) {
      console.warn('Seed initial data notice:', e);
    }
  },

  // --- TRANSACTIONS ---
  subscribeTransactions(
    userId: string,
    callback: (transactions: Transaction[]) => void
  ): Unsubscribe {
    const path = `users/${userId}/transactions`;
    const colRef = collection(db, 'users', userId, 'transactions');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as Transaction[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async addTransaction(userId: string, tx: Transaction): Promise<void> {
    const path = `users/${userId}/transactions/${tx.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'transactions', tx.id), {
        ...tx,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteTransaction(userId: string, txId: string): Promise<void> {
    const path = `users/${userId}/transactions/${txId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'transactions', txId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- CARDS ---
  subscribeCards(userId: string, callback: (cards: BankCard[]) => void): Unsubscribe {
    const path = `users/${userId}/cards`;
    return onSnapshot(
      collection(db, 'users', userId, 'cards'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as BankCard[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async addCard(userId: string, card: BankCard): Promise<void> {
    const path = `users/${userId}/cards/${card.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'cards', card.id), {
        ...card,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // --- BUDGETS ---
  subscribeBudgets(userId: string, callback: (budgets: Budget[]) => void): Unsubscribe {
    const path = `users/${userId}/budgets`;
    return onSnapshot(
      collection(db, 'users', userId, 'budgets'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as Budget[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async updateBudget(userId: string, budget: Budget): Promise<void> {
    const path = `users/${userId}/budgets/${budget.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'budgets', budget.id), {
        ...budget,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // --- CONNECTED ACCOUNTS ---
  subscribeAccounts(userId: string, callback: (accounts: ConnectedAccount[]) => void): Unsubscribe {
    const path = `users/${userId}/accounts`;
    return onSnapshot(
      collection(db, 'users', userId, 'accounts'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as ConnectedAccount[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async updateAccount(userId: string, account: ConnectedAccount): Promise<void> {
    const path = `users/${userId}/accounts/${account.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'accounts', account.id), {
        ...account,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- INVESTMENT ASSETS ---
  subscribeAssets(userId: string, callback: (assets: InvestmentAsset[]) => void): Unsubscribe {
    const path = `users/${userId}/assets`;
    return onSnapshot(
      collection(db, 'users', userId, 'assets'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as InvestmentAsset[];
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  async updateAsset(userId: string, asset: InvestmentAsset): Promise<void> {
    const path = `users/${userId}/assets/${asset.id}`;
    try {
      await setDoc(doc(db, 'users', userId, 'assets', asset.id), {
        ...asset,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
};
