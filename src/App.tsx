/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { FinologyProvider, useFinology } from './context/FinologyContext';
import { MobileFrame } from './components/layout/MobileFrame';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNav } from './components/layout/BottomNav';

// Dashboard Components
import { BalanceCard } from './components/dashboard/BalanceCard';
import { TransactionsList } from './components/dashboard/TransactionsList';
import { BudgetsPreview } from './components/dashboard/BudgetsPreview';
import { SpendingsDonut } from './components/dashboard/SpendingsDonut';
import { SubscriptionsSection } from './components/dashboard/SubscriptionsSection';

// Budgets Screen & Modals
const BudgetsScreen = lazy(() => import('./components/budgets/BudgetsScreen').then((module) => ({ default: module.BudgetsScreen })));
const AdminPage = lazy(() => import('./components/admin/AdminPage').then((module) => ({ default: module.AdminPage })));

// Common Modals & Auth
const QuickActionModal = lazy(() => import('./components/common/QuickActionModal').then((module) => ({ default: module.QuickActionModal })));
const NotificationModal = lazy(() => import('./components/common/NotificationModal').then((module) => ({ default: module.NotificationModal })));
const SearchModal = lazy(() => import('./components/common/SearchModal').then((module) => ({ default: module.SearchModal })));
const AuthPage = lazy(() => import('./components/auth/AuthPage').then((module) => ({ default: module.AuthPage })));

const MainAppContent: React.FC = () => {
  const {
    activeBottomTab,
    currentUser,
    isAuthReady,
    isPasswordRecovery,
    isAdmin,
    isQuickActionOpen,
    isNotificationOpen,
    isSearchOpen,
  } = useFinology();

  if (!isAuthReady) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-sm font-medium text-slate-400">
        Carregando sua conta…
      </main>
    );
  }

  if (!currentUser || isPasswordRecovery) {
    return (
      <Suspense fallback={<main className="min-h-screen flex items-center justify-center text-sm text-slate-400">Carregando…</main>}>
        <AuthPage />
      </Suspense>
    );
  }

  return (
    <MobileFrame>
      <TopHeader />

      <main className="w-full min-w-0 flex-1 px-4 sm:px-6 py-4 space-y-6">
        {/* Route: Orçamentos */}
        <Suspense fallback={<div className="min-h-[40vh]" aria-label="Carregando tela" />}>
          {activeBottomTab === 'admin' && isAdmin ? (
            <AdminPage />
          ) : activeBottomTab === 'budgets' ? (
            <BudgetsScreen />
          ) : (
            /* Route: Início / Dashboard */
            <div className="grid min-w-0 grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="min-w-0 space-y-6">
                <BalanceCard />
                <TransactionsList limit={0} />
              </div>
              <div className="min-w-0 space-y-6">
                <BudgetsPreview />
                <SpendingsDonut />
                <SubscriptionsSection />
              </div>
            </div>
          )}
        </Suspense>
      </main>

      <BottomNav />

      {/* Interactive Global Modals */}
      {isQuickActionOpen && <Suspense fallback={null}><QuickActionModal /></Suspense>}
      {isNotificationOpen && <Suspense fallback={null}><NotificationModal /></Suspense>}
      {isSearchOpen && <Suspense fallback={null}><SearchModal /></Suspense>}
    </MobileFrame>
  );
};

export default function App() {
  return (
    <FinologyProvider>
      <MainAppContent />
    </FinologyProvider>
  );
}
