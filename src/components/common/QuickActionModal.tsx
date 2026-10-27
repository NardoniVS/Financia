import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { CategoryType } from '../../types/finology';

const expenseCategories: CategoryType[] = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Lazer & Compras',
  'Saúde',
  'Educação',
  'Serviços & Assinaturas',
  'Cuidados pessoais',
  'Pets',
  'Viagens',
  'Impostos & Taxas',
  'Outros',
];

const incomeCategories: CategoryType[] = [
  'Trabalho / Salário',
  'Freelance',
  'Investimentos',
  'Vendas',
  'Reembolso',
  'Benefícios',
  'Outros',
];

const expensePaymentMethods = ['Conta Corrente', 'Cartão de Débito', 'Cartão de Crédito', 'Dinheiro em Espécie'];
const incomePaymentMethods = ['Pix', 'Transferência bancária', 'Carteira digital', 'Dinheiro em Espécie'];

const parseAmount = (value: string) => {
  const normalized = value.includes(',')
    ? value.replace(/\./g, '').replace(',', '.')
    : value.replace(/\.(?=.*\.)/g, '').replace(/\.(\d{3})$/, '$1');
  return Number(normalized);
};

const formatAmountWhileTyping = (value: string) => {
  const separatorIndex = value.indexOf(',');
  const integerPart = (separatorIndex === -1 ? value : value.slice(0, separatorIndex)).replace(/\D/g, '');
  const decimalPart = separatorIndex === -1
    ? ''
    : value.slice(separatorIndex + 1).replace(/\D/g, '').slice(0, 2);
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return separatorIndex === -1 ? groupedInteger : `${groupedInteger},${decimalPart}`;
};

const formatAmount = (value: string) => {
  const parsed = parseAmount(value);
  return Number.isFinite(parsed)
    ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parsed)
    : value;
};

export const QuickActionModal: React.FC = () => {
  const {
    isQuickActionOpen,
    setIsQuickActionOpen,
    addTransaction,
    transactions,
  } = useFinology();

  const [activeForm, setActiveForm] = useState<'menu' | 'expense' | 'income'>('menu');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Alimentação');
  const [newCategory, setNewCategory] = useState('');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Conta Corrente');
  const [isPaymentMenuOpen, setIsPaymentMenuOpen] = useState(false);

  if (!isQuickActionOpen) return null;

  const handleClose = () => {
    setActiveForm('menu');
    setTitle('');
    setAmount('');
    setNewCategory('');
    setIsCategoryMenuOpen(false);
    setIsPaymentMenuOpen(false);
    setIsQuickActionOpen(false);
  };

  const handleAddCategory = () => {
    const value = newCategory.trim().slice(0, 32);
    if (!value) return;

    setCategory(value as CategoryType);
    setNewCategory('');
    setIsCategoryMenuOpen(false);
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseAmount(amount);
    if (isNaN(val) || val <= 0) return;

    const isExpense = activeForm === 'expense';

    addTransaction({
      title: title || (isExpense ? 'Despesa Avulsa' : 'Receita Avulsa'),
      subtitle: `Registro manual via Finology`,
      category,
      amount: isExpense ? -val : val,
      date: new Date().toISOString(),
      type: isExpense ? 'expense' : 'income',
      paymentMethod,
      status: 'completed',
    });

    handleClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 transition-all"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-2xl border border-slate-100 dark:border-slate-800 transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {activeForm === 'menu' && 'Novo Lançamento'}
            {activeForm === 'expense' && 'Registrar Nova Despesa'}
            {activeForm === 'income' && 'Registrar Nova Receita'}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {activeForm === 'menu' ? (
          <div className="grid grid-cols-2 gap-3 py-2">
            {/* Nova Despesa */}
            <button
              type="button"
              onClick={() => {
                setCategory('Alimentação');
                setPaymentMethod('Conta Corrente');
                setActiveForm('expense');
              }}
              className="p-5 rounded-2xl bg-rose-50 border border-rose-100 text-left hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-3 shadow-sm">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Nova Despesa
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Lançar gasto ou compra
              </p>
            </button>

            {/* Nova Receita */}
            <button
              type="button"
              onClick={() => {
                setCategory('Trabalho / Salário');
                setPaymentMethod('Pix');
                setActiveForm('income');
              }}
              className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-left hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-sm">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Nova Receita
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Salário, bônus ou rendimento
              </p>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTransaction} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={activeForm === 'expense' ? 'Ex: Supermercado Semanal' : 'Ex: Salário / Freelance'}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={amount}
                onChange={(e) => {
                  const input = e.currentTarget;
                  const rawValue = input.value;
                  const cursor = input.selectionStart ?? rawValue.length;
                  const separatorIndex = rawValue.indexOf(',');
                  const isInDecimalPart = separatorIndex !== -1 && cursor > separatorIndex;
                  const digitsBeforeCursor = rawValue.slice(0, cursor).replace(/\D/g, '').length;
                  const decimalDigitsBeforeCursor = isInDecimalPart
                    ? rawValue.slice(separatorIndex + 1, cursor).replace(/\D/g, '').length
                    : 0;
                  const formatted = formatAmountWhileTyping(rawValue);
                  setAmount(formatted);

                  let nextCursor = 0;
                  if (isInDecimalPart) {
                    nextCursor = formatted.indexOf(',') + 1 + decimalDigitsBeforeCursor;
                  } else {
                    let seenDigits = 0;
                    while (nextCursor < formatted.length && seenDigits < digitsBeforeCursor) {
                      if (/\d/.test(formatted[nextCursor])) seenDigits += 1;
                      nextCursor += 1;
                    }
                  }

                  requestAnimationFrame(() => input.setSelectionRange(nextCursor, nextCursor));
                }}
                onFocus={() => setAmount((current) => current.replace(/\./g, ''))}
                onBlur={() => {
                  if (amount) setAmount(formatAmount(amount));
                }}
                placeholder="0,00"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria
              </label>
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={isCategoryMenuOpen}
                  onClick={() => {
                    setIsPaymentMenuOpen(false);
                    setIsCategoryMenuOpen((open) => !open);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-left text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 sm:text-xs"
                >
                  <span>{category}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCategoryMenuOpen && (
                  <div
                    role="group"
                    aria-label="Categorias"
                    className="absolute left-0 right-0 top-full z-30 mt-1 rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl"
                  >
                    <div className="max-h-48 overflow-y-auto">
                    {Array.from(new Set([
                      ...(activeForm === 'income' ? incomeCategories : expenseCategories),
                      ...transactions
                        .filter((transaction) => transaction.type === activeForm)
                        .map((transaction) => transaction.category),
                    ])).map((option) => {
                      const isSelected = category === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setCategory(option);
                            setIsCategoryMenuOpen(false);
                          }}
                          className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors sm:text-xs ${
                            isSelected
                              ? 'bg-blue-900/70 text-blue-200'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                    </div>
                    <div className="mt-1 flex gap-2 border-t border-slate-700 p-1 pt-2">
                      <input
                        type="text"
                        value={newCategory}
                        maxLength={32}
                        onChange={(event) => setNewCategory(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleAddCategory();
                          }
                        }}
                        placeholder="Nova categoria"
                        aria-label="Nome da nova categoria"
                        className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-white outline-none placeholder:text-slate-400 focus:border-blue-500 sm:py-2 sm:text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim()}
                        aria-label="Adicionar categoria"
                        className="flex min-h-10 shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeForm === 'income' ? 'Forma de recebimento' : 'Forma de pagamento'}
              </label>
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isPaymentMenuOpen}
                  onClick={() => {
                    setIsCategoryMenuOpen(false);
                    setIsPaymentMenuOpen((open) => !open);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-left text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 sm:text-xs"
                >
                  <span>{paymentMethod}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isPaymentMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isPaymentMenuOpen && (
                  <div
                    role="listbox"
                    aria-label="Formas de pagamento"
                    className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl"
                  >
                    {(activeForm === 'income' ? incomePaymentMethods : expensePaymentMethods).map((option) => {
                      const isSelected = paymentMethod === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setPaymentMethod(option);
                            setIsPaymentMenuOpen(false);
                          }}
                          className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors sm:text-xs ${
                            isSelected
                              ? 'bg-blue-900/70 text-blue-200'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveForm('menu')}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${
                  activeForm === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirmar Lançamento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
