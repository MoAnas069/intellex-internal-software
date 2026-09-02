'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Briefcase, Users, IndianRupee, AlertTriangle, TrendingUp,
  CheckCircle2, Clock, ChevronRight, ArrowUpRight, Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AddPaymentModal from '@/components/AddPaymentModal';

export default function OwnerDashboard() {
  const { user, isOwner } = useAuth();
  const { works, students, alerts } = useData();
  const router = useRouter();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [targetWorkId, setTargetWorkId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user && !isOwner) router.push('/manager');
  }, [user, isOwner, router]);

  if (!isOwner) return null;

  // Compute live stats from DataContext
  const ongoingWorks = works.filter((w) => w.currentStage !== 'COMPLETED').length;
  const completedWorks = works.filter((w) => w.currentStage === 'COMPLETED').length;
  const pendingPayments = works.reduce((sum, w) => sum + w.remainingPayment, 0);
  const thisMonthRevenue = works
    .filter((w) => w.currentStage === 'COMPLETED')
    .reduce((sum, w) => sum + w.totalBudget, 0);
  const estimatedProfit = works.reduce((sum, w) => sum + w.estimatedProfit, 0);
  const activeStudents = students.filter((s) => ['Active', 'In Project', 'In Training'].includes(s.status)).length;
  const studentsAttention = students.filter((s) => s.currentPoints <= -15).length;
  const activeAlerts = alerts.filter((a) => a.status === 'Active');

  const handleOpenPayment = (workId?: string) => {
    setTargetWorkId(workId);
    setPaymentModalOpen(true);
  };

  const stats = [
    {
      label: 'Ongoing Works',
      value: ongoingWorks,
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
      href: '/works?filter=ongoing',
    },
    {
      label: 'Completed Works',
      value: completedWorks,
      icon: CheckCircle2,
      color: 'text-ix-green',
      bg: 'bg-ix-green-dim',
      border: 'border-ix-green/20',
      href: '/works?filter=completed',
    },
    {
      label: 'Pending Payments',
      value: formatCurrency(pendingPayments),
      icon: IndianRupee,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      href: '/works?filter=pending-payment',
    },
    {
      label: 'This Month Revenue',
      value: formatCurrency(thisMonthRevenue),
      icon: TrendingUp,
      color: 'text-ix-green',
      bg: 'bg-ix-green-dim',
      border: 'border-ix-green/20',
      href: '/finance',
    },
    {
      label: 'Estimated Profit',
      value: formatCurrency(estimatedProfit),
      icon: ArrowUpRight,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/20',
      href: '/finance',
    },
    {
      label: 'Active Students',
      value: activeStudents,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
      href: '/students',
    },
    {
      label: 'Need Attention',
      value: studentsAttention,
      icon: AlertTriangle,
      color: studentsAttention > 0 ? 'text-ix-danger' : 'text-ix-text-muted',
      bg: studentsAttention > 0 ? 'bg-ix-danger-dim' : 'bg-ix-surface',
      border: studentsAttention > 0 ? 'border-ix-danger/20' : 'border-ix-border',
      href: '/students?filter=attention',
    },
  ];

  // Recent ongoing works
  const recentOngoing = works
    .filter((w) => w.currentStage !== 'COMPLETED')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5 animate-fade-in pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-ix-text-muted text-xs sm:text-sm">Welcome back,</p>
          <h1 className="text-xl sm:text-2xl font-bold mt-0.5">Owner Dashboard</h1>
          <p className="text-ix-text-secondary text-xs sm:text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleOpenPayment()}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-colors active:scale-[0.98] shadow-lg shadow-ix-green/10"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 stagger-children">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => router.push(stat.href)}
            className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-3.5 sm:p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group`}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <stat.icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${stat.color}`} />
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-ix-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-lg sm:text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-[11px] sm:text-xs text-ix-text-secondary mt-0.5 truncate">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Works */}
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm sm:text-base">Recent Ongoing Works</h2>
            <button
              onClick={() => router.push('/works?filter=ongoing')}
              className="text-xs text-ix-green hover:text-ix-green-hover transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {recentOngoing.map((work) => (
              <div
                key={work.id}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ix-surface-hover transition-colors text-left group border border-transparent hover:border-ix-border"
              >
                <button
                  onClick={() => router.push(`/works/${work.id}`)}
                  className="flex-1 min-w-0 pr-2 text-left"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-ix-text-muted font-mono">{work.workId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20">
                      {work.currentStage.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{work.companyName}</p>
                  <p className="text-xs text-ix-text-muted mt-0.5 truncate">
                    {work.developerName} • {work.progress}%
                  </p>
                </button>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {work.remainingPayment > 0 && (
                    <button
                      onClick={() => handleOpenPayment(work.id)}
                      className="px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-semibold hover:bg-amber-400/20 transition-colors"
                      title="Add payment for this work"
                    >
                      + Pay
                    </button>
                  )}
                  {/* Progress ring */}
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10">
                    <svg className="w-9 h-9 sm:w-10 sm:h-10 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#262626" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="14" fill="none"
                        stroke="#00ff88"
                        strokeWidth="3"
                        strokeDasharray={`${work.progress * 0.88} 88`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {work.progress}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm sm:text-base">Active Alerts</h2>
            <button
              onClick={() => router.push('/alerts')}
              className="text-xs text-ix-green hover:text-ix-green-hover transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((alert) => {
              const priorityColors: Record<string, string> = {
                Low: 'text-ix-text-muted border-ix-border',
                Medium: 'text-amber-400 border-amber-400/20',
                High: 'text-orange-400 border-orange-400/20',
                Critical: 'text-ix-danger border-ix-danger/20',
              };
              const color = priorityColors[alert.priority] || priorityColors.Low;
              return (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-ix-surface-hover transition-colors"
                >
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    alert.priority === 'Critical' ? 'bg-ix-danger' :
                    alert.priority === 'High' ? 'bg-orange-400' :
                    alert.priority === 'Medium' ? 'bg-amber-400' : 'bg-ix-text-muted'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-ix-text-muted mt-0.5 truncate">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${color}`}>
                        {alert.priority}
                      </span>
                      <span className="text-[10px] text-ix-text-muted">{formatDate(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {activeAlerts.length === 0 && (
              <p className="text-sm text-ix-text-muted text-center py-6">No active alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm sm:text-base">Financial Summary</h2>
          <button
            onClick={() => handleOpenPayment()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ix-green-dim border border-ix-green/20 text-ix-green text-xs font-semibold hover:bg-ix-green/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Payment
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3 rounded-xl bg-ix-bg border border-ix-border/50">
            <p className="text-xs text-ix-text-muted">Total Revenue</p>
            <p className="text-base sm:text-lg font-bold mt-1">
              {formatCurrency(works.reduce((s, w) => s + w.totalBudget, 0))}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg border border-ix-border/50">
            <p className="text-xs text-ix-text-muted">Collected</p>
            <p className="text-base sm:text-lg font-bold mt-1 text-ix-green">
              {formatCurrency(works.reduce((s, w) => s + w.advanceReceived + w.secondPayment + w.finalPayment, 0))}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg border border-ix-border/50">
            <p className="text-xs text-ix-text-muted">Pending</p>
            <p className="text-base sm:text-lg font-bold mt-1 text-amber-400">
              {formatCurrency(pendingPayments)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg border border-ix-border/50">
            <p className="text-xs text-ix-text-muted">Est. Profit</p>
            <p className="text-base sm:text-lg font-bold mt-1 text-emerald-400">
              {formatCurrency(estimatedProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        defaultWorkId={targetWorkId}
      />
    </div>
  );
}
