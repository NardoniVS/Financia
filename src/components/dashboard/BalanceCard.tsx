import React, { useState } from 'react';
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
  } = useFinology();

  const [selectedPeriod, setSelectedPeriod] = useState<'Outubro' | 'Setembro' | 'Total'>('Outubro');
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<BalancePoint | null>(null);

  // Dynamic datasets per period with realistic points
  const datasets: Record<'Outubro' | 'Setembro' | 'Total', BalancePoint[]> = {
    Outubro: [
      { date: '01 Out', fullDate: '01 de Outubro', balance: 39500, flow: 1200 },
      { date: '05 Out', fullDate: '05 de Outubro', balance: 41200, flow: 1700 },
      { date: '10 Out', fullDate: '10 de Outubro', balance: 40100, flow: -1100 },
      { date: '15 Out', fullDate: '15 de Outubro', balance: 43400, flow: 3300 },
      { date: '20 Out', fullDate: '20 de Outubro', balance: 42800, flow: -600 },
      { date: '23 Out', fullDate: '23 de Outubro', balance: 44200, flow: 1400 },
      { date: 'Hoje', fullDate: '26 de Outubro (Hoje)', balance: totalBalance, flow: 1090.33 },
    ],
    Setembro: [
      { date: '01 Set', fullDate: '01 de Setembro', balance: 34200, flow: 850 },
      { date: '08 Set', fullDate: '08 de Setembro', balance: 36500, flow: 2300 },
      { date: '15 Set', fullDate: '15 de Setembro', balance: 35800, flow: -700 },
      { date: '22 Set', fullDate: '22 de Setembro', balance: 38100, flow: 2300 },
      { date: '30 Set', fullDate: '30 de Setembro', balance: 39500, flow: 1400 },
    ],
    Total: [
      { date: 'Mai', fullDate: 'Maio de 2026', balance: 28000, flow: 3200 },
      { date: 'Jun', fullDate: 'Junho de 2026', balance: 31400, flow: 3400 },
      { date: 'Jul', fullDate: 'Julho de 2026', balance: 33900, flow: 2500 },
      { date: 'Ago', fullDate: 'Agosto de 2026', balance: 36200, flow: 2300 },
      { date: 'Set', fullDate: 'Setembro de 2026', balance: 39500, flow: 3300 },
      { date: 'Out', fullDate: 'Outubro de 2026 (Atual)', balance: totalBalance, flow: 6320.76 },
    ],
  };

  const currentData = datasets[selectedPeriod];

  // If user is hovering a specific point, reflect that value in the header
  const displayBalance = hoveredPoint ? hoveredPoint.balance : totalBalance;
  const displayDateNotice = hoveredPoint
    ? `Saldo em ${hoveredPoint.fullDate}`
    : '+12,4% no mês · Atualizado há 2 min';

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
              {(['Outubro', 'Setembro', 'Total'] as const).map((period) => (
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
