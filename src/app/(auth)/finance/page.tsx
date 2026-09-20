'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingUp, ArrowUpRight, Clock, CheckCircle2, IndianRupee,
  Briefcase, Plus, CreditCard, Receipt, Calendar, ArrowDownRight,
  PieChart, Tag, Building2, User
} from 'lucide-react';
import AddPaymentModal from '@/components/AddPaymentModal';

export default function FinancePage() {
  const { isOwner } = useAuth();
  const { works, payments } = useData();
  const router = useRouter();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedWorkId, setSelectedWorkId] = useState<string | undefined>(undefined);

  // Available month options derived from payments & works
  const monthOptions = useMemo(() => {
    const monthMap = new Map<string, string>();

    // Add standard 2026 months
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    monthNames.forEach((name, index) => {
      const key = `2026-${String(index + 1).padStart(2, '0')}`;
      monthMap.set(key, `${name} 2026`);
    });

    // Add any dates from existing payments
    payments.forEach((p) => {
      if (p.date && p.date.length >= 7) {
        const key = p.date.slice(0, 7);
        if (!monthMap.has(key)) {
          const [year, month] = key.split('-');
          const d = new Date(parseInt(year), parseInt(month) - 1, 1);
          monthMap.set(key, d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
        }
      }
    });

    // Add any dates from works
    works.forEach((w) => {
      const date = w.startDate || w.updatedAt;
      if (date && date.length >= 7) {
        const key = date.slice(0, 7);
        if (!monthMap.has(key)) {
          const [year, month] = key.split('-');
          const d = new Date(parseInt(year), parseInt(month) - 1, 1);
          monthMap.set(key, d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
        }
      }
    });

    // Sort descending (latest months first)
    return Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [payments, works]);

  // Default to September 2026 (or current month)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');

  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth === 'all') return 'All Time (Full Overview)';
    const found = monthOptions.find((m) => m[0] === selectedMonth);
    if (found) return found[1];
    const [year, month] = selectedMonth.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }, [selectedMonth, monthOptions]);

  // Filtered Payments for Selected Month
  const monthPayments = useMemo(() => {
    if (selectedMonth === 'all') return [...payments];
    return payments.filter((p) => p.date?.startsWith(selectedMonth));
  }, [payments, selectedMonth]);

  // Filtered Works for Selected Month (active, started, or with payments in this month)
  const monthWorks = useMemo(() => {
    if (selectedMonth === 'all') return [...works];
    return works.filter((w) => {
      const startedInMonth = w.startDate?.startsWith(selectedMonth);
      const updatedInMonth = w.updatedAt?.startsWith(selectedMonth);
      const completedInMonth = w.actualCompletionDate?.startsWith(selectedMonth);
      const hasPaymentInMonth = payments.some(
        (p) => p.workId === w.id && p.date?.startsWith(selectedMonth)
      );
      return startedInMonth || updatedInMonth || completedInMonth || hasPaymentInMonth;
    });
  }, [works, payments, selectedMonth]);

  // Financial Metrics for the Selected Period
  const periodRevenue = useMemo(() => {
    if (monthPayments.length > 0) {
      return monthPayments.reduce((sum, p) => sum + p.amount, 0);
    }
    // Fallback: sum collected payments on works for that period
    return monthWorks.reduce(
      (sum, w) => sum + (w.advanceReceived + w.secondPayment + w.finalPayment),
      0
    );
  }, [monthPayments, monthWorks]);

  // Detailed Itemized Spending Entries for Selected Period
  const spendingEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      workId: string;
      projectName: string;
      companyName: string;
      category: 'Developer Payment' | 'Designer Payment' | 'Domain & Hosting' | 'Other Expenses';
      recipientOrItem: string;
      amount: number;
      date: string;
    }> = [];

    monthWorks.forEach((w) => {
      const date = w.startDate || w.updatedAt || `${selectedMonth}-01`;

      if (w.developerPayment > 0) {
        entries.push({
          id: `spend-dev-${w.id}`,
          workId: w.workId,
          projectName: w.projectName,
          companyName: w.companyName || w.clientName,
          category: 'Developer Payment',
          recipientOrItem: `Lead Developer (${w.developerName})`,
          amount: w.developerPayment,
          date,
        });
      }

      if (w.designerPayment > 0) {
        entries.push({
          id: `spend-des-${w.id}`,
          workId: w.workId,
          projectName: w.projectName,
          companyName: w.companyName || w.clientName,
          category: 'Designer Payment',
          recipientOrItem: `UI/UX Designer (${w.designerName})`,
          amount: w.designerPayment,
          date,
        });
      }

      const domainHosting = (w.domainCost || 0) + (w.hostingCost || 0);
      if (domainHosting > 0) {
        entries.push({
          id: `spend-dom-${w.id}`,
          workId: w.workId,
          projectName: w.projectName,
          companyName: w.companyName || w.clientName,
          category: 'Domain & Hosting',
          recipientOrItem: `Server & Domain Infrastructure (${formatCurrency(w.domainCost)} domain + ${formatCurrency(w.hostingCost)} hosting)`,
          amount: domainHosting,
          date,
        });
      }

      if (w.otherExpenses > 0) {
        entries.push({
          id: `spend-oth-${w.id}`,
          workId: w.workId,
          projectName: w.projectName,
          companyName: w.companyName || w.clientName,
          category: 'Other Expenses',
          recipientOrItem: 'Miscellaneous Project Expenses / APIs',
          amount: w.otherExpenses,
          date,
        });
      }
    });

    return entries;
  }, [monthWorks, selectedMonth]);

  const periodSpending = useMemo(() => {
    return spendingEntries.reduce((sum, e) => sum + e.amount, 0);
  }, [spendingEntries]);

  const periodNetProfit = periodRevenue - periodSpending;

  // Spending category totals
  const spendingCategoryTotals = useMemo(() => {
    const totals = {
      developer: 0,
      designer: 0,
      infra: 0,
      other: 0,
    };
    spendingEntries.forEach((e) => {
      if (e.category === 'Developer Payment') totals.developer += e.amount;
      else if (e.category === 'Designer Payment') totals.designer += e.amount;
      else if (e.category === 'Domain & Hosting') totals.infra += e.amount;
      else totals.other += e.amount;
    });
    return totals;
  }, [spendingEntries]);

  // Works with pending payment in this month / system
  const pendingPaymentWorks = useMemo(() => {
    return monthWorks
      .filter((w) => w.remainingPayment > 0)
      .sort((a, b) => b.remainingPayment - a.remainingPayment);
  }, [monthWorks]);

  const totalPeriodPending = pendingPaymentWorks.reduce((sum, w) => sum + w.remainingPayment, 0);

  const handleOpenPayment = (workId?: string) => {
    setSelectedWorkId(workId);
    setPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Top Header & Month Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Finance & Business Accounting</h1>
          <p className="text-sm text-ix-text-muted">
            Track monthly revenue, project expenses, and net profit
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Month Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 pl-9 pr-9 rounded-xl bg-ix-surface border border-ix-border text-sm font-semibold text-ix-text focus:border-ix-green focus:outline-none transition-colors appearance-none shadow-sm cursor-pointer"
            >
              <option value="all">All Time (Full Overview)</option>
              {monthOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-ix-green absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => handleOpenPayment()}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-colors active:scale-[0.98] shadow-lg shadow-ix-green/10"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Selected Month Banner / Summary */}
      <div className="p-4 sm:p-5 rounded-2xl border border-ix-border bg-gradient-to-r from-ix-surface to-ix-surface-hover flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ix-green">
            Financial Statement Period
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-ix-text mt-0.5">
            {selectedMonthLabel}
          </h2>
          <p className="text-xs text-ix-text-muted mt-0.5">
            {monthPayments.length} revenue entries • {spendingEntries.length} expense items • {monthWorks.length} active projects
          </p>
        </div>

        {/* Quick Month Switcher Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['2026-09', '2026-08', '2026-07', '2026-06'].map((mKey) => {
            const label = monthOptions.find((m) => m[0] === mKey)?.[1] || mKey;
            const shortName = label.split(' ')[0];
            return (
              <button
                key={mKey}
                onClick={() => setSelectedMonth(mKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedMonth === mKey
                    ? 'bg-ix-green text-ix-bg shadow-sm'
                    : 'bg-ix-bg border border-ix-border text-ix-text-secondary hover:text-ix-text'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Financial Overview Cards for Selected Month */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-ix-green/20 bg-ix-green-dim p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-ix-green" />
            <span className="text-[10px] font-bold uppercase text-ix-green bg-ix-green/10 px-2 py-0.5 rounded-full">
              Inflow
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-ix-green">
            {formatCurrency(periodRevenue)}
          </p>
          <p className="text-xs font-semibold text-ix-text mt-1">Total Revenue</p>
          <p className="text-[11px] text-ix-text-muted mt-0.5">{monthPayments.length} payments received</p>
        </div>

        {/* Total Spending */}
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <ArrowDownRight className="w-5 h-5 text-rose-400" />
            <span className="text-[10px] font-bold uppercase text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full">
              Outflow
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-rose-400">
            {formatCurrency(periodSpending)}
          </p>
          <p className="text-xs font-semibold text-ix-text mt-1">Total Spending</p>
          <p className="text-[11px] text-ix-text-muted mt-0.5">{spendingEntries.length} expense entries</p>
        </div>

        {/* Net Profit / Margin */}
        <div
          className={`rounded-2xl border p-4 ${
            periodNetProfit >= 0
              ? 'border-emerald-400/20 bg-emerald-400/10'
              : 'border-ix-danger/20 bg-ix-danger/10'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <ArrowUpRight
              className={`w-5 h-5 ${periodNetProfit >= 0 ? 'text-emerald-400' : 'text-ix-danger'}`}
            />
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                periodNetProfit >= 0
                  ? 'text-emerald-400 bg-emerald-400/10'
                  : 'text-ix-danger bg-ix-danger/10'
              }`}
            >
              Net
            </span>
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              periodNetProfit >= 0 ? 'text-emerald-400' : 'text-ix-danger'
            }`}
          >
            {formatCurrency(periodNetProfit)}
          </p>
          <p className="text-xs font-semibold text-ix-text mt-1">Net Operating Profit</p>
          <p className="text-[11px] text-ix-text-muted mt-0.5">
            {periodRevenue > 0
              ? `${Math.round((periodNetProfit / periodRevenue) * 100)}% margin`
              : 'Revenue - Expenses'}
          </p>
        </div>

        {/* Pending Client Collections */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-bold uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-amber-400">
            {formatCurrency(totalPeriodPending)}
          </p>
          <p className="text-xs font-semibold text-ix-text mt-1">Pending Collections</p>
          <p className="text-[11px] text-ix-text-muted mt-0.5">
            {pendingPaymentWorks.length} works with balance
          </p>
        </div>
      </div>

      {/* Two Column: Monthly Revenue Entries & Itemized Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Column 1: Monthly Revenue Entries */}
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-ix-green" />
                Revenue Entries ({selectedMonthLabel})
              </h3>
              <p className="text-xs text-ix-text-muted mt-0.5">
                Total Received: <span className="text-ix-green font-bold">{formatCurrency(periodRevenue)}</span>
              </p>
            </div>
            <span className="text-xs font-bold text-ix-text-muted bg-ix-bg px-2.5 py-1 rounded-xl border border-ix-border">
              {monthPayments.length} entries
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px]">
            {monthPayments.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-ix-bg border border-ix-border/60 hover:border-ix-border transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-ix-green-dim border border-ix-green/20 flex items-center justify-center text-ix-green flex-shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate text-ix-text">{p.clientName}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-ix-surface text-ix-text-secondary border border-ix-border font-medium">
                        {p.type}
                      </span>
                    </div>
                    <p className="text-xs text-ix-text-muted mt-0.5 truncate">
                      {formatDate(p.date)} • {p.paymentMethod} {p.note ? `• ${p.note}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-ix-green">+{formatCurrency(p.amount)}</p>
                  <span className="text-[10px] text-ix-green font-medium">Received</span>
                </div>
              </div>
            ))}

            {monthPayments.length === 0 && (
              <div className="text-center py-12 rounded-xl bg-ix-bg/50 border border-ix-border/30">
                <Receipt className="w-8 h-8 text-ix-text-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm text-ix-text-muted">No payment transactions recorded for {selectedMonthLabel}</p>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Itemized Monthly Spending Entries */}
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4 sm:p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <IndianRupee className="w-4.5 h-4.5 text-rose-400" />
                Itemized Spending ({selectedMonthLabel})
              </h3>
              <p className="text-xs text-ix-text-muted mt-0.5">
                Total Expenses: <span className="text-rose-400 font-bold">{formatCurrency(periodSpending)}</span>
              </p>
            </div>
            <span className="text-xs font-bold text-ix-text-muted bg-ix-bg px-2.5 py-1 rounded-xl border border-ix-border">
              {spendingEntries.length} items
            </span>
          </div>

          {/* Spending Category Breakdown Bar */}
          {periodSpending > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5">
              <div className="p-2 rounded-lg bg-ix-bg border border-ix-border/40 text-center">
                <span className="text-[10px] text-ix-text-muted block">Developers</span>
                <span className="text-xs font-bold text-ix-text">{formatCurrency(spendingCategoryTotals.developer)}</span>
              </div>
              <div className="p-2 rounded-lg bg-ix-bg border border-ix-border/40 text-center">
                <span className="text-[10px] text-ix-text-muted block">Designers</span>
                <span className="text-xs font-bold text-ix-text">{formatCurrency(spendingCategoryTotals.designer)}</span>
              </div>
              <div className="p-2 rounded-lg bg-ix-bg border border-ix-border/40 text-center">
                <span className="text-[10px] text-ix-text-muted block">Domain / Hosting</span>
                <span className="text-xs font-bold text-ix-text">{formatCurrency(spendingCategoryTotals.infra)}</span>
              </div>
              <div className="p-2 rounded-lg bg-ix-bg border border-ix-border/40 text-center">
                <span className="text-[10px] text-ix-text-muted block">Other Misc</span>
                <span className="text-xs font-bold text-ix-text">{formatCurrency(spendingCategoryTotals.other)}</span>
              </div>
            </div>
          )}

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px]">
            {spendingEntries.map((e) => (
              <div
                key={e.id}
                className="p-3.5 rounded-xl bg-ix-bg border border-ix-border/60 hover:border-ix-border transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs font-bold text-ix-text truncate">{e.companyName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-400/10 text-rose-400 border border-rose-400/20 font-medium">
                      {e.category}
                    </span>
                  </div>
                  <p className="text-xs text-ix-text-muted truncate">{e.recipientOrItem}</p>
                  <p className="text-[11px] text-ix-text-secondary mt-0.5">Project: {e.projectName}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-rose-400">-{formatCurrency(e.amount)}</p>
                  <span className="text-[10px] text-ix-text-muted font-mono">{e.workId}</span>
                </div>
              </div>
            ))}

            {spendingEntries.length === 0 && (
              <div className="text-center py-12 rounded-xl bg-ix-bg/50 border border-ix-border/30">
                <IndianRupee className="w-8 h-8 text-ix-text-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm text-ix-text-muted">No expense entries for {selectedMonthLabel}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Client Payments for this period / overview */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-amber-400" />
              Pending Client Payments
            </h3>
            <p className="text-xs text-ix-text-muted mt-0.5">
              {pendingPaymentWorks.length} projects with outstanding receivables
            </p>
          </div>
          <button
            onClick={() => handleOpenPayment()}
            className="text-xs text-ix-green hover:text-ix-green-hover transition-colors font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Payment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingPaymentWorks.map((work) => (
            <div
              key={work.id}
              className="p-3.5 rounded-xl bg-ix-bg border border-ix-border/50 hover:border-ix-border transition-colors flex items-center justify-between gap-3"
            >
              <div
                onClick={() => router.push(`/works/${work.id}`)}
                className="min-w-0 flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-bold">
                    Pending
                  </span>
                </div>
                <p className="text-sm font-bold truncate text-ix-text">{work.companyName || work.clientName}</p>
                <p className="text-xs text-ix-text-muted truncate">{work.projectName}</p>
              </div>

              <div className="text-right flex items-center gap-3 flex-shrink-0">
                <div>
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(work.remainingPayment)}</p>
                  <p className="text-[10px] text-ix-text-muted">of {formatCurrency(work.totalBudget)}</p>
                </div>
                <button
                  onClick={() => handleOpenPayment(work.id)}
                  className="px-3 py-1.5 rounded-xl bg-ix-green text-ix-bg text-xs font-bold hover:bg-ix-green-hover transition-colors shadow-sm"
                >
                  Record
                </button>
              </div>
            </div>
          ))}

          {pendingPaymentWorks.length === 0 && (
            <div className="col-span-2 text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-ix-green mx-auto mb-2 opacity-80" />
              <p className="text-sm text-ix-text-muted">All client payments for this period are fully collected!</p>
            </div>
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
