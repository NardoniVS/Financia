import React, { useState } from 'react';
import {
  Bell,
  Search,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Database,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';

export const TopHeader: React.FC = () => {
  const {
    userProfile,
    privacyMode,
    togglePrivacyMode,
    theme,
    toggleTheme,
    setSpecificTheme,
    isSystemTheme,
    resetToSystemTheme,
    notifications,
    setIsNotificationOpen,
    setIsSearchOpen,
    setIsAuthModalOpen,
    isAuthenticated,
    logout,
  } = useFinology();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="w-full pt-4 pb-3 px-4 sm:px-6">
      {/* Upper Controls Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* User Greeting & Avatar with Profile Menu */}
        <div className="relative">
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-3 min-w-0 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 shadow-sm group-hover:ring-blue-500 transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Rodrigo+Ramos&background=1A5CFF&color=fff';
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-tight">
                  {isAuthenticated ? 'Conta Sincronizada' : 'Modo Demonstração'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {userProfile.name}
              </h1>
            </div>
          </div>

          {/* Profile & Auth Popover */}
          {isProfileMenuOpen && (
            <div
              className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-2xl border border-slate-100 dark:border-slate-800 z-50 animate-in fade-in slide-in-from-top-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userProfile.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {userProfile.email}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  <Database className="w-3 h-3" />
                  <span>Firestore Cloud DB Ativo</span>
                </div>
              </div>

              {/* Theme Selector (Claro / Escuro / Sistema) */}
              <div className="py-2.5 my-2 border-t border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Aparência
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {isSystemTheme ? 'Padrão do Sistema' : theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSpecificTheme('light')}
                    className={`flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-lg transition-all cursor-pointer ${
                      !isSystemTheme && theme === 'light'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpecificTheme('dark')}
                    className={`flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-lg transition-all cursor-pointer ${
                      !isSystemTheme && theme === 'dark'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Escuro</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetToSystemTheme}
                    className={`flex items-center justify-center gap-1 py-1.5 text-[11px] rounded-lg transition-all cursor-pointer ${
                      isSystemTheme
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Usar padrão do sistema (celular ou computador)"
                  >
                    <Monitor className="w-3.5 h-3.5 text-blue-500" />
                    <span>Auto</span>
                  </button>
                </div>
              </div>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Sair da Conta (Logout)</span>
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-between cursor-pointer shadow-sm"
                >
                  <span>Fazer Login / Cadastrar</span>
                  <LogIn className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* If not authenticated, prominent Login button */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}

          {/* Privacy Toggle */}
          <button
            type="button"
            onClick={togglePrivacyMode}
            title={privacyMode ? "Mostrar valores" : "Ocultar valores sensíveis"}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Alternar privacidade de saldo"
          >
            {privacyMode ? <EyeOff className="w-4 h-4 text-amber-500" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Theme Toggle Button (Modo Claro / Modo Escuro) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={
              theme === 'dark'
                ? 'Mudar para modo claro (Atualmente no modo escuro)'
                : 'Mudar para modo escuro (Atualmente no modo claro)'
            }
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Alternar tema claro e escuro"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Buscar transações, ações ou categorias"
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Buscar no Finology"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            title="Ver notificações"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>
      </div>

    </header>
  );
};
