import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { CategoryType } from '../../types/finology';

export const QuickActionModal: React.FC = () => {
  const {
    isQuickActionOpen,
    setIsQuickActionOpen,
    addTransaction,
  } = useFinology();

  const [activeForm, setActiveForm] = useState<'menu' | 'expense' | 'income'>('menu');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Alimentação');
  const [paymentMethod, setPaymentMethod] = useState('Conta Corrente');

  if (!isQuickActionOpen) return null;

  const handleClose = () => {
    setActiveForm('menu');
    setTitle('');
    setAmount('');
    setIsQuickActionOpen(false);
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
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
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 transition-transform"
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
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {activeForm === 'menu' ? (
          <div className="grid grid-cols-2 gap-3 py-2">
            {/* Nova Despesa */}
            <button
              type="button"
              onClick={() => setActiveForm('expense')}
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
              onClick={() => setActiveForm('income')}
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
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
              >
                <option value="Alimentação">Alimentação</option>
                <option value="Transporte">Transporte</option>
                <option value="Lazer & Compras">Lazer & Compras</option>
                <option value="Saúde">Saúde</option>
                <option value="Trabalho / Salário">Trabalho / Salário</option>
                <option value="Serviços & Assinaturas">Serviços & Assinaturas</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
              >
                <option value="Conta Corrente">Conta Corrente</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
              </select>
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
