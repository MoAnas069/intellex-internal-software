'use client';

import { useState } from 'react';
import { Plus, X, Briefcase, Bell, IndianRupee } from 'lucide-react';
import AddPaymentModal from './AddPaymentModal';
import AddWorkModal from './AddWorkModal';
import AddAlertModal from './AddAlertModal';

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [workModalOpen, setWorkModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const actions = [
    {
      label: 'New Work',
      icon: Briefcase,
      action: () => setWorkModalOpen(true),
      color: 'text-blue-400',
      note: 'Create a new project',
    },
    {
      label: 'New Alert',
      icon: Bell,
      action: () => setAlertModalOpen(true),
      color: 'text-amber-400',
      note: 'Broadcast an alert',
    },
    {
      label: 'Add Payment',
      icon: IndianRupee,
      action: () => setPaymentModalOpen(true),
      color: 'text-purple-400',
      note: 'Record project payment',
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Actions Menu Popup */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 lg:bottom-22 lg:right-6 animate-scale-in">
          <div className="bg-ix-surface/95 backdrop-blur-md border border-ix-border rounded-2xl p-2 shadow-2xl min-w-[240px] divide-y divide-ix-border/40">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ix-text-muted">
              Quick Actions
            </div>
            <div className="space-y-1 pt-1">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setOpen(false);
                    action.action();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ix-surface-hover active:scale-[0.98] transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-ix-bg border border-ix-border flex items-center justify-center flex-shrink-0 group-hover:border-ix-border-light transition-colors">
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold block text-ix-text group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                    <span className="text-[10px] text-ix-text-muted block truncate">
                      {action.note}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAB Floating Plus Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Quick Actions"
        className={`fixed bottom-6 right-4 z-50 lg:bottom-6 lg:right-6 w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-ix-surface border border-ix-border rotate-45 scale-105'
            : 'bg-ix-green hover:bg-ix-green-hover text-ix-bg shadow-ix-green/25 hover:scale-105'
        }`}
      >
        {open ? (
          <X className="w-6 h-6 text-ix-text" />
        ) : (
          <Plus className="w-6 h-6 text-ix-bg" strokeWidth={2.5} />
        )}
      </button>

      {/* Modals */}
      <AddPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

      <AddWorkModal
        isOpen={workModalOpen}
        onClose={() => setWorkModalOpen(false)}
      />

      <AddAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
      />
    </>
  );
}
