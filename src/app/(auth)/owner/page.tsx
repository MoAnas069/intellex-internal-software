'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Briefcase, IndianRupee, AlertTriangle, TrendingUp,
  Clock, ChevronRight, AlertCircle, CheckCircle2, ShieldAlert
} from 'lucide-react';

export default function OwnerDashboard() {
  const { user, isOwner } = useAuth();
  const { works, payments, alerts, markAlertCompleted } = useData();
  const router = useRouter();

  // Current calendar month string (e.g., '2026-09')
  const currentMonthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }, []);

  // 1. Ongoing Works
  const ongoingWorksList = useMemo(() => {
    return works
      .filter((w) => w.currentStage !== 'COMPLETED')
      .sort((a, b) => new Date(b.updatedAt || b.startDate).getTime() - new Date(a.updatedAt || a.startDate).getTime());
  }, [works]);

  // 2. This Month Revenue (payments received in current month)
  const thisMonthRevenue = useMemo(() => {
    const monthPayments = payments.filter((p) => p.date?.startsWith(currentMonthKey));
    if (monthPayments.length > 0) {
      return monthPayments.reduce((sum, p) => sum + p.amount, 0);
    }
    // Fallback if payments not logged with current month: calculate from works active this month
    return works
      .filter((w) => (w.updatedAt || w.startDate)?.startsWith(currentMonthKey))
      .reduce((sum, w) => sum + (w.advanceReceived + w.secondPayment + w.finalPayment), 0);
  }, [payments, works, currentMonthKey]);

  // 3. This Month Spending (expenses on projects active this month)
  const thisMonthSpending = useMemo(() => {
    const monthWorks = works.filter((w) => (w.updatedAt || w.startDate)?.startsWith(currentMonthKey));
    return monthWorks.reduce(
      (sum, w) => sum + w.developerPayment + w.designerPayment + w.domainCost + w.hostingCost + w.otherExpenses,
      0
    );
  }, [works, currentMonthKey]);

  // 4. Need Attention items
  const now = new Date().getTime();
  const delayedWorks = useMemo(() => {
    return works.filter((w) => {
      if (w.currentStage === 'COMPLETED') return false;
      if (!w.expectedCompletionDate) return false;
      return new Date(w.expectedCompletionDate).getTime() < now;
    });
  }, [works, now]);

  const pendingPaymentsList = useMemo(() => {
    return works
      .filter((w) => w.remainingPayment > 0)
      .sort((a, b) => b.remainingPayment - a.remainingPayment);
  }, [works]);

  const activeAlertsList = useMemo(() => {
    return alerts.filter((a) => a.status === 'Active');
  }, [alerts]);

  const attentionTotal = delayedWorks.length + pendingPaymentsList.length + activeAlertsList.length;

  const stats = [
    {
      label: 'Ongoing Works',
      value: ongoingWorksList.length,
      sublabel: `${works.filter((w) => w.currentStage === 'COMPLETED').length} completed`,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
      href: '/works?filter=ongoing',
    },
    {
      label: 'This Month Revenue',
      value: formatCurrency(thisMonthRevenue),
      sublabel: currentMonthName,
      icon: TrendingUp,
      color: 'text-ix-green',
      bg: 'bg-ix-green-dim',
      border: 'border-ix-green/20',
      href: '/finance',
    },
    {
      label: 'This Month Spending',
      value: formatCurrency(thisMonthSpending),
      sublabel: 'Team & infrastructure',
      icon: IndianRupee,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/20',
      href: '/finance',
    },
    {
      label: 'Need Attention',
      value: attentionTotal,
      sublabel: `${delayedWorks.length} delayed • ${pendingPaymentsList.length} pending`,
      icon: AlertTriangle,
      color: attentionTotal > 0 ? 'text-amber-400' : 'text-ix-text-muted',
      bg: attentionTotal > 0 ? 'bg-amber-400/10' : 'bg-ix-surface',
      border: attentionTotal > 0 ? 'border-amber-400/20' : 'border-ix-border',
      href: '#need-attention',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header — Simplified without Add Payment button */}
      <div>
        <p className="text-ix-text-muted text-xs sm:text-sm">Intellex Operations & Management</p>
        <h1 className="text-xl sm:text-2xl font-bold mt-0.5">AdminLink Dashboard</h1>
        <p className="text-ix-text-secondary text-xs sm:text-sm mt-0.5">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* 4 Core Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => {
              if (stat.href.startsWith('#')) {
                document.getElementById('need-attention')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                router.push(stat.href);
              }
            }}
            className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group`}
          >
            <div className="flex items-start justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <ChevronRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs font-semibold text-ix-text mt-1 truncate">{stat.label}</p>
            <p className="text-[11px] text-ix-text-muted mt-0.5 truncate">{stat.sublabel}</p>
          </button>
        ))}
      </div>

      {/* Two Column Layout: Ongoing Works & Need Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Section 1: Ongoing Works */}
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-blue-400" />
                Ongoing Works
              </h2>
              <p className="text-xs text-ix-text-muted mt-0.5">
                {ongoingWorksList.length} active projects in progress
              </p>
            </div>
            <button
              onClick={() => router.push('/works?filter=ongoing')}
              className="text-xs text-ix-green hover:text-ix-green-hover transition-colors font-medium"
            >
              View All Works
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {ongoingWorksList.slice(0, 6).map((work) => (
              <div
                key={work.id}
                onClick={() => router.push(`/works/${work.id}`)}
                className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-ix-bg hover:bg-ix-surface-hover border border-ix-border/50 hover:border-ix-border transition-all cursor-pointer group"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20 font-medium">
                      {work.currentStage.replace(/_/g, ' ')}
                    </span>
                    {work.expectedCompletionDate && (
                      <span className="text-[10px] text-ix-text-muted">
                        Due: {formatDate(work.expectedCompletionDate)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold mt-1 truncate group-hover:text-ix-green transition-colors">
                    {work.companyName || work.clientName}
                  </p>
                  <p className="text-xs text-ix-text-muted mt-0.5 truncate">
                    {work.projectName} • Dev: {work.developerName}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Progress ring */}
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#262626" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="#00ff88"
                        strokeWidth="3"
                        strokeDasharray={`${work.progress * 0.88} 88`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {work.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {ongoingWorksList.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle2 className="w-8 h-8 text-ix-green mx-auto mb-2 opacity-80" />
                <p className="text-sm text-ix-text-muted">No ongoing works right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Need Attention */}
        <div id="need-attention" className="rounded-2xl border border-ix-border bg-ix-surface p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
                Need Attention
              </h2>
              <p className="text-xs text-ix-text-muted mt-0.5">
                Important actionable items requiring admin intervention
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
              {attentionTotal} items
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px]">
            {/* Overdue / Delayed Works */}
            {delayedWorks.map((work) => (
              <div
                key={`delay-${work.id}`}
                onClick={() => router.push(`/works/${work.id}`)}
                className="p-3.5 rounded-xl bg-ix-danger/5 border border-ix-danger/30 hover:bg-ix-danger/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-ix-danger text-white font-bold uppercase">
                      Delayed
                    </span>
                    <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
                  </div>
                  <span className="text-xs text-ix-danger font-semibold">
                    Past Deadline: {formatDate(work.expectedCompletionDate)}
                  </span>
                </div>
                <p className="text-sm font-semibold">{work.companyName}</p>
                <p className="text-xs text-ix-text-muted mt-0.5">
                  Stage: {work.currentStage.replace(/_/g, ' ')} • Lead: {work.developerName} • {work.progress}% done
                </p>
              </div>
            ))}

            {/* Pending Payments */}
            {pendingPaymentsList.slice(0, 4).map((work) => (
              <div
                key={`pay-${work.id}`}
                onClick={() => router.push(`/works/${work.id}`)}
                className="p-3.5 rounded-xl bg-amber-400/5 border border-amber-400/20 hover:bg-amber-400/10 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-400 font-bold">
                      Pending Payment
                    </span>
                    <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
                  </div>
                  <p className="text-sm font-semibold truncate">{work.companyName}</p>
                  <p className="text-xs text-ix-text-muted truncate">{work.clientName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(work.remainingPayment)}</p>
                  <p className="text-[10px] text-ix-text-muted">of {formatCurrency(work.totalBudget)}</p>
                </div>
              </div>
            ))}

            {/* Active Priority Alerts */}
            {activeAlertsList.map((alert) => (
              <div
                key={`alert-${alert.id}`}
                className="p-3.5 rounded-xl bg-ix-bg border border-ix-border hover:border-ix-border-light transition-colors flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div
                    className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      alert.priority === 'Critical'
                        ? 'bg-ix-danger'
                        : alert.priority === 'High'
                        ? 'bg-orange-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold truncate">{alert.title}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded border border-ix-border text-ix-text-muted">
                        {alert.priority}
                      </span>
                    </div>
                    {alert.description && (
                      <p className="text-xs text-ix-text-muted line-clamp-2">{alert.description}</p>
                    )}
                    <span className="text-[10px] text-ix-text-muted mt-1 block">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => markAlertCompleted(alert.id)}
                  className="p-1.5 rounded-lg hover:bg-ix-green-dim text-ix-text-muted hover:text-ix-green transition-colors flex-shrink-0"
                  title="Mark alert completed"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}

            {attentionTotal === 0 && (
              <div className="text-center py-10">
                <CheckCircle2 className="w-8 h-8 text-ix-green mx-auto mb-2 opacity-80" />
                <p className="text-sm text-ix-text-muted">All projects on schedule, no urgent alerts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
