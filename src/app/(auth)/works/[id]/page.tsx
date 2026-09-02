'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { demoWorks, demoAlerts } from '@/lib/demo-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { WORK_STAGES, getStageIndex, getStageLabel } from '@/constants/stages';
import {
  ArrowLeft, Phone, Mail, User, Briefcase, IndianRupee,
  Calendar, Clock, CheckCircle2, AlertTriangle, ChevronRight,
  FileText, MessageSquare
} from 'lucide-react';

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isOwner } = useAuth();
  const router = useRouter();

  const work = demoWorks.find((w) => w.id === id);
  if (!work) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ix-text-muted">Work not found</p>
      </div>
    );
  }

  const workAlerts = demoAlerts.filter((a) => a.workId === id && a.status === 'Active');
  const stageIdx = getStageIndex(work.currentStage);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => router.push('/works')}
        className="flex items-center gap-2 text-ix-text-secondary hover:text-ix-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Works</span>
      </button>

      {/* Header Card */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
            <h1 className="text-xl font-bold mt-1">{work.companyName}</h1>
            <p className="text-sm text-ix-text-muted">{work.projectName}</p>
          </div>
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#262626" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={work.currentStage === 'COMPLETED' ? '#00ff88' : '#4488ff'}
                strokeWidth="3"
                strokeDasharray={`${work.progress * 0.88} 88`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
              {work.progress}%
            </span>
          </div>
        </div>

        {/* Stage Pipeline */}
        <div className="mt-5 overflow-x-auto no-scrollbar">
          <div className="flex gap-1 min-w-max">
            {WORK_STAGES.map((stage, i) => {
              const isCompleted = i < stageIdx;
              const isCurrent = i === stageIdx;
              return (
                <div
                  key={stage.key}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-all ${
                    isCompleted
                      ? 'bg-ix-green/20 text-ix-green'
                      : isCurrent
                      ? 'bg-ix-green text-ix-bg'
                      : 'bg-ix-bg text-ix-text-muted'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                  {isCurrent && <Clock className="w-3 h-3" />}
                  <span className="whitespace-nowrap">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-ix-text-secondary">
            <Calendar className="w-4 h-4 text-ix-text-muted" />
            Started: {formatDate(work.startDate)}
          </div>
          <div className="flex items-center gap-2 text-sm text-ix-text-secondary">
            <Clock className="w-4 h-4 text-ix-text-muted" />
            Deadline: {formatDate(work.expectedCompletionDate)}
          </div>
        </div>
      </div>

      {/* Client */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-ix-text-muted" />
          Client
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ix-text-muted">Name</span>
            <span>{work.clientName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ix-text-muted">Company</span>
            <span>{work.companyName}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-ix-text-muted">Phone</span>
            <a href={`tel:${work.clientPhone}`} className="text-ix-green flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {work.clientPhone}
            </a>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-ix-text-muted">Email</span>
            <a href={`mailto:${work.clientEmail}`} className="text-ix-green flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="truncate max-w-[180px]">{work.clientEmail}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-ix-text-muted" />
          Team
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ix-text-muted">Salesperson</span>
            <span>{work.salespersonName}</span>
          </div>
          <button
            onClick={() => {
              const dev = work.developerId;
              if (dev) router.push(`/students/${dev}`);
            }}
            className="w-full flex justify-between items-center text-sm hover:bg-ix-surface-hover p-1 -mx-1 rounded transition-colors"
          >
            <span className="text-ix-text-muted">Developer</span>
            <span className="text-ix-green flex items-center gap-1">
              {work.developerName}
              <ChevronRight className="w-3 h-3" />
            </span>
          </button>
          <button
            onClick={() => {
              if (!work.sameAsDeveloper && work.designerId) router.push(`/students/${work.designerId}`);
            }}
            className="w-full flex justify-between items-center text-sm hover:bg-ix-surface-hover p-1 -mx-1 rounded transition-colors"
          >
            <span className="text-ix-text-muted">Designer</span>
            <span className={`flex items-center gap-1 ${work.sameAsDeveloper ? 'text-ix-text-secondary' : 'text-ix-green'}`}>
              {work.sameAsDeveloper ? 'Same as Developer' : work.designerName}
              {!work.sameAsDeveloper && <ChevronRight className="w-3 h-3" />}
            </span>
          </button>
        </div>
      </div>

      {/* Finance — OWNER ONLY */}
      {isOwner && (
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-ix-text-muted" />
            Finance
          </h2>

          {/* Client Side */}
          <div className="p-3 rounded-xl bg-ix-bg mb-3">
            <p className="text-[10px] text-ix-text-muted uppercase tracking-wider mb-2">Client Payments</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Total Budget</span>
                <span className="font-semibold">{formatCurrency(work.totalBudget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Advance</span>
                <span className="text-ix-green">{formatCurrency(work.advanceReceived)}</span>
              </div>
              {work.secondPayment > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ix-text-muted">Second Payment</span>
                  <span className="text-ix-green">{formatCurrency(work.secondPayment)}</span>
                </div>
              )}
              {work.finalPayment > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ix-text-muted">Final Payment</span>
                  <span className="text-ix-green">{formatCurrency(work.finalPayment)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-1 border-t border-ix-border">
                <span className="text-ix-text-muted">Pending</span>
                <span className={`font-semibold ${work.remainingPayment > 0 ? 'text-amber-400' : 'text-ix-green'}`}>
                  {formatCurrency(work.remainingPayment)}
                </span>
              </div>
            </div>
          </div>

          {/* Expense Side */}
          <div className="p-3 rounded-xl bg-ix-bg mb-3">
            <p className="text-[10px] text-ix-text-muted uppercase tracking-wider mb-2">Expenses</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Developer Payment</span>
                <span>{formatCurrency(work.developerPayment)}</span>
              </div>
              {work.designerPayment > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ix-text-muted">Designer Payment</span>
                  <span>{formatCurrency(work.designerPayment)}</span>
                </div>
              )}
              {work.domainCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ix-text-muted">Domain</span>
                  <span>{formatCurrency(work.domainCost)}</span>
                </div>
              )}
              {work.hostingCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ix-text-muted">Hosting</span>
                  <span>{formatCurrency(work.hostingCost)}</span>
                </div>
              )}
              {work.otherExpenses > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ix-text-muted">Other</span>
                  <span>{formatCurrency(work.otherExpenses)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profit */}
          <div className="p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10">
            <div className="flex justify-between text-sm">
              <span className="text-ix-text-muted">Estimated Profit</span>
              <span className="text-lg font-bold text-emerald-400">
                {formatCurrency(work.estimatedProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {workAlerts.length > 0 && (
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Alerts
          </h2>
          <div className="space-y-2">
            {workAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.priority === 'Critical' ? 'bg-ix-danger' :
                  alert.priority === 'High' ? 'bg-orange-400' :
                  'bg-amber-400'
                }`} />
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-ix-text-muted">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Info */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-3">Project Info</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ix-text-muted">Package</span>
            <span>{work.projectPackage}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ix-text-muted">Current Stage</span>
            <span>{getStageLabel(work.currentStage)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ix-text-muted">Progress</span>
            <span>{work.progress}%</span>
          </div>
          {work.notes && (
            <div className="pt-2 border-t border-ix-border">
              <p className="text-xs text-ix-text-muted mb-1">Notes</p>
              <p className="text-sm text-ix-text-secondary">{work.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
