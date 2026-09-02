'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Shield, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout, isOwner } = useAuth();

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="rounded-2xl border border-ix-border bg-ix-surface p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-ix-green-dim border border-ix-green/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-ix-green" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{user?.name}</h2>
            <p className="text-sm text-ix-text-muted">{user?.email}</p>
            <span className="text-xs text-ix-green mt-0.5 inline-block">
              {isOwner ? 'Owner' : 'Student Manager'}
            </span>
          </div>
        </div>

        <div className="space-y-3 border-t border-ix-border pt-4">
          <div className="flex justify-between text-sm py-1">
            <span className="text-ix-text-muted">Role</span>
            <span>{isOwner ? 'Owner (Full Access)' : 'Student Manager (Restricted)'}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-ix-text-muted">System</span>
            <span>Intellex Management System v1.0</span>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-ix-danger/30 text-ix-danger hover:bg-ix-danger-dim transition-colors font-medium text-sm"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}
