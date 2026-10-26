import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    transactions,
  } = useFinology();

  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedTx = q
    ? transactions.filter(
        t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      )
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-16 sm:pt-20"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por despesas, receitas ou categorias..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        {q ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Matched Transactions */}
            {matchedTx.length > 0 ? (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Transações Encontradas ({matchedTx.length})
                </span>
                <div className="space-y-1.5">
                  {matchedTx.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-50 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {tx.title}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {tx.category} · {formatDate(tx.date)}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold tabular-nums ${
                          tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(tx.amount, true)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Nenhuma transação encontrada para "{query}".
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Digite para pesquisar despesas, receitas e categorias em tempo real.
          </div>
        )}
      </div>
    </div>
  );
};
