import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col pb-6">
        {children}
      </div>
    </div>
  );
};
