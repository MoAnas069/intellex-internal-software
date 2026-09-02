'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import { Shield, Users, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setError('');
    const success = await login(selectedRole, password);

    if (success) {
      router.push(selectedRole === 'owner' ? '/owner' : '/manager');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  // Role selection screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-ix-bg flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ix-green-dim border border-ix-green/20 mb-6">
              <div className="w-8 h-8 rounded-lg bg-ix-green" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">INTELLEX</h1>
            <p className="text-ix-text-secondary text-sm mt-1 tracking-widest uppercase">
              Management System
            </p>
          </div>

          {/* Role Cards */}
          <div className="space-y-4">
            <button
              onClick={() => setSelectedRole('owner')}
              className="w-full group relative overflow-hidden rounded-2xl border border-ix-border bg-ix-surface p-6 text-left transition-all duration-300 hover:border-ix-green/40 hover:bg-ix-surface-hover active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-ix-green-dim to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-ix-green-dim border border-ix-green/20">
                  <Shield className="w-6 h-6 text-ix-green" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Owner</h2>
                  <p className="text-ix-text-muted text-sm">Full system access</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('student_manager')}
              className="w-full group relative overflow-hidden rounded-2xl border border-ix-border bg-ix-surface p-6 text-left transition-all duration-300 hover:border-ix-green/40 hover:bg-ix-surface-hover active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-ix-green-dim to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-ix-green-dim border border-ix-green/20">
                  <Users className="w-6 h-6 text-ix-green" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Student Manager</h2>
                  <p className="text-ix-text-muted text-sm">Student & work management</p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-ix-text-muted text-xs mt-8">
            Internal use only
          </p>
        </div>
      </div>
    );
  }

  // Password screen
  return (
    <div className="min-h-screen bg-ix-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => {
            setSelectedRole(null);
            setPassword('');
            setError('');
          }}
          className="flex items-center gap-2 text-ix-text-secondary hover:text-ix-text transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ix-green-dim border border-ix-green/20 mb-4">
            {selectedRole === 'owner' ? (
              <Shield className="w-7 h-7 text-ix-green" />
            ) : (
              <Users className="w-7 h-7 text-ix-green" />
            )}
          </div>
          <h2 className="text-xl font-semibold">
            {selectedRole === 'owner' ? 'Owner Login' : 'Student Manager Login'}
          </h2>
          <p className="text-ix-text-muted text-sm mt-1">
            Enter your password to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full h-14 px-4 pr-12 rounded-xl bg-ix-surface border border-ix-border text-ix-text placeholder:text-ix-text-muted focus:border-ix-green focus:ring-0 focus:outline-none transition-colors text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ix-text-muted hover:text-ix-text transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-ix-danger text-sm animate-fade-in px-1">
              <div className="w-1 h-1 rounded-full bg-ix-danger" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full h-14 rounded-xl bg-ix-green text-ix-bg font-semibold text-base hover:bg-ix-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center text-ix-text-muted text-xs mt-8">
          INTELLEX MANAGEMENT SYSTEM
        </p>
      </div>
    </div>
  );
}
