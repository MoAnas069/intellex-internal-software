'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingUp, ArrowUpRight, Clock, CheckCircle2, IndianRupee,
  Briefcase, Plus, CreditCard, Receipt
} from 'lucide-react';
import AddPaymentModal from '@/components/AddPaymentModal';

export default function FinancePage() {
  const { isOwner } = useAuth();
  const { works, payments } = useData();
  const router = useRouter();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedWorkId, setSelectedWorkId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isOwner) router.push('/manager');
  }, [isOwner, router]);

  if (!isOwner) return null;

  const totalRevenue = works.reduce((s, w) => s + w.totalBudget, 0);
  const collected = works.reduce((s, w) => s + w.advanceReceived + w.secondPayment + w.finalPayment, 0);
  const pending = works.reduce((s, w) => s + w.remainingPayment, 0);
  const totalExpenses = works.reduce((s, w) => s + w.developerPayment + w.designerPayment + w.domainCost + w.hostingCost + w.otherExpenses, 0);
  const estimatedProfit = works.reduce((s, w) => s + w.estimatedProfit, 0);
  const actualProfit = works.filter(w => w.currentStage === 'COMPLETED').reduce((s, w) => s + w.actualProfit, 0);
  const avgProjectValue = Math.round(totalRevenue / (works.length || 1));
  const completedProjects = works.filter(w => w.currentStage === 'COMPLETED').length;
  const ongoingProjects = works.filter(w => w.currentStage !== 'COMPLETED').length;

  // Works with pending payments
  const pendingPaymentWorks = works.filter(w => w.remainingPayment > 0)
    .sort((a, b) => b.remainingPayment - a.remainingPayment);

  const handleOpenPayment = (workId?: string) => {
    setSelectedWorkId(workId);
    setPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Finance & Revenue</h1>
          <p className="text-sm text-ix-text-muted">Track revenue, pending client payments & expenses</p>
        </div>
        <button
          onClick={() => handleOpenPayment()}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-colors active:scale-[0.98] shadow-lg shadow-ix-green/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment</span>
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-ix-green', bg: 'bg-ix-green-dim', border: 'border-ix-green/20' },
          { label: 'Collected', value: formatCurrency(collected), icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
          { label: 'Pending', value: formatCurrency(pending), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
          { label: 'Est. Profit', value: formatCurrency(estimatedProfit), icon: ArrowUpRight, color: 'text-ix-green', bg: 'bg-ix-green-dim', border: 'border-ix-green/20' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border ${stat.border} ${stat.bg} p-4`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-ix-text-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
          <h2 className="font-semibold mb-4">Revenue Breakdown</h2>
          <div className="space-y-3">
            {[
              ['Total Revenue', totalRevenue, 'text-ix-text'],
              ['Total Expenses', totalExpenses, 'text-ix-danger'],
              ['Estimated Profit', estimatedProfit, 'text-ix-green'],
              ['Actual Profit (completed)', actualProfit, 'text-emerald-400'],
            ].map(([label, value, color]) => (
              <div key={label as string} className="flex justify-between items-center p-3 rounded-xl bg-ix-bg">
                <span className="text-sm text-ix-text-muted">{label as string}</span>
                <span className={`text-sm font-bold ${color}`}>{formatCurrency(value as number)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
          <h2 className="font-semibold mb-4">Project Stats</h2>
          <div className="space-y-3">
            {[
              ['Total Projects', works.length, Briefcase],
              ['Completed', completedProjects, CheckCircle2],
              ['Ongoing', ongoingProjects, Clock],
              ['Avg. Project Value', formatCurrency(avgProjectValue), IndianRupee],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="flex justify-between items-center p-3 rounded-xl bg-ix-bg">
                <div className="flex items-center gap-2">
                  {React.createElement(Icon as React.ElementType, { className: 'w-4 h-4 text-ix-text-muted' })}
                  <span className="text-sm text-ix-text-muted">{label as string}</span>
                </div>
                <span className="text-sm font-bold">{value as string | number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Payments Section */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Pending Client Payments</h2>
            <p className="text-xs text-ix-text-muted">{pendingPaymentWorks.length} works with remaining balance</p>
          </div>
          <button
            onClick={() => handleOpenPayment()}
            className="text-xs text-ix-green hover:text-ix-green-hover transition-colors font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Payment
          </button>
        </div>

        <div className="space-y-2">
          {pendingPaymentWorks.map((work) => (
            <div
              key={work.id}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-ix-bg hover:bg-ix-surface-hover transition-colors border border-ix-border/40"
            >
              <button
                onClick={() => router.push(`/works/${work.id}`)}
                className="flex-1 min-w-0 pr-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
                </div>
                <p className="text-sm font-medium mt-0.5 truncate">{work.companyName}</p>
                <p className="text-xs text-ix-text-muted truncate">{work.clientName}</p>
              </button>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(work.remainingPayment)}</p>
                  <p className="text-[10px] text-ix-text-muted">Total: {formatCurrency(work.totalBudget)}</p>
                </div>
                <button
                  onClick={() => handleOpenPayment(work.id)}
                  className="px-3 py-1.5 rounded-xl bg-ix-green text-ix-bg text-xs font-bold hover:bg-ix-green-hover transition-colors shadow-sm"
                >
                  Record Payment
                </button>
              </div>
            </div>
          ))}

          {pendingPaymentWorks.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-ix-green mx-auto mb-2 opacity-80" />
              <p className="text-sm text-ix-text-muted">All client payments have been collected!</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History Log */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Receipt className="w-4.5 h-4.5 text-ix-green" />
            Payment Log & History
          </h2>
          <span className="text-xs text-ix-text-muted">{payments.length} transactions</span>
        </div>

        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-xl bg-ix-bg border border-ix-border/40 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-ix-green-dim border border-ix-green/20 flex items-center justify-center text-ix-green">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ix-text">{p.clientName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-ix-surface text-ix-text-secondary border border-ix-border">
                      {p.type}
                    </span>
                  </div>
                  <p className="text-xs text-ix-text-muted mt-0.5">
                    {formatDate(p.date)} • {p.paymentMethod} {p.note ? `• ${p.note}` : ''}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-ix-green">+{formatCurrency(p.amount)}</p>
                <span className="text-[10px] text-ix-green font-medium">Received</span>
              </div>
            </div>
          ))}

          {payments.length === 0 && (
            <p className="text-sm text-ix-text-muted text-center py-6">No payments recorded yet</p>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        defaultWorkId={selectedWorkId}
      />
    </div>
  );
}
