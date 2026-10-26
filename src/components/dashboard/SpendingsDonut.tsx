import React, { useState } from 'react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency } from '../../utils/formatters';

interface SpendingCategory {
  category: string;
  amount: number;
  color: string;
  percent: number;
}

export const SpendingsDonut: React.FC = () => {
  const { transactions, privacyMode } = useFinology();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group expenses by category
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0) || 1;

  const categoryMap: { [key: string]: { amount: number; color: string } } = {
    'Alimentação': { amount: 0, color: '#3B82F6' },
    'Lazer & Compras': { amount: 0, color: '#EC4899' },
    'Transporte': { amount: 0, color: '#10B981' },
    'Saúde': { amount: 0, color: '#F59E0B' },
    'Serviços & Assinaturas': { amount: 0, color: '#8B5CF6' },
  };

  expenseTransactions.forEach(t => {
    if (categoryMap[t.category]) {
      categoryMap[t.category].amount += Math.abs(t.amount);
    } else {
      categoryMap['Lazer & Compras'].amount += Math.abs(t.amount);
    }
  });

  const categories: SpendingCategory[] = Object.keys(categoryMap).map(cat => ({
    category: cat,
    amount: categoryMap[cat].amount,
    color: categoryMap[cat].color,
    percent: Math.round((categoryMap[cat].amount / totalExpense) * 100),
  })).filter(c => c.amount > 0);

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Gastos por Categoria
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Distribuição dos gastos da conta
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {categories.map((cat) => {
              const strokeDasharray = `${(cat.percent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += cat.percent;

              const isHovered = hoveredCategory === cat.category;

              return (
                <circle
                  key={cat.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(cat.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {hoveredCategory || 'Total Gasto'}
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
              {privacyMode
                ? '••••'
                : formatCurrency(
                    hoveredCategory
                      ? (categories.find(c => c.category === hoveredCategory)?.amount || totalExpense)
                      : totalExpense
                  )}
            </span>
            <span className="text-[10px] text-slate-400">
              {expenseTransactions.length} transações
            </span>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="flex-1 w-full space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.category}
              onMouseEnter={() => setHoveredCategory(cat.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                hoveredCategory === cat.category
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                  {cat.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">{cat.percent}%</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {privacyMode ? '•••' : formatCurrency(cat.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
