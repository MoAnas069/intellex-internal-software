'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { demoStudents, demoWorks, demoAlerts, demoPointTransactions } from '@/lib/demo-data';
import { formatDate, getPointsColor } from '@/lib/utils';
import {
  Users, Briefcase, AlertTriangle, CheckCircle2, Clock,
  ChevronRight, Award, TrendingUp, GraduationCap
} from 'lucide-react';
import { useEffect } from 'react';

export default function ManagerDashboard() {
  const { user, isManager } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isManager) router.push('/owner');
  }, [user, isManager, router]);

  if (!isManager) return null;

  // Compute stats
  const activeStudents = demoStudents.filter((s) => ['Active', 'In Project', 'In Training'].includes(s.status)).length;
  const studentsWorking = demoStudents.filter((s) => s.ongoingWorksCount > 0).length;
  const studentsTraining = demoStudents.filter((s) => s.status === 'In Training').length;
  const studentsAttention = demoStudents.filter((s) => s.currentPoints <= -15).length;
  const ongoingProjects = demoWorks.filter((w) => w.currentStage !== 'COMPLETED').length;
  const recentlyCompleted = demoWorks.filter((w) => w.currentStage === 'COMPLETED').length;

  // Recent point changes (flatten all)
  const allPointChanges = Object.entries(demoPointTransactions)
    .flatMap(([studentId, transactions]) => {
      const student = demoStudents.find((s) => s.id === studentId);
      return transactions.map((t) => ({ ...t, studentName: student?.fullName || 'Unknown', studentId }));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Active Students',
      value: activeStudents,
      icon: Users,
      color: 'text-ix-green',
      bg: 'bg-ix-green-dim',
      border: 'border-ix-green/20',
      href: '/students',
    },
    {
      label: 'Currently Working',
      value: studentsWorking,
      icon: Briefcase,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/20',
      href: '/students?filter=working',
    },
    {
      label: 'In Training',
      value: studentsTraining,
      icon: GraduationCap,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/20',
      href: '/students?filter=training',
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
    {
      label: 'Ongoing Projects',
      value: ongoingProjects,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      href: '/works?filter=ongoing',
    },
    {
      label: 'Completed',
      value: recentlyCompleted,
      icon: CheckCircle2,
      color: 'text-ix-green',
      bg: 'bg-ix-green-dim',
      border: 'border-ix-green/20',
      href: '/works?filter=completed',
    },
  ];

  // Students needing attention
  const attentionStudents = demoStudents
    .filter((s) => s.currentPoints <= -10)
    .sort((a, b) => a.currentPoints - b.currentPoints);

  // Top students
  const topStudents = [...demoStudents]
    .sort((a, b) => b.currentPoints - a.currentPoints)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-ix-text-muted text-sm">Hi Amal,</p>
        <h1 className="text-2xl font-bold mt-1">Student Management</h1>
        <p className="text-ix-text-secondary text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => router.push(stat.href)}
            className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group`}
          >
            <div className="flex items-start justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <ChevronRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-ix-text-secondary mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Students Needing Attention */}
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-ix-danger" />
              Needs Attention
            </h2>
            <button
              onClick={() => router.push('/students?filter=attention')}
              className="text-xs text-ix-green hover:text-ix-green-hover transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {attentionStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => router.push(`/students/${student.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ix-surface-hover transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-ix-danger-dim border border-ix-danger/20 flex items-center justify-center text-ix-danger text-xs font-bold">
                    {student.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{student.fullName}</p>
                    <p className="text-xs text-ix-text-muted">{student.college}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${getPointsColor(student.currentPoints)}`}>
                  {student.currentPoints >= 0 ? '+' : ''}{student.currentPoints}
                </span>
              </button>
            ))}
            {attentionStudents.length === 0 && (
              <p className="text-sm text-ix-text-muted text-center py-6">No students need attention</p>
            )}
          </div>
        </div>

        {/* Top Students */}
        <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-ix-green" />
              Top Students
            </h2>
            <button
              onClick={() => router.push('/students?sort=points-desc')}
              className="text-xs text-ix-green hover:text-ix-green-hover transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {topStudents.map((student, i) => (
              <button
                key={student.id}
                onClick={() => router.push(`/students/${student.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ix-surface-hover transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-ix-bg flex items-center justify-center text-ix-text-muted text-[10px] font-bold">
                    {i + 1}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-ix-green-dim border border-ix-green/20 flex items-center justify-center text-ix-green text-xs font-bold">
                    {student.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{student.fullName}</p>
                    <p className="text-xs text-ix-text-muted">{student.completedWorksCount} completed</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${getPointsColor(student.currentPoints)}`}>
                  +{student.currentPoints}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Point Changes */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
        <h2 className="font-semibold mb-4">Recent Point Changes</h2>
        <div className="space-y-2">
          {allPointChanges.map((pt) => (
            <div
              key={pt.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-ix-surface-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  pt.type === 'positive'
                    ? 'bg-ix-green-dim text-ix-green'
                    : 'bg-ix-danger-dim text-ix-danger'
                }`}>
                  {pt.amount > 0 ? '+' : ''}{pt.amount}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{pt.studentName}</span>
                    <span className="text-ix-text-muted"> — {pt.reason}</span>
                  </p>
                  <p className="text-xs text-ix-text-muted mt-0.5">
                    {formatDate(pt.date)} • by {pt.addedBy}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
