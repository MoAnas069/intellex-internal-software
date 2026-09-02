'use client';

import { demoStudents, demoWorks } from '@/lib/demo-data';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, getPointsColor } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Briefcase, TrendingUp, Award } from 'lucide-react';

export default function ReportsPage() {
  const { isOwner } = useAuth();
  const router = useRouter();

  const activeStudents = demoStudents.filter(s => ['Active', 'In Project', 'In Training'].includes(s.status));
  const completedWorks = demoWorks.filter(w => w.currentStage === 'COMPLETED');
  const ongoingWorks = demoWorks.filter(w => w.currentStage !== 'COMPLETED');

  // Skill distribution
  const skillCounts: Record<string, number> = {};
  demoStudents.forEach(s => {
    if (s.primaryInterest) {
      skillCounts[s.primaryInterest] = (skillCounts[s.primaryInterest] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Reports</h1>
        <p className="text-sm text-ix-text-muted">Overview & analytics</p>
      </div>

      {/* Student Stats */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-ix-text-muted" />
          Student Report
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-ix-bg">
            <p className="text-2xl font-bold">{activeStudents.length}</p>
            <p className="text-xs text-ix-text-muted">Active Students</p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg">
            <p className="text-2xl font-bold">{demoStudents.filter(s => s.ongoingWorksCount > 0).length}</p>
            <p className="text-xs text-ix-text-muted">Currently Working</p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg">
            <p className="text-2xl font-bold text-ix-green">
              +{Math.round(activeStudents.reduce((s, st) => s + st.currentPoints, 0) / activeStudents.length)}
            </p>
            <p className="text-xs text-ix-text-muted">Avg Points</p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg">
            <p className="text-2xl font-bold text-ix-danger">
              {demoStudents.filter(s => s.currentPoints <= -15).length}
            </p>
            <p className="text-xs text-ix-text-muted">Need Attention</p>
          </div>
        </div>
      </div>

      {/* Top 5 Students */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-ix-green" />
          Top 5 Students by Points
        </h2>
        <div className="space-y-2">
          {[...demoStudents].sort((a, b) => b.currentPoints - a.currentPoints).slice(0, 5).map((s, i) => (
            <button
              key={s.id}
              onClick={() => router.push(`/students/${s.id}`)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ix-surface-hover transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-xs font-bold text-ix-text-muted">{i + 1}</span>
                <span className="text-sm font-medium">{s.fullName}</span>
              </div>
              <span className={`text-sm font-bold ${getPointsColor(s.currentPoints)}`}>
                +{s.currentPoints}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Work Stats */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-ix-text-muted" />
          Work Report
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-ix-bg">
            <p className="text-2xl font-bold">{demoWorks.length}</p>
            <p className="text-xs text-ix-text-muted">Total Works</p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg">
            <p className="text-2xl font-bold text-ix-green">{completedWorks.length}</p>
            <p className="text-xs text-ix-text-muted">Completed</p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg">
            <p className="text-2xl font-bold text-blue-400">{ongoingWorks.length}</p>
            <p className="text-xs text-ix-text-muted">Ongoing</p>
          </div>
          {isOwner && (
            <div className="p-3 rounded-xl bg-ix-bg">
              <p className="text-2xl font-bold text-emerald-400">
                {formatCurrency(Math.round(demoWorks.reduce((s, w) => s + w.totalBudget, 0) / demoWorks.length))}
              </p>
              <p className="text-xs text-ix-text-muted">Avg Value</p>
            </div>
          )}
        </div>
      </div>

      {/* Skill Distribution */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-4">Skill Distribution</h2>
        <div className="space-y-2">
          {Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).map(([skill, count]) => (
            <div key={skill} className="flex items-center gap-3">
              <span className="text-sm text-ix-text-secondary w-36 truncate">{skill}</span>
              <div className="flex-1 h-2 rounded-full bg-ix-bg overflow-hidden">
                <div
                  className="h-full rounded-full bg-ix-green"
                  style={{ width: `${(count / demoStudents.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
