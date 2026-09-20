'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Eye, EyeOff, Loader2, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError('');
    const success = await login('owner', password);

    if (success) {
      router.push('/owner');
    } else {
      setError('Invalid admin password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-ix-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ix-green-dim border border-ix-green/20 mb-4 shadow-lg shadow-ix-green/10">
            <div className="w-8 h-8 rounded-lg bg-ix-green flex items-center justify-center font-bold text-ix-bg text-sm">
              IX
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">INTELLEX</h1>
          <p className="text-ix-text-secondary text-xs mt-1 tracking-widest uppercase font-semibold">
            AdminLink — Operations & Management
          </p>
        </div>

        {/* Portal Info Card */}
        <div className="mb-6 p-3.5 rounded-xl bg-ix-surface border border-ix-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ix-green-dim border border-ix-green/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-ix-green" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Admin Access Portal</h2>
            <p className="text-[11px] text-ix-text-muted">Company operations, works & finance</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password"
                autoFocus
                className="w-full h-12 px-4 pr-12 rounded-xl bg-ix-surface border border-ix-border text-ix-text placeholder:text-ix-text-muted focus:border-ix-green focus:ring-0 focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ix-text-muted hover:text-ix-text transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-ix-danger text-xs animate-fade-in px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-ix-danger flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-12 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-ix-green/10"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Enter AdminLink'
            )}
          </button>
        </form>

        <p className="text-center text-ix-text-muted text-[11px] mt-8">
          INTELLEX INTERNAL MANAGEMENT SYSTEM
        </p>
      </div>
    </div>
  );
}

