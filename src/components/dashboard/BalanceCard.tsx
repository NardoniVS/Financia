import React, { lazy, Suspense, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ArrowDownLeft, ChevronDown, PlusCircle } from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';
import { formatCurrency } from '../../utils/formatters';
import type { BalancePoint } from './RechartsBalanceLine';

const RechartsBalanceLine = lazy(() => import('./RechartsBalanceLine').then((module) => ({ default: module.RechartsBalanceLine })));

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
  const [grouping, setGrouping] = useState<'day' | 'month'>('day');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [periodMenuPosition, setPeriodMenuPosition] = useState({ top: 0, right: 0 });
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
      .map((transaction) => ({
        transaction,
        date: /^\d{4}-\d{2}-\d{2}$/.test(transaction.date)
          ? new Date(`${transaction.date}T00:00:00`)
          : new Date(transaction.date),
      }))
      .filter(({ date }) => !Number.isNaN(date.getTime()));
    if (datedTransactions.length === 0) return [];
    const periodTransactions = datedTransactions
      .filter(({ date }) => (!start || date >= start) && (!end || date < end))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const changesSincePeriodStart = datedTransactions
      .filter(({ date }) => !start || date >= start)
      .reduce((sum, { transaction }) => sum + transaction.amount, 0);
    let runningBalance = totalBalance - changesSincePeriodStart;
    const groupedFlows = new Map<string, { date: Date; flow: number }>();

    for (const { transaction, date } of periodTransactions) {
      const key = grouping === 'day'
        ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        : `${date.getFullYear()}-${date.getMonth()}`;
      const bucketDate = grouping === 'day' ? date : new Date(date.getFullYear(), date.getMonth(), 1);
      const bucket = groupedFlows.get(key) ?? { date: bucketDate, flow: 0 };
      bucket.flow += transaction.amount;
      groupedFlows.set(key, bucket);
    }

    if (grouping === 'day') {
      const firstTransaction = periodTransactions[0]?.date ?? datedTransactions[0].date;
      const rangeStart = start
        ? new Date(start)
        : new Date(firstTransaction.getFullYear(), firstTransaction.getMonth(), 1);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date();
      rangeEnd.setHours(0, 0, 0, 0);
      if (end && end <= rangeEnd) rangeEnd.setTime(end.getTime() - 1);
      rangeEnd.setHours(0, 0, 0, 0);
      const dailyPoints: { date: Date; flow: number }[] = [];
      for (const day = new Date(rangeStart); day <= rangeEnd; day.setDate(day.getDate() + 1)) {
        const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
        dailyPoints.push({ date: new Date(day), flow: groupedFlows.get(key)?.flow ?? 0 });
      }
      groupedFlows.clear();
      dailyPoints.forEach((point, index) => groupedFlows.set(String(index), point));
    }

    return Array.from(groupedFlows.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, flow }) => {
        runningBalance += flow;
        return {
          date: new Intl.DateTimeFormat('pt-BR', grouping === 'day' ? { day: '2-digit', month: 'short' } : { month: 'short', year: '2-digit' }).format(date).replace('.', ''),
          fullDate: new Intl.DateTimeFormat('pt-BR', grouping === 'day' ? { dateStyle: 'long' } : { month: 'long', year: 'numeric' }).format(date),
          balance: runningBalance,
          flow,
        };
      });
  }, [grouping, selectedPeriod, totalBalance, transactions]);

  // If user is hovering a specific point, reflect that value in the header
  const displayBalance = hoveredPoint ? hoveredPoint.balance : totalBalance;
  const displayDateNotice = hoveredPoint
    ? `Saldo em ${hoveredPoint.fullDate}`
    : currentData.length > 0 ? 'Histórico calculado pelos seus lançamentos' : 'Sem movimentações neste período';

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 sm:p-6 text-white shadow-xl shadow-blue-700/20">
      {/* Keep decorative glows clipped without clipping the period menu. */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
      </div>

      {/* Top Header inside Card */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-[170px] text-[10px] leading-tight font-medium text-blue-100 uppercase tracking-wider sm:max-w-none sm:text-xs">
            {hoveredPoint ? 'Ponto Selecionado' : 'Saldo Total Disponível'}
          </span>
        </div>

        {/* Period Selector Dropdown */}
        <div>
          <button
            type="button"
            aria-label="Selecionar período do gráfico de saldo"
            aria-haspopup="listbox"
            aria-expanded={isPeriodMenuOpen}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setPeriodMenuPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
              setIsPeriodMenuOpen((open) => !open);
            }}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-950/10 transition-colors hover:border-white/35 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span>{selectedPeriod}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isPeriodMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isPeriodMenuOpen && createPortal(
            <>
              <button
                type="button"
                aria-label="Fechar opções de período"
                className="fixed inset-0 z-[9998] cursor-default"
                onClick={() => setIsPeriodMenuOpen(false)}
              />
              <div
                role="listbox"
                aria-label="Período do gráfico de saldo"
                style={{ top: periodMenuPosition.top, right: periodMenuPosition.right }}
                className="fixed z-[9999] min-w-36 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 p-1 text-xs text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
              >
                {(['Mês atual', 'Mês anterior', 'Tudo'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    role="option"
                    aria-selected={selectedPeriod === period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsPeriodMenuOpen(false);
                      setHoveredPoint(null);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-500/20 ${
                      selectedPeriod === period ? 'bg-blue-500/15 font-semibold text-blue-300' : 'text-slate-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </>,
            document.body,
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
        <div className="mb-1 flex justify-end px-2">
          <div className="inline-flex rounded-lg bg-slate-950/20 p-0.5" role="group" aria-label="Agrupar gráfico por">
            <button type="button" aria-pressed={grouping === 'day'} onClick={() => { setGrouping('day'); setHoveredPoint(null); }} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${grouping === 'day' ? 'bg-white/20 text-white' : 'text-blue-100/70 hover:text-white'}`}>Dia</button>
            <button type="button" aria-pressed={grouping === 'month'} onClick={() => { setGrouping('month'); setHoveredPoint(null); }} className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${grouping === 'month' ? 'bg-white/20 text-white' : 'text-blue-100/70 hover:text-white'}`}>Mês</button>
          </div>
        </div>
        <Suspense fallback={<div className="h-[120px] w-full animate-pulse rounded-xl bg-white/10" aria-label="Carregando gráfico" />}>
          <RechartsBalanceLine
            data={currentData}
            privacyMode={privacyMode}
            onHoverPoint={(pt) => setHoveredPoint(pt)}
          />
        </Suspense>
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
