import React from 'react';
import {
  LayoutDashboard,
  Plus,
  PieChart,
} from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';

export const BottomNav: React.FC = () => {
  const { activeBottomTab, setActiveBottomTab, setIsQuickActionOpen } = useFinology();

  return (
    <nav
      className="sticky bottom-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-colors"
      aria-label="Navegação Principal"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 items-center justify-items-center">
        {/* Início (Dashboard) */}
        <button
          type="button"
          onClick={() => setActiveBottomTab('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[72px] min-h-[46px] rounded-xl transition-all cursor-pointer ${
            activeBottomTab === 'dashboard'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 transition-transform ${activeBottomTab === 'dashboard' ? 'scale-110' : ''}`} />
            {activeBottomTab === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight leading-none font-medium">
            Início
          </span>
        </button>

        {/* Central Action Button (+) */}
        <div className="relative -top-3">
          <button
            type="button"
            onClick={() => setIsQuickActionOpen(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 hover:scale-105 active:scale-95 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Ação rápida: Adicionar despesa ou receita"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Orçamentos */}
        <button
          type="button"
          onClick={() => setActiveBottomTab('budgets')}
          className={`flex flex-col items-center justify-center min-w-[72px] min-h-[46px] rounded-xl transition-all cursor-pointer ${
            activeBottomTab === 'budgets'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
          }`}
        >
          <div className="relative">
            <PieChart className={`w-5 h-5 transition-transform ${activeBottomTab === 'budgets' ? 'scale-110' : ''}`} />
            {activeBottomTab === 'budgets' && (
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight leading-none font-medium">
            Orçamentos
          </span>
        </button>
      </div>
    </nav>
  );
};
