import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Utensils,
  ShoppingBag,
  Car,
  HeartPulse,
  AlertTriangle,
  CheckCircle,
  Sliders,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency } from '../../utils/formatters';
import { SpendingsDonut } from '../dashboard/SpendingsDonut';
import { SubscriptionsSection } from '../dashboard/SubscriptionsSection';
import { Budget } from '../../types/finology';

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

export const BudgetsScreen: React.FC = () => {
  const { budgets, updateBudgetLimit, addBudget, privacyMode } = useFinology();
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<string>('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New budget form state
  const [newCategory, setNewCategory] = useState('Educação');
  const [newBudgetAmount, setNewBudgetAmount] = useState('600');

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPercent = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

  const handleSaveLimit = () => {
    if (!selectedBudget) return;
    const num = parseFloat(newLimitInput);
    if (!isNaN(num) && num > 0) {
      updateBudgetLimit(selectedBudget.id, num);
      setSelectedBudget(null);
    }
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newBudgetAmount);
    if (isNaN(amount) || amount <= 0) return;

    addBudget({
      category: newCategory as any,
      limit: amount,
      spent: 0,
      iconName: 'ShoppingBag',
      color: '#8B5CF6',
      month: 'Outubro 2026',
    });

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Monthly Budget High-Level Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Orçamento de Outubro 2026
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Teto</span>
          </button>
        </div>

        {/* Global Progress */}
        <div className="my-3">
          <div className="flex justify-between items-baseline mb-1 text-xs">
            <span className="font-semibold text-slate-500">
              Total Gasto: <strong className="text-slate-900 dark:text-white">{privacyMode ? '••••' : formatCurrency(totalSpent)}</strong>
            </span>
            <span className="font-semibold text-slate-500">
              Limite Global: <strong className="text-slate-900 dark:text-white">{privacyMode ? '••••' : formatCurrency(totalBudgeted)}</strong>
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>{overallPercent}% consumido</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {privacyMode ? '••••' : `${formatCurrency(totalRemaining)} disponível`}
            </span>
          </div>
        </div>
      </div>

      {/* Category Limits Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Metas por Categoria
        </h3>

        <div className="space-y-3">
          {budgets.map((budget) => {
            const Icon = getBudgetIcon(budget.iconName);
            const percent = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
            const isWarning = percent >= 85;
            const remaining = Math.max(0, budget.limit - budget.spent);

            return (
              <div
                key={budget.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-200 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: budget.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {budget.category}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {privacyMode ? '••••' : `${formatCurrency(budget.spent)} gastos de ${formatCurrency(budget.limit)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        percent >= 100
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {percent}%
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBudget(budget);
                        setNewLimitInput(budget.limit.toString());
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      title="Ajustar limite"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: percent >= 100 ? '#EF4444' : isWarning ? '#F59E0B' : budget.color,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 font-medium">
                  <span>{percent >= 100 ? '⚠️ Limite estourado' : isWarning ? '⚡ Alerta: limite próximo' : '✅ Gastos saudáveis'}</span>
                  <span>Restante: {privacyMode ? '•••' : formatCurrency(remaining)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spendings Donut Section */}
      <SpendingsDonut />

      {/* Monthly Subscriptions Monitoring */}
      <SubscriptionsSection />

      {/* Edit Budget Limit Modal */}
      {selectedBudget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedBudget(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Ajustar Teto de {selectedBudget.category}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Defina o novo valor máximo de gastos mensal para esta categoria.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Novo Limite (R$)
              </label>
              <input
                type="number"
                value={newLimitInput}
                onChange={(e) => setNewLimitInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedBudget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveLimit}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                Salvar Limite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Budget Category Modal */}
      {isAddOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Criar Novo Orçamento
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Estipule metas para novas categorias de despesas.
            </p>

            <form onSubmit={handleCreateBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Categoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Educação">Educação</option>
                  <option value="Moradia">Moradia & Contas</option>
                  <option value="Saúde">Saúde & Farmácia</option>
                  <option value="Serviços & Assinaturas">Serviços & Assinaturas</option>
                  <option value="Outros">Outros Gastos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Limite Mensal (R$)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  placeholder="Ex: 800"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  Criar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
