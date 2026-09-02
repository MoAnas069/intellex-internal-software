'use client';

import { demoStudents, demoPointTransactions } from '@/lib/demo-data';
import { formatDate, getPointsColor, getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Award } from 'lucide-react';

export default function PointsPage() {
  const router = useRouter();

  // Flatten all point transactions
  const allTransactions = Object.entries(demoPointTransactions)
    .flatMap(([studentId, transactions]) => {
      const student = demoStudents.find(s => s.id === studentId);
      return transactions.map(t => ({ ...t, studentName: student?.fullName || 'Unknown', studentId }));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Point History</h1>
        <p className="text-sm text-ix-text-muted">All point transactions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-ix-border bg-ix-surface p-3 text-center">
          <p className="text-lg font-bold text-ix-green">
            {demoStudents.filter(s => s.currentPoints >= 30).length}
          </p>
          <p className="text-[10px] text-ix-text-muted">High Points</p>
        </div>
        <div className="rounded-xl border border-ix-border bg-ix-surface p-3 text-center">
          <p className="text-lg font-bold text-amber-400">
            {demoStudents.filter(s => s.currentPoints < 0 && s.currentPoints > -15).length}
          </p>
          <p className="text-[10px] text-ix-text-muted">Watch</p>
        </div>
        <div className="rounded-xl border border-ix-border bg-ix-surface p-3 text-center">
          <p className="text-lg font-bold text-ix-danger">
            {demoStudents.filter(s => s.currentPoints <= -15).length}
          </p>
          <p className="text-[10px] text-ix-text-muted">Correction</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="space-y-2">
        {allTransactions.map((pt) => (
          <button
            key={`${pt.studentId}-${pt.id}`}
            onClick={() => router.push(`/students/${pt.studentId}`)}
            className="w-full rounded-xl border border-ix-border bg-ix-surface p-3 text-left hover:bg-ix-surface-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                pt.type === 'positive' ? 'bg-ix-green-dim text-ix-green' : 'bg-ix-danger-dim text-ix-danger'
              }`}>
                {pt.amount > 0 ? '+' : ''}{pt.amount}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{pt.studentName}</span>
                </p>
                <p className="text-xs text-ix-text-muted truncate">{pt.reason}</p>
                <p className="text-[10px] text-ix-text-muted mt-0.5">{formatDate(pt.date)} • by {pt.addedBy}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
