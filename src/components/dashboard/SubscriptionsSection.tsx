import React, { useState } from 'react';
import { Calendar, CheckCircle, CreditCard, Plus, Trash2, X } from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

const categories = ['Serviços & Assinaturas', 'Educação', 'Saúde', 'Lazer & Compras', 'Outros'];

const getDefaultBillingDate = () => {
  const date = new Date();
  const dayOfMonth = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(dayOfMonth, lastDayOfMonth));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const SubscriptionsSection: React.FC = () => {
  const { subscriptions, addSubscription, deleteSubscription, paySubscription, privacyMode } = useFinology();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [amount, setAmount] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState(getDefaultBillingDate);
  const [billingFrequency, setBillingFrequency] = useState<'mensal' | 'anual'>('mensal');
  const [brandColor, setBrandColor] = useState('#2563eb');

  const resetForm = () => {
    setServiceName('');
    setCategory(categories[0]);
    setAmount('');
    setNextBillingDate(getDefaultBillingDate());
    setBillingFrequency('mensal');
    setBrandColor('#2563eb');
  };

  const closeForm = () => {
    setIsAddOpen(false);
    resetForm();
  };

  const handleAddSubscription = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!serviceName.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;

    addSubscription({
      serviceName: serviceName.trim(),
      category,
      amount: parsedAmount,
      nextBillingDate,
      billingFrequency,
      status: 'active',
      brandColor,
      isPaidThisMonth: false,
    });
    closeForm();
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Assinaturas</h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">Pagamentos recorrentes monitorados</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
            Nenhuma assinatura cadastrada. Toque em “Adicionar” para começar.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {subscriptions.map((subscription) => (
              <article
                key={subscription.id}
                className="flex min-w-0 flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: subscription.brandColor }}
                        aria-hidden="true"
                      >
                        {subscription.serviceName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {subscription.serviceName}
                        </h3>
                        <p className="truncate text-[10px] text-slate-400">{subscription.category}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                      {privacyMode ? '••••' : formatCurrency(subscription.amount)}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      Próxima cobrança: {formatDateShort(subscription.nextBillingDate)} · {subscription.billingFrequency}
                    </span>
                  </div>
                </div>

                {subscription.isPaidThisMonth ? (
                  <div className="flex min-h-10 items-center justify-center gap-1 rounded-xl bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Liquidado neste ciclo</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => paySubscription(subscription.id)}
                    className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Pagar {privacyMode ? '' : formatCurrency(subscription.amount)}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remover a assinatura ${subscription.serviceName}?`)) {
                      deleteSubscription(subscription.id);
                    }
                  }}
                  className="mt-2 inline-flex min-h-9 items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                  aria-label={`Remover assinatura ${subscription.serviceName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remover
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {isAddOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-subscription-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={closeForm}
        >
          <div
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl border border-slate-100 bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 id="add-subscription-title" className="text-base font-bold text-slate-900 dark:text-white">
                Cadastrar assinatura
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Fechar cadastro"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nome do serviço
                <input
                  type="text"
                  required
                  maxLength={80}
                  autoFocus
                  value={serviceName}
                  onChange={(event) => setServiceName(event.target.value)}
                  placeholder="Ex.: Netflix, Spotify, academia"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Valor (R$)
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="29,90"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:text-sm"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Frequência
                  <select
                    value={billingFrequency}
                    onChange={(event) => setBillingFrequency(event.target.value as 'mensal' | 'anual')}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Categoria
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Próxima cobrança
                  <input
                    type="date"
                    required
                    value={nextBillingDate}
                    onChange={(event) => setNextBillingDate(event.target.value)}
                    className="mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cor do serviço
                <input
                  type="color"
                  value={brandColor}
                  onChange={(event) => setBrandColor(event.target.value)}
                  aria-label="Cor da assinatura"
                  className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-11 flex-1 rounded-xl bg-blue-600 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                >
                  Salvar assinatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
