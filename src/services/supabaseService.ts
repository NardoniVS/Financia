import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import {
  Transaction,
  BankCard,
  ConnectedAccount,
  Budget,
  InvestmentAsset,
  UserProfile,
} from '../types/finology';

type CollectionName = 'transactions' | 'cards' | 'budgets' | 'accounts' | 'assets';

const toDatabaseRow = (value: Record<string, unknown>) => {
  const row: Record<string, unknown> = {};
  for (const [key, fieldValue] of Object.entries(value)) {
    if (key === 'cvv') continue;
    if (key === 'limit') {
      row.budget_limit = fieldValue;
      continue;
    }
    row[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] = fieldValue;
  }
  return row;
};

const fromDatabaseRow = <T>(row: Record<string, unknown>): T => {
  const value: Record<string, unknown> = {};
  for (const [key, fieldValue] of Object.entries(row)) {
    if (key === 'budget_limit') {
      value.limit = fieldValue;
      continue;
    }
    value[key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())] = fieldValue;
  }
  // CVV is intentionally not stored in the database.
  if ('card_number' in row) value.cvv = '';
  return value as T;
};

const ensureSuccess = (error: { message: string } | null): void => {
  if (error) throw new Error(error.message);
};

async function upsertRows(
  table: CollectionName,
  userId: string,
  rows: Array<Record<string, unknown>>
): Promise<void> {
  if (!rows.length) return;
  const client = getSupabase();
  const values = rows.map((row) => ({ ...toDatabaseRow(row), user_id: userId }));
  const { error } = await client.from(table).upsert(values, { onConflict: 'user_id,id' });
  ensureSuccess(error);
}

function subscribeRows<T>(
  table: CollectionName,
  userId: string,
  callback: (rows: T[]) => void
): () => void {
  const client = getSupabase();
  const load = async () => {
    const { data, error } = await client.from(table).select('*').eq('user_id', userId);
    if (error) {
      console.error(`Supabase ${table} query failed:`, error.message);
      return;
    }
    callback((data ?? []).map((row: Record<string, unknown>) => fromDatabaseRow<T>(row)));
  };

  void load();
  const channel: RealtimeChannel = client
    .channel(`${table}:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
      () => void load()
    )
    .subscribe((status, error) => {
      if (status === 'SUBSCRIBED') void load();
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`Supabase Realtime ${table} subscription failed:`, error?.message ?? status);
      }
    });

  return () => {
    void client.removeChannel(channel);
  };
}

export const supabaseService = {
  async saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const client = getSupabase();
    const { error } = await client.from('profiles').upsert(
      {
        user_id: userId,
        name: profile.name,
        email: profile.email,
        avatar_url: profile.avatarUrl,
        account_level: profile.accountLevel,
        privacy_mode: profile.privacyMode,
      },
      { onConflict: 'user_id', ignoreDuplicates: true }
    );
    ensureSuccess(error);
  },

  subscribeTransactions: (userId: string, callback: (rows: Transaction[]) => void) =>
    subscribeRows('transactions', userId, callback),
  subscribeCards: (userId: string, callback: (rows: BankCard[]) => void) =>
    subscribeRows('cards', userId, callback),
  subscribeBudgets: (userId: string, callback: (rows: Budget[]) => void) =>
    subscribeRows('budgets', userId, callback),
  subscribeAccounts: (userId: string, callback: (rows: ConnectedAccount[]) => void) =>
    subscribeRows('accounts', userId, callback),
  subscribeAssets: (userId: string, callback: (rows: InvestmentAsset[]) => void) =>
    subscribeRows('assets', userId, callback),

  async addTransaction(userId: string, transaction: Transaction): Promise<void> {
    await upsertRows('transactions', userId, [transaction as unknown as Record<string, unknown>]);
  },
  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .eq('id', transactionId);
    ensureSuccess(error);
  },
  async addCard(userId: string, card: BankCard): Promise<void> {
    await upsertRows('cards', userId, [card as unknown as Record<string, unknown>]);
  },
  async updateBudget(userId: string, budget: Budget): Promise<void> {
    await upsertRows('budgets', userId, [budget as unknown as Record<string, unknown>]);
  },
  async updateAccount(userId: string, account: ConnectedAccount): Promise<void> {
    await upsertRows('accounts', userId, [account as unknown as Record<string, unknown>]);
  },
  async updateAsset(userId: string, asset: InvestmentAsset): Promise<void> {
    await upsertRows('assets', userId, [asset as unknown as Record<string, unknown>]);
  },
};
