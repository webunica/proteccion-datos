'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'password' | 'magic-link';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  const supabase = createClient();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos. Verifica tus datos.'
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMagicSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-900 to-brand-700 px-8 py-8 text-white text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white/10 rounded-xl p-3">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Sistema Ley 21.719</h1>
            <p className="text-brand-100 text-sm mt-1">Panel de Cumplimiento Protección de Datos</p>
          </div>

          <div className="px-8 py-8">
            {/* Mode tabs */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                onClick={() => { setMode('password'); setError(null); setMagicSent(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'password'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Contraseña
              </button>
              <button
                onClick={() => { setMode('magic-link'); setError(null); setMagicSent(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === 'magic-link'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Magic link sent state */}
            {magicSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">¡Enlace enviado!</h3>
                <p className="text-gray-500 text-sm">
                  Revisa tu correo <span className="font-medium text-gray-700">{email}</span> y haz clic en el enlace para acceder.
                </p>
                <button
                  onClick={() => setMagicSent(false)}
                  className="mt-4 text-brand-600 text-sm hover:underline"
                >
                  Enviar de nuevo
                </button>
              </div>
            ) : (
              <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@empresa.cl"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Password — only in password mode */}
                {mode === 'password' && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors mt-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {mode === 'password' ? 'Acceder' : 'Enviar Magic Link'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {mode === 'password' && (
                  <p className="text-center text-xs text-gray-400 mt-2">
                    ¿Olvidaste tu contraseña?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('magic-link')}
                      className="text-brand-600 hover:underline"
                    >
                      Usa Magic Link
                    </button>
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
            <p className="text-xs text-gray-400">
              Acceso restringido a administradores autorizados
            </p>
          </div>
        </div>

        {/* Legal note */}
        <p className="text-center text-white/60 text-xs mt-6">
          Conforme a Ley 21.719 sobre Protección de Datos Personales
        </p>
      </div>
    </div>
  );
}
