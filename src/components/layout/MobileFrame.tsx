import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full min-w-0 overflow-x-clip bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      <div className="w-full min-w-0 max-w-screen-2xl mx-auto flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
