'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Briefcase, User, Bell, IndianRupee, Award, FileText } from 'lucide-react';
import AddPaymentModal from './AddPaymentModal';

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const router = useRouter();
  const { isOwner } = useAuth();

  const actions = [
    { label: 'New Work', icon: Briefcase, href: '/works/new', color: 'text-blue-400' },
    { label: 'New Student', icon: User, href: '/students/new', color: 'text-green-400' },
    { label: 'New Alert', icon: Bell, href: '/alerts', color: 'text-amber-400' },
    ...(isOwner
      ? [{ label: 'Add Payment', icon: IndianRupee, action: () => setPaymentModalOpen(true), color: 'text-purple-400' }]
      : []),
    { label: 'Add Points', icon: Award, href: '/students', color: 'text-pink-400', note: 'Select a student first' },
    { label: 'Add Evidence', icon: FileText, href: '/students', color: 'text-cyan-400', note: 'Select a student first' },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs" onClick={() => setOpen(false)} />
      )}

      {/* Actions Menu */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6 animate-scale-in">
          <div className="bg-ix-surface border border-ix-border rounded-2xl p-2 shadow-2xl min-w-[220px]">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  setOpen(false);
                  if ('action' in action && action.action) {
                    action.action();
                  } else if ('href' in action && action.href) {
                    router.push(action.href);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ix-surface-hover transition-colors text-left"
              >
                <action.icon className={`w-4.5 h-4.5 ${action.color}`} />
                <div>
                  <span className="text-sm font-medium block">{action.label}</span>
                  {'note' in action && action.note && (
                    <span className="text-[10px] text-ix-text-muted">{action.note}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Quick Actions"
        className={`fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6 w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-ix-border rotate-45'
            : 'bg-ix-green hover:bg-ix-green-hover animate-pulse-green'
        }`}
      >
        {open ? (
          <X className="w-6 h-6 text-ix-text" />
        ) : (
          <Plus className="w-6 h-6 text-ix-bg" />
        )}
      </button>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </>
  );
}
