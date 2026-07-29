import React, { useState } from 'react';
import { Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, pass: string) => Promise<{ success: boolean; message?: string }>;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await onLogin(username.trim(), password);
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#09090b] px-4 py-12 overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-amber-600/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800/80 bg-[#121215]/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 font-black text-2xl text-black shadow-xl shadow-amber-500/20">
            HO
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase">HERMANO’S CONTROL</h1>
          <p className="mt-1 text-xs text-zinc-400">Sistema ERP Oficial — Hermano’s Outfit</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" method="post">
          {/* Dummy hidden inputs to divert aggressive browser autofill */}
          <input type="text" name="prevent_autofill_username" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
          <input type="password" name="prevent_autofill_password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300" htmlFor="username_input">
              Usuário do Sistema
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                id="username_input"
                type="text"
                name="username_no_autofill"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                placeholder="Informe seu usuário..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 transition-all focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300" htmlFor="password_input">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                id="password_input"
                type="password"
                name="password_no_autofill"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 transition-all focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Acessar Painel de Controle</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Security Seal */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Sessão protegida por criptografia e controle de acesso seguro.</span>
        </div>
      </div>
    </div>
  );
};
