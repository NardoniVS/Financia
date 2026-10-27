import React, { useState } from 'react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency } from '../../utils/formatters';

interface SpendingCategory {
  category: string;
  amount: number;
  color: string;
  percent: number;
}

const categoryColors: Record<string, string> = {
  'Alimentação': '#3B82F6',
  'Lazer & Compras': '#EC4899',
  'Transporte': '#10B981',
  'Saúde': '#F59E0B',
  'Serviços & Assinaturas': '#8B5CF6',
  'Moradia': '#06B6D4',
  'Educação': '#F97316',
  'Cuidados pessoais': '#D946EF',
  'Pets': '#84CC16',
  'Viagens': '#14B8A6',
  'Impostos & Taxas': '#EF4444',
  'Outros': '#94A3B8',
};

const getCategoryColor = (category: string) => {
  if (categoryColors[category]) return categoryColors[category];

  const hash = Array.from(category).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  return `hsl(${hash % 360}, 72%, 62%)`;
};

export const SpendingsDonut: React.FC = () => {
  const { transactions, privacyMode } = useFinology();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group expenses by category
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const categoryTotals = new Map<string, number>();
  expenseTransactions.forEach((transaction) => {
    categoryTotals.set(
      transaction.category,
      (categoryTotals.get(transaction.category) ?? 0) + Math.abs(transaction.amount),
    );
  });

  const categories: SpendingCategory[] = Array.from(categoryTotals, ([category, amount]) => ({
    category,
    amount,
    color: getCategoryColor(category),
    percent: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const segmentGap = 3;

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
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90 overflow-visible">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800"
            />
            {categories.map((cat) => {
              const arcLength = (cat.percent / 100) * circumference;
              const strokeDasharray = `${Math.max(0, arcLength - segmentGap)} ${circumference}`;
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
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  opacity={hoveredCategory && !isHovered ? 0.55 : 1}
                  className="cursor-pointer transition-[stroke-width,opacity] duration-150 ease-out"
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
        <div className="min-w-0 flex-1 w-full space-y-2">
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
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="min-w-0 flex-1 font-medium text-slate-700 dark:text-slate-300 truncate sm:max-w-[130px]">
                  {cat.category}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">{Math.round(cat.percent)}%</span>
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
