import React from 'react';
import { X, Bell, Check, Sparkles, AlertCircle, TrendingUp, ShieldCheck } from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';

export const NotificationModal: React.FC = () => {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
  } = useFinology();

  if (!isNotificationOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'dividend':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'budget_alert':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={() => setIsNotificationOpen(false)}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Notificações
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsNotificationOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Nenhuma notificação recente.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                  notif.read
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                    : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {notif.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={clearAllNotifications}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold cursor-pointer"
          >
            Limpar todas
          </button>
          <button
            type="button"
            onClick={() => setIsNotificationOpen(false)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
