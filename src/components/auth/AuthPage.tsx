import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';

export const AuthPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, authError } = useFinology();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        const signedIn = await registerWithEmail(name, email, password);
        if (!signedIn) {
          setLocalError('Conta criada. Confira seu e-mail para confirmar o cadastro e depois entre.');
        }
      }
    } catch (error: unknown) {
      setLocalError(error instanceof Error ? error.message : 'Não foi possível autenticar. Confira seus dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: unknown) {
      setLocalError(error instanceof Error ? error.message : 'Não foi possível conectar com o Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-white flex items-center justify-center p-2 sm:p-8">
      <div className="w-full max-w-5xl min-h-0 lg:min-h-[560px] grid lg:grid-cols-2 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl">
        <section className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-blue-700 font-black text-xl flex items-center justify-center">F</div>
            <span className="text-xl font-extrabold tracking-tight">Finology</span>
          </div>
          <div className="max-w-md">
            <Fingerprint className="w-10 h-10 mb-6 text-blue-200" />
            <h1 className="text-4xl font-black leading-tight">Suas finanças, em um só lugar.</h1>
            <p className="mt-4 text-blue-100/80 leading-relaxed">
              Acompanhe suas contas, organize seu orçamento e tenha clareza sobre seu dinheiro.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-100/70">
            <ShieldCheck className="w-4 h-4" />
            Seus dados são protegidos pela sua conta
          </div>
        </section>

        <section className="flex flex-col justify-center p-4 sm:p-8 lg:p-7">
          <div className="flex items-center gap-3 mb-4 sm:mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center">F</div>
            <span className="text-lg font-extrabold tracking-tight">Finology</span>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-blue-400 mb-1.5">Bem-vindo ao Finology</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {mode === 'login' ? 'Entre para acessar seu painel financeiro.' : 'Comece a organizar sua vida financeira.'}
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-800 p-1 mb-3">
            <button
              type="button"
              onClick={() => { setMode('login'); setLocalError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setLocalError(null); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${mode === 'register' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Cadastrar
            </button>
          </div>

          {(localError || authError) && (
            <div role="status" className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
              {localError || authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            {mode === 'register' && (
              <label className="block text-sm font-medium text-slate-300">
                Nome completo
                <span className="relative mt-2 block">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-base text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                  />
                </span>
              </label>
            )}

            <label className="block text-sm font-medium text-slate-300">
              E-mail
              <span className="relative mt-2 block">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@exemplo.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-10 pr-4 text-base text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                />
              </span>
            </label>

            <label className="block text-sm font-medium text-slate-300">
              Senha
              <span className="relative mt-2 block">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-10 pr-12 text-base text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 py-2 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? 'Aguarde…' : mode === 'login' ? 'Entrar na conta' : 'Criar minha conta'}
            </button>
          </form>

          <div className="my-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-slate-800" />
            ou continue com
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-900 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            Continuar com Google
          </button>

          <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Autenticação segura pelo Supabase
          </p>
        </section>
      </div>
    </main>
  );
};
