'use client';

import { demoStudents, demoPerformanceRecords } from '@/lib/demo-data';
import { getPointsColor, getInitials } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { BarChart3, ChevronRight } from 'lucide-react';

export default function PerformancePage() {
  const router = useRouter();

  const studentsWithPerf = demoStudents
    .filter(s => demoPerformanceRecords[s.id])
    .map(s => {
      const p = demoPerformanceRecords[s.id];
      const avg = Math.round(
        (p.technicalSkill + p.problemSolving + p.qualityOfWork + p.communication +
         p.clientInteraction + p.teamwork + p.responsibility + p.research +
         p.independence + p.deadlineDiscipline + p.requirementUnderstanding +
         p.issueSolving + p.workExplanation + p.responseBehaviour + p.professionalBehaviour) / 15 * 10
      ) / 10;
      return { ...s, avgPerformance: avg };
    })
    .sort((a, b) => b.avgPerformance - a.avgPerformance);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold">Performance</h1>
        <p className="text-sm text-ix-text-muted">Student performance overview</p>
      </div>

      <div className="space-y-2">
        {studentsWithPerf.map((student) => (
          <button
            key={student.id}
            onClick={() => router.push(`/students/${student.id}`)}
            className="w-full rounded-xl border border-ix-border bg-ix-surface p-4 text-left hover:bg-ix-surface-hover transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-ix-green-dim border border-ix-green/20 flex items-center justify-center text-ix-green text-xs font-bold flex-shrink-0">
                {getInitials(student.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{student.fullName}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-ix-text-muted">
                    Avg: {student.avgPerformance}/10
                  </span>
                  <span className={`text-xs font-bold ${getPointsColor(student.currentPoints)}`}>
                    {student.currentPoints >= 0 ? '+' : ''}{student.currentPoints} pts
                  </span>
                </div>
                {/* Mini bar */}
                <div className="mt-2 h-1.5 rounded-full bg-ix-bg overflow-hidden">
                  <div
                    className="h-full rounded-full bg-ix-green transition-all"
                    style={{ width: `${student.avgPerformance * 10}%` }}
                  />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100 flex-shrink-0" />
            </div>
          </button>
        ))}

        {studentsWithPerf.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-8 h-8 text-ix-text-muted mx-auto mb-2" />
            <p className="text-ix-text-muted text-sm">No performance records yet</p>
          </div>
        )}

        {/* Students without performance records */}
        {demoStudents.filter(s => !demoPerformanceRecords[s.id]).length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-ix-text-muted uppercase tracking-wide mb-2">Pending Review</h3>
            {demoStudents.filter(s => !demoPerformanceRecords[s.id] && ['Active', 'In Project'].includes(s.status)).map(s => (
              <button
                key={s.id}
                onClick={() => router.push(`/students/${s.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-ix-surface transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-ix-surface border border-ix-border flex items-center justify-center text-ix-text-muted text-xs font-bold">
                  {getInitials(s.fullName)}
                </div>
                <span className="text-sm text-ix-text-secondary">{s.fullName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
