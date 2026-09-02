'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { demoWorks } from '@/lib/demo-data';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp, ArrowUpRight, ArrowDownRight, IndianRupee,
  Briefcase, Clock, CheckCircle2
} from 'lucide-react';
import { useEffect } from 'react';

export default function FinancePage() {
  const { isOwner } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isOwner) router.push('/manager');
  }, [isOwner, router]);

  if (!isOwner) return null;

  const totalRevenue = demoWorks.reduce((s, w) => s + w.totalBudget, 0);
  const collected = demoWorks.reduce((s, w) => s + w.advanceReceived + w.secondPayment + w.finalPayment, 0);
  const pending = demoWorks.reduce((s, w) => s + w.remainingPayment, 0);
  const totalExpenses = demoWorks.reduce((s, w) => s + w.developerPayment + w.designerPayment + w.domainCost + w.hostingCost + w.otherExpenses, 0);
  const estimatedProfit = demoWorks.reduce((s, w) => s + w.estimatedProfit, 0);
  const actualProfit = demoWorks.filter(w => w.currentStage === 'COMPLETED').reduce((s, w) => s + w.actualProfit, 0);
  const avgProjectValue = Math.round(totalRevenue / demoWorks.length);
  const completedProjects = demoWorks.filter(w => w.currentStage === 'COMPLETED').length;
  const ongoingProjects = demoWorks.filter(w => w.currentStage !== 'COMPLETED').length;

  // Works with pending payments
  const pendingPaymentWorks = demoWorks.filter(w => w.remainingPayment > 0)
    .sort((a, b) => b.remainingPayment - a.remainingPayment);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Finance</h1>
        <p className="text-sm text-ix-text-muted">Revenue, payments & profit overview</p>
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
              ['Total Projects', demoWorks.length, Briefcase],
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

      {/* Pending Payments */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-4">Pending Payments</h2>
        <div className="space-y-2">
          {pendingPaymentWorks.map((work) => (
            <button
              key={work.id}
              onClick={() => router.push(`/works/${work.id}`)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ix-surface-hover transition-colors text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
                </div>
                <p className="text-sm font-medium mt-0.5">{work.companyName}</p>
              </div>
              <span className="text-sm font-bold text-amber-400">
                {formatCurrency(work.remainingPayment)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
