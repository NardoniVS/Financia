import React, { useState } from 'react';
import {
  Utensils,
  Briefcase,
  ShoppingBag,
  TrendingUp,
  Car,
  HeartPulse,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
} from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Transaction } from '../../types/finology';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Alimentação':
      return { icon: Utensils, bg: 'bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400' };
    case 'Trabalho / Salário':
      return { icon: Briefcase, bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' };
    case 'Lazer & Compras':
      return { icon: ShoppingBag, bg: 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400' };
    case 'Investimentos':
      return { icon: TrendingUp, bg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' };
    case 'Transporte':
      return { icon: Car, bg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400' };
    case 'Saúde':
      return { icon: HeartPulse, bg: 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' };
    default:
      return { icon: Receipt, bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
  }
};

export const TransactionsList: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const { transactions, privacyMode, deleteTransaction } = useFinology();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'income') return tx.type === 'income';
    if (filterType === 'expense') return tx.type === 'expense';
    return true;
  });

  const displayList = limit ? filteredTransactions.slice(0, limit) : filteredTransactions;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Histórico Recente
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Últimas movimentações
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex w-full items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`min-h-11 flex-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer sm:flex-none ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilterType('income')}
            className={`min-h-11 flex-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer sm:flex-none ${
              filterType === 'income'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Entradas
          </button>
          <button
            type="button"
            onClick={() => setFilterType('expense')}
            className={`min-h-11 flex-1 px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer sm:flex-none ${
              filterType === 'expense'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Saídas
          </button>
        </div>
      </div>

      {/* List */}
      {displayList.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Nenhuma transação encontrada no filtro selecionado.
        </div>
      ) : (
        <div className="scrollbar-none max-h-[min(55vh,28rem)] overflow-y-auto overscroll-contain pr-1 divide-y divide-slate-100 dark:divide-slate-800">
          {displayList.map((tx) => {
            const { icon: Icon, bg } = getCategoryIcon(tx.category);
            const isPositive = tx.amount > 0;

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-2xl transition-colors cursor-pointer group"
              >
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 truncate">
                      <span>{tx.category}</span>
                      <span>·</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Value & Indicator */}
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {privacyMode ? '••••' : formatCurrency(tx.amount, true)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[100px]">
                    {tx.paymentMethod || 'Liquidado'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div
                className={`w-14 h-14 rounded-3xl mx-auto flex items-center justify-center mb-3 ${
                  getCategoryIcon(selectedTx.category).bg
                }`}
              >
                {React.createElement(getCategoryIcon(selectedTx.category).icon, { className: 'w-7 h-7' })}
              </div>
              <h3 className="break-words text-lg font-bold text-slate-900 dark:text-white">
                {selectedTx.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedTx.subtitle || selectedTx.category}
              </p>
              <div
                className={`text-2xl font-black mt-2 tabular-nums ${
                  selectedTx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {formatCurrency(selectedTx.amount, true)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-xs space-y-2 mb-4">
              <div className="flex justify-between text-slate-500">
                <span>Categoria</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Data</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(selectedTx.date)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Forma de Pagamento</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTx.paymentMethod || 'Conta Corrente'}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Concluído</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(selectedTx.id);
                  setSelectedTx(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                Excluir Transação
              </button>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
