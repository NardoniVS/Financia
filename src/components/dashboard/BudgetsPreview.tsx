import React from 'react';
import { Utensils, ShoppingBag, Car, HeartPulse, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency } from '../../utils/formatters';

const getBudgetIcon = (iconName: string) => {
  switch (iconName) {
    case 'Utensils':
      return Utensils;
    case 'ShoppingBag':
      return ShoppingBag;
    case 'Car':
      return Car;
    case 'HeartPulse':
      return HeartPulse;
    default:
      return ShoppingBag;
  }
};

export const BudgetsPreview: React.FC = () => {
  const { budgets, privacyMode, setActiveBottomTab } = useFinology();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Orçamentos do Mês
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Acompanhamento de metas de gastos
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveBottomTab('budgets')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Ver todos</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Cards */}
      <div className="space-y-3">
        {budgets.slice(0, 3).map((budget) => {
          const Icon = getBudgetIcon(budget.iconName);
          const percent = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
          const isWarning = percent > 85;
          const isOver = percent >= 100;

          return (
            <div
              key={budget.id}
              onClick={() => setActiveBottomTab('budgets')}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: budget.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {budget.category}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {privacyMode ? '••••' : `${formatCurrency(budget.spent)} de ${formatCurrency(budget.limit)}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isOver
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: isOver ? '#EF4444' : isWarning ? '#F59E0B' : budget.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful Status Tip from mockup */}
      <div className="mt-3.5 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium leading-tight">
          Excelente! Seus gastos médios diários estão 18% abaixo do teto mensal previsto.
        </p>
      </div>
    </div>
  );
};
