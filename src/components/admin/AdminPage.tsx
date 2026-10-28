import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';

interface AdminProfile {
  user_id: string;
  name: string;
  email: string;
  account_level: string;
  created_at: string;
}

export const AdminPage: React.FC = () => {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await getSupabase()
        .from('profiles')
        .select('user_id, name, email, account_level, created_at')
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      setProfiles(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const freeAccounts = profiles.filter((profile) => profile.account_level === 'Gratuito').length;
  const paidAccounts = profiles.length - freeAccounts;

  const deleteFinancialData = async () => {
    if (!selectedProfile || confirmationText.trim().toUpperCase() !== 'APAGAR') return;
    setDeleting(true);
    setError(null);
    setActionError(null);
    setNotice(null);
    try {
      const { error: deleteError } = await getSupabase().rpc('admin_delete_financial_data', {
        p_user_id: selectedProfile.user_id,
      });
      if (deleteError) throw deleteError;
      setNotice(`Os dados financeiros de ${selectedProfile.name} foram apagados. O perfil e o acesso à conta foram mantidos.`);
      setSelectedProfile(null);
      setConfirmationText('');
    } catch (err) {
      const dbError = err as { message?: string; details?: string; hint?: string; code?: string };
      setActionError([
        dbError.message || (err instanceof Error ? err.message : 'Não foi possível apagar os dados financeiros.'),
        dbError.code ? `Código: ${dbError.code}` : '',
        dbError.details || '',
        dbError.hint ? `Dica: ${dbError.hint}` : '',
      ].filter(Boolean).join(' — '));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Administração</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Painel administrador</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Visão geral das contas cadastradas no TudoOk.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadProfiles()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Falha ao carregar os usuários</p>
            <p className="mt-1 break-words">{error}</p>
            <p className="mt-2 text-xs">Confirme que a migração administrativa foi aplicada e que seu usuário recebeu a função admin no Supabase.</p>
          </div>
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          {notice}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Contas cadastradas" value={loading ? '—' : String(profiles.length)} icon={<Users className="h-5 w-5" />} />
        <SummaryCard label="Plano gratuito" value={loading ? '—' : String(freeAccounts)} />
        <SummaryCard label="Outros planos" value={loading ? '—' : String(paidAccounts)} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Usuários</h3>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-slate-500 dark:text-slate-400">Carregando usuários…</p>
        ) : profiles.length === 0 && !error ? (
          <p className="p-5 text-sm text-slate-500 dark:text-slate-400">Nenhum perfil cadastrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold">E-mail</th>
                  <th className="px-5 py-3 font-semibold">Plano</th>
                  <th className="px-5 py-3 font-semibold">Cadastro</th>
                  <th className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profiles.map((profile) => (
                  <tr key={profile.user_id} className="text-slate-700 dark:text-slate-300">
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">{profile.name}</td>
                    <td className="px-5 py-3">{profile.email}</td>
                    <td className="px-5 py-3">{profile.account_level}</td>
                    <td className="px-5 py-3">{new Date(profile.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setConfirmationText('');
                          setNotice(null);
                          setActionError(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Apagar dados
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedProfile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setSelectedProfile(null);
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="delete-financial-data-title" className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 id="delete-financial-data-title" className="text-lg font-bold text-slate-900 dark:text-white">Apagar dados financeiros?</h3>
              </div>
              <button type="button" aria-label="Fechar" disabled={deleting} onClick={() => setSelectedProfile(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Isso apagará transações, orçamentos, cartões, contas e ativos de <strong className="text-slate-900 dark:text-white">{selectedProfile.name}</strong> ({selectedProfile.email}). O perfil e o login serão mantidos. Esta ação não pode ser desfeita.
            </p>
            {actionError && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{actionError}</p>}
            <label className="mt-4 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Digite <span className="font-mono text-rose-600 dark:text-rose-300">APAGAR</span> para confirmar
            <input
                autoFocus
                value={confirmationText}
                onChange={(event) => setConfirmationText(event.target.value)}
                autoCapitalize="characters"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-rose-900/50"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={deleting} onClick={() => setSelectedProfile(null)} className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancelar</button>
              <button type="button" disabled={deleting || confirmationText.trim().toUpperCase() !== 'APAGAR'} onClick={() => void deleteFinancialData()} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Apagando…' : 'Apagar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const SummaryCard: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
      {icon ?? <ShieldCheck className="h-5 w-5" />}
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
  </div>
);
