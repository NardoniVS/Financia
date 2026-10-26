import React, { useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ChevronDown, PlusCircle } from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency } from '../../utils/formatters';
import { RechartsBalanceLine, BalancePoint } from './RechartsBalanceLine';

export const BalanceCard: React.FC = () => {
  const {
    totalBalance,
    totalIncome,
    totalExpense,
    privacyMode,
    setIsQuickActionOpen,
    transactions,
  } = useFinology();

  const [selectedPeriod, setSelectedPeriod] = useState<'Mês atual' | 'Mês anterior' | 'Tudo'>('Mês atual');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<BalancePoint | null>(null);

  const currentData = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const start = selectedPeriod === 'Mês atual'
      ? thisMonthStart
      : selectedPeriod === 'Mês anterior'
        ? lastMonthStart
        : null;
    const end = selectedPeriod === 'Mês atual'
      ? nextMonthStart
      : selectedPeriod === 'Mês anterior'
        ? thisMonthStart
        : null;

    const datedTransactions = transactions
      .map((transaction) => ({ transaction, date: new Date(transaction.date) }))
      .filter(({ date }) => !Number.isNaN(date.getTime()));
    const periodTransactions = datedTransactions
      .filter(({ date }) => (!start || date >= start) && (!end || date < end))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (periodTransactions.length === 0) return [];

    const changesSincePeriodStart = datedTransactions
      .filter(({ date }) => !start || date >= start)
      .reduce((sum, { transaction }) => sum + transaction.amount, 0);
    let runningBalance = totalBalance - changesSincePeriodStart;
    const dailyFlows = new Map<string, { date: Date; flow: number }>();

    for (const { transaction, date } of periodTransactions) {
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const day = dailyFlows.get(dayKey) ?? { date, flow: 0 };
      day.flow += transaction.amount;
      dailyFlows.set(dayKey, day);
    }

    return Array.from(dailyFlows.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, flow }) => {
        runningBalance += flow;
        return {
          date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date).replace('.', ''),
          fullDate: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date),
          balance: runningBalance,
          flow,
        };
      });
  }, [selectedPeriod, totalBalance, transactions]);

  // If user is hovering a specific point, reflect that value in the header
  const displayBalance = hoveredPoint ? hoveredPoint.balance : totalBalance;
  const displayDateNotice = hoveredPoint
    ? `Saldo em ${hoveredPoint.fullDate}`
    : currentData.length > 0 ? 'Histórico calculado pelos seus lançamentos' : 'Sem movimentações neste período';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 sm:p-6 text-white shadow-xl shadow-blue-700/20">
      {/* Background soft geometric mesh glows */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header inside Card */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">
            {hoveredPoint ? 'Ponto Selecionado' : 'Saldo Total Disponível'}
          </span>
        </div>

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
            className="flex items-center gap-1 text-xs font-semibold bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full text-white transition-colors cursor-pointer"
          >
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isPeriodMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-28 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-xl py-1 text-xs z-30 border border-slate-100 dark:border-slate-800">
              {(['Mês atual', 'Mês anterior', 'Tudo'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(period);
                    setIsPeriodMenuOpen(false);
                    setHoveredPoint(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                    selectedPeriod === period ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Balance Display */}
      <div className="relative z-10 mb-1">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums transition-all">
          {privacyMode ? '••••••••' : formatCurrency(displayBalance)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs ${hoveredPoint ? 'text-amber-200 font-semibold' : 'text-blue-200'}`}>
            {privacyMode ? '••••' : displayDateNotice}
          </span>
        </div>
      </div>

      {/* Interactive Recharts Line Graph with Touch/Hover Tooltip */}
      <div className="relative z-10 my-2 -mx-2">
        <RechartsBalanceLine
          data={currentData}
          privacyMode={privacyMode}
          onHoverPoint={(pt) => setHoveredPoint(pt)}
        />
      </div>

      {/* Bottom Summary Bar with mini metrics */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/15 grid grid-cols-2 gap-3 text-center">
        {/* Entradas */}
        <div className="bg-white/10 hover:bg-white/15 transition-colors p-2.5 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-200 mb-0.5">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-300" />
            <span>Total Receitas</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-emerald-300 tabular-nums truncate">
            {privacyMode ? '••••' : formatCurrency(totalIncome)}
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white/10 hover:bg-white/15 transition-colors p-2.5 rounded-xl">
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-200 mb-0.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-300" />
            <span>Total Despesas</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-rose-300 tabular-nums truncate">
            {privacyMode ? '••••' : formatCurrency(-totalExpense)}
          </div>
        </div>
      </div>

      {/* Quick Action Shortcut inside card */}
      <div className="relative z-10 mt-3">
        <button
          type="button"
          onClick={() => setIsQuickActionOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-all shadow flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Novo Lançamento (Receita / Despesa)</span>
        </button>
      </div>
    </div>
  );
};
