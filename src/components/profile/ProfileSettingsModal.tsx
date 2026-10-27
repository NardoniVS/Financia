import React, { useRef, useState } from 'react';
import { CalendarDays, Camera, KeyRound, LoaderCircle, Mail, Save, ShieldAlert, Trash2, UserRound, X } from 'lucide-react';
import { useFinology } from '../../context/FinologyContext';

interface ProfileSettingsModalProps {
  onClose: () => void;
}

const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ onClose }) => {
  const { userProfile, updateAccountProfile, uploadProfileAvatar, deleteAccount } = useFinology();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [birthDate, setBirthDate] = useState(userProfile.birthDate);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const emailChanged = await updateAccountProfile({ name, email, birthDate, password: password || undefined });
      setPassword('');
      setNotice(emailChanged
        ? 'Perfil atualizado. Confirme as mensagens de verificação enviadas para concluir a troca de e-mail.'
        : 'Perfil atualizado com sucesso.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setNotice('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use uma imagem JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 3 MB.');
      return;
    }
    setUploading(true);
    try {
      await uploadProfileAvatar(file);
      setNotice('Foto de perfil atualizada.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmation !== 'APAGAR') return;
    setError('');
    setDeleting(true);
    try {
      await deleteAccount();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível excluir a conta.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving && !uploading && !deleting) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-settings-title" className="max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:rounded-3xl sm:p-6">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="profile-settings-title" className="text-xl font-extrabold text-slate-900 dark:text-white">Editar perfil</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Atualize seus dados e as informações de acesso.</p>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose} disabled={saving || uploading || deleting} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
        </header>

        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
          <img src={userProfile.avatarUrl} alt="Foto do perfil" className="h-16 w-16 rounded-full object-cover ring-2 ring-white dark:ring-slate-700" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{userProfile.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">JPG, PNG ou WebP · até 3 MB</p>
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void handleAvatarChange(event)} />
          <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading || saving} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
            {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            Alterar foto
          </button>
        </div>

        <form onSubmit={(event) => void handleSave(event)} className="space-y-3.5">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" />Nome</span>
            <input className={fieldClass} type="text" autoComplete="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />E-mail</span>
            <input className={fieldClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Data de nascimento</span>
            <input className={fieldClass} type="date" autoComplete="bday" max={today} value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
          </label>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" />Nova senha <span className="font-normal text-slate-400">(opcional)</span></span>
            <input className={fieldClass} type="password" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Deixe em branco para manter a senha atual" />
          </label>

          {(notice || error) && <p role="status" className={`rounded-xl p-3 text-sm ${error ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'}`}>{error || notice}</p>}

          <button type="submit" disabled={saving || uploading || deleting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold text-rose-700 dark:text-rose-300"><ShieldAlert className="h-4 w-4" />Excluir conta</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">A exclusão apaga seu perfil, foto e dados financeiros. Essa ação não pode ser desfeita.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input className={`${fieldClass} mt-0 sm:flex-1`} type="text" autoComplete="off" value={confirmation} onChange={(event) => setConfirmation(event.target.value.toUpperCase())} placeholder="Digite APAGAR para confirmar" aria-label="Digite APAGAR para confirmar a exclusão" />
            <button type="button" disabled={confirmation !== 'APAGAR' || deleting || saving} onClick={() => void handleDelete()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40">
              {deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? 'Excluindo…' : 'Excluir conta'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
