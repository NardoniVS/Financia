/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
import { BudgetsScreen } from './components/budgets/BudgetsScreen';
import { AdminPage } from './components/admin/AdminPage';

// Common Modals & Auth
import { QuickActionModal } from './components/common/QuickActionModal';
import { NotificationModal } from './components/common/NotificationModal';
import { SearchModal } from './components/common/SearchModal';
import { AuthPage } from './components/auth/AuthPage';

const MainAppContent: React.FC = () => {
  const { activeBottomTab, currentUser, isAuthReady, isAdmin } = useFinology();

  if (!isAuthReady) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-sm font-medium text-slate-400">
        Carregando sua conta…
      </main>
    );
  }

  if (!currentUser) return <AuthPage />;

  return (
    <MobileFrame>
      <TopHeader />

      <main className="flex-1 px-4 sm:px-6 py-4 space-y-6">
        {/* Route: Orçamentos */}
        {activeBottomTab === 'admin' && isAdmin ? (
          <AdminPage />
        ) : activeBottomTab === 'budgets' ? (
          <BudgetsScreen />
        ) : (
          /* Route: Início / Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <BalanceCard />
              <TransactionsList limit={5} />
              <SubscriptionsSection />
            </div>
            <div className="space-y-6">
              <BudgetsPreview />
              <SpendingsDonut />
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      {/* Interactive Global Modals */}
      <QuickActionModal />
      <NotificationModal />
      <SearchModal />
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
