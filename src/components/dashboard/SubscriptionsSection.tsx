import React from 'react';
import { Calendar, CheckCircle, CreditCard } from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

export const SubscriptionsSection: React.FC = () => {
  const { subscriptions, paySubscription, privacyMode } = useFinology();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Assinaturas Mensais
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Pagamentos recorrentes monitorados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subscriptions.map((sub) => {
          return (
            <div
              key={sub.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs text-xs"
                      style={{ backgroundColor: sub.brandColor }}
                    >
                      {sub.serviceName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[130px]">
                        {sub.serviceName}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {sub.category}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                    {privacyMode ? '••••' : formatCurrency(sub.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Vencimento: {formatDateShort(sub.nextBillingDate)}</span>
                </div>
              </div>

              {sub.isPaidThisMonth ? (
                <div className="flex items-center justify-center gap-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Liquidado neste mês</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => paySubscription(sub.id)}
                  className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pagar {privacyMode ? '' : formatCurrency(sub.amount)}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
