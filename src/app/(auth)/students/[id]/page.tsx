'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { demoStudentSkills, demoPerformanceRecords } from '@/lib/demo-data';
import { formatDate, getPointsColor, getInitials, getAttentionLevel } from '@/lib/utils';
import type { PointTransaction, EvidenceRecord, EvidenceType } from '@/types';
import {
  ArrowLeft, Mail, Phone, GraduationCap, Calendar,
  Briefcase, Award, FileText, Shield, ChevronRight, Clock,
  CheckCircle2, AlertTriangle, ExternalLink, Plus, X
} from 'lucide-react';

const TABS = ['Overview', 'Works', 'Skills', 'Performance', 'Points', 'Evidence', 'Certificate'];

const POSITIVE_REASONS = [
  'On-time delivery',
  'Excellent client communication',
  'High-quality work',
  'Helpful to teammate',
  'Independent problem solving',
  'Useful research',
  'Taking ownership',
  'Good QC result',
];

const NEGATIVE_REASONS = [
  'Missed update',
  'Poor communication',
  'Avoidable mistake',
  'Missed deadline',
  'Ignoring instructions',
  'Repeated quality issue',
  'Unprofessional behaviour',
];

const EVIDENCE_TYPES: EvidenceType[] = [
  'GitHub Contribution', 'PR Review', 'Code Review', 'Client Call',
  'Client Demo', 'Requirement Clarification', 'Bug Fixing',
  'Performance Optimization', 'PageSpeed Result', 'Team Contribution',
  'Peer Mentoring', 'Research Contribution', 'Independent Problem Solving',
  'Project Ownership', 'Client Feedback',
];

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isOwner, user } = useAuth();
  const { students, works, pointTransactions, evidenceRecords, addPointTransaction, addEvidence } = useData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');

  // Stateful data from DataContext
  const student = students.find((s) => s.id === id);
  const pointsList = pointTransactions[id] || [];
  const evidenceList = evidenceRecords[id] || [];
  const localPoints = student?.currentPoints || 0;

  // Modal states
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showAddEvidence, setShowAddEvidence] = useState(false);

  // Add Points form
  const [pointType, setPointType] = useState<'positive' | 'negative'>('positive');
  const [pointAmount, setPointAmount] = useState(5);
  const [pointReason, setPointReason] = useState('');
  const [pointCustomReason, setPointCustomReason] = useState('');
  const [pointNote, setPointNote] = useState('');
  const [pointWorkId, setPointWorkId] = useState('');

  // Add Evidence form
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('GitHub Contribution');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [evidenceProjectId, setEvidenceProjectId] = useState('');

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-ix-text-muted">Student not found</p>
      </div>
    );
  }

  const studentWorks = works.filter((w) => w.developerId === id || w.designerId === id);
  const ongoingWorks = studentWorks.filter((w) => w.currentStage !== 'COMPLETED');
  const completedWorks = studentWorks.filter((w) => w.currentStage === 'COMPLETED');
  const skills = demoStudentSkills[id] || [];
  const performance = demoPerformanceRecords[id];
  const attention = getAttentionLevel(localPoints);

  const skillLevelColor = (level: string) => {
    switch (level) {
      case 'Verified': return 'text-ix-green bg-ix-green-dim border-ix-green/20';
      case 'Advanced': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Intermediate': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Developing': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-ix-text-muted bg-ix-surface border-ix-border';
    }
  };

  // Submit new point transaction
  const handleAddPoints = () => {
    const reason = pointReason === '__custom__' ? pointCustomReason : pointReason;
    if (!reason.trim()) return;

    addPointTransaction(id, {
      amount: pointAmount,
      type: pointType,
      reason: reason.trim(),
      relatedWorkId: pointWorkId || undefined,
      note: pointNote.trim() || undefined,
    });

    // Reset form
    setPointType('positive');
    setPointAmount(5);
    setPointReason('');
    setPointCustomReason('');
    setPointNote('');
    setPointWorkId('');
    setShowAddPoints(false);
  };

  // Submit new evidence record
  const handleAddEvidence = () => {
    if (!evidenceDescription.trim()) return;

    addEvidence(id, {
      type: evidenceType,
      description: evidenceDescription.trim(),
      evidenceLink: evidenceLink.trim() || undefined,
      projectId: evidenceProjectId || undefined,
    });

    // Reset form
    setEvidenceType('GitHub Contribution');
    setEvidenceDescription('');
    setEvidenceLink('');
    setEvidenceProjectId('');
    setShowAddEvidence(false);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => router.push('/students')}
        className="flex items-center gap-2 text-ix-text-secondary hover:text-ix-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Students</span>
      </button>

      {/* Profile Card */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-5">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${
            attention === 'normal'
              ? 'bg-ix-green-dim text-ix-green border border-ix-green/20'
              : attention === 'watch'
              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
              : 'bg-ix-danger-dim text-ix-danger border border-ix-danger/20'
          }`}>
            {getInitials(student.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{student.fullName}</h1>
            <p className="text-sm text-ix-text-muted">{student.studentId}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                student.status === 'Active'
                  ? 'text-ix-green bg-ix-green-dim border-ix-green/20'
                  : student.status === 'In Project'
                  ? 'text-blue-400 bg-blue-400/10 border-blue-400/20'
                  : student.status === 'In Training'
                  ? 'text-purple-400 bg-purple-400/10 border-purple-400/20'
                  : 'text-ix-text-muted bg-ix-surface border-ix-border'
              }`}>
                {student.status}
              </span>
              <span className={`text-sm font-bold ${getPointsColor(localPoints)}`}>
                {localPoints >= 0 ? '+' : ''}{localPoints} pts
              </span>
              {attention === 'correction' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-ix-danger-dim text-ix-danger border border-ix-danger/20">
                  Correction Stage
                </span>
              )}
              {attention === 'removal' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-ix-danger-dim text-ix-danger border border-ix-danger/20">
                  Removal Risk
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-ix-text-secondary">
            <GraduationCap className="w-4 h-4 text-ix-text-muted" />
            {student.college}
          </div>
          <div className="flex items-center gap-2 text-sm text-ix-text-secondary">
            <Calendar className="w-4 h-4 text-ix-text-muted" />
            Joined {formatDate(student.joiningDate)}
          </div>
          <div className="flex items-center gap-2 text-sm text-ix-text-secondary">
            <Phone className="w-4 h-4 text-ix-text-muted" />
            {student.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-ix-text-secondary">
            <Mail className="w-4 h-4 text-ix-text-muted" />
            <span className="truncate">{student.email}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-ix-bg text-center">
            <p className="text-lg font-bold">{student.ongoingWorksCount}</p>
            <p className="text-[10px] text-ix-text-muted">Ongoing</p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg text-center">
            <p className="text-lg font-bold">{student.completedWorksCount}</p>
            <p className="text-[10px] text-ix-text-muted">Completed</p>
          </div>
          <div className="p-3 rounded-xl bg-ix-bg text-center">
            <p className="text-lg font-bold">{skills.length}</p>
            <p className="text-[10px] text-ix-text-muted">Skills</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-ix-green text-ix-bg'
                : 'text-ix-text-secondary hover:text-ix-text hover:bg-ix-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
              <h3 className="font-semibold mb-3">Details</h3>
              <div className="space-y-3">
                {[
                  ['Course', student.course],
                  ['Year/Semester', student.yearSemester],
                  ['Primary Interest', student.primaryInterest],
                  ['Status', student.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-1">
                    <span className="text-sm text-ix-text-muted">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            {student.notes && (
              <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-ix-text-secondary">{student.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* WORKS */}
        {activeTab === 'Works' && (
          <div className="space-y-4">
            {ongoingWorks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ix-text-muted uppercase tracking-wide mb-2">Ongoing</h3>
                <div className="space-y-2">
                  {ongoingWorks.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => router.push(`/works/${w.id}`)}
                      className="w-full rounded-xl border border-ix-border bg-ix-surface p-4 text-left hover:bg-ix-surface-hover transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-ix-text-muted">{w.workId}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/10 text-blue-400 border border-blue-400/20">
                              {w.currentStage.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-sm font-medium mt-1">{w.companyName}</p>
                          <p className="text-xs text-ix-text-muted mt-0.5">
                            Role: {w.developerId === id ? 'Developer' : 'Designer'} • Started: {formatDate(w.startDate)} • Progress: {w.progress}%
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {completedWorks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ix-text-muted uppercase tracking-wide mb-2">Completed</h3>
                <div className="space-y-2">
                  {completedWorks.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => router.push(`/works/${w.id}`)}
                      className="w-full rounded-xl border border-ix-border bg-ix-surface p-4 text-left hover:bg-ix-surface-hover transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-ix-text-muted">{w.workId}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-ix-green" />
                          </div>
                          <p className="text-sm font-medium mt-1">{w.companyName}</p>
                          <p className="text-xs text-ix-text-muted mt-0.5">
                            Role: {w.developerId === id ? 'Developer' : 'Designer'} • Completed: {formatDate(w.actualCompletionDate)}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {studentWorks.length === 0 && (
              <p className="text-ix-text-muted text-sm text-center py-8">No works assigned yet</p>
            )}
          </div>
        )}

        {/* SKILLS */}
        {activeTab === 'Skills' && (
          <div className="space-y-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-ix-border bg-ix-surface"
                >
                  <span className="text-sm font-medium">{skill.skillName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${skillLevelColor(skill.level)}`}>
                    {skill.level}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-ix-text-muted text-sm text-center py-8">No skills recorded yet</p>
            )}
          </div>
        )}

        {/* PERFORMANCE */}
        {activeTab === 'Performance' && (
          <div className="space-y-4">
            {performance ? (
              <>
                <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
                  <h3 className="font-semibold mb-4">Performance Ratings</h3>
                  <div className="space-y-3">
                    {[
                      ['Technical Skill', performance.technicalSkill],
                      ['Problem Solving', performance.problemSolving],
                      ['Quality of Work', performance.qualityOfWork],
                      ['Communication', performance.communication],
                      ['Client Interaction', performance.clientInteraction],
                      ['Teamwork', performance.teamwork],
                      ['Responsibility', performance.responsibility],
                      ['Research', performance.research],
                      ['Independence', performance.independence],
                      ['Deadline Discipline', performance.deadlineDiscipline],
                      ['Requirement Understanding', performance.requirementUnderstanding],
                      ['Issue Solving', performance.issueSolving],
                      ['Work Explanation', performance.workExplanation],
                      ['Response Behaviour', performance.responseBehaviour],
                      ['Professional Behaviour', performance.professionalBehaviour],
                    ].map(([label, value]) => (
                      <div key={label as string} className="flex items-center gap-3">
                        <span className="text-sm text-ix-text-secondary w-44 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-2 rounded-full bg-ix-bg overflow-hidden">
                          <div
                            className="h-full rounded-full bg-ix-green transition-all"
                            style={{ width: `${(value as number) * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold w-10 text-right">{value}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
                {performance.notes && (
                  <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-ix-text-secondary">{performance.notes}</p>
                    <p className="text-xs text-ix-text-muted mt-2">
                      Recorded by {performance.recordedBy} on {formatDate(performance.recordedAt)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-ix-text-muted text-sm text-center py-8">No performance record yet</p>
            )}
          </div>
        )}

        {/* POINTS */}
        {activeTab === 'Points' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-2xl border border-ix-border bg-ix-surface p-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className={`text-2xl font-bold ${getPointsColor(localPoints)}`}>
                    {localPoints >= 0 ? '+' : ''}{localPoints}
                  </p>
                  <p className="text-[10px] text-ix-text-muted mt-1">Current</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ix-green">
                    +{pointsList.filter(p => p.type === 'positive').reduce((s, p) => s + p.amount, 0)}
                  </p>
                  <p className="text-[10px] text-ix-text-muted mt-1">Positive</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-ix-danger">
                    {pointsList.filter(p => p.type === 'negative').reduce((s, p) => s + p.amount, 0)}
                  </p>
                  <p className="text-[10px] text-ix-text-muted mt-1">Negative</p>
                </div>
              </div>
              {attention !== 'normal' && (
                <div className={`mt-3 p-2 rounded-lg text-xs text-center ${
                  attention === 'watch'
                    ? 'bg-amber-400/10 text-amber-400'
                    : attention === 'correction'
                    ? 'bg-orange-400/10 text-orange-400'
                    : 'bg-ix-danger-dim text-ix-danger'
                }`}>
                  {attention === 'watch'
                    ? 'Watch: Student has negative points'
                    : attention === 'correction'
                    ? 'At -15: Student enters correction/relegation stage'
                    : 'At -25: Student can be removed according to management decision'}
                </div>
              )}
            </div>

            {/* Add Points Button */}
            <button
              onClick={() => setShowAddPoints(true)}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-ix-green/40 text-ix-green hover:bg-ix-green-dim transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Points
            </button>

            {/* History */}
            <div className="space-y-2">
              {pointsList.map((pt) => (
                <div
                  key={pt.id}
                  className="rounded-xl border border-ix-border bg-ix-surface p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        pt.type === 'positive'
                          ? 'bg-ix-green-dim text-ix-green'
                          : 'bg-ix-danger-dim text-ix-danger'
                      }`}>
                        {pt.amount > 0 ? '+' : ''}{pt.amount}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{pt.reason}</p>
                        <p className="text-xs text-ix-text-muted mt-0.5">
                          by {pt.addedBy} • {formatDate(pt.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {pt.note && (
                    <p className="text-xs text-ix-text-secondary mt-2 ml-13">{pt.note}</p>
                  )}
                </div>
              ))}
              {pointsList.length === 0 && (
                <p className="text-ix-text-muted text-sm text-center py-8">No point transactions yet</p>
              )}
            </div>
          </div>
        )}

        {/* EVIDENCE */}
        {activeTab === 'Evidence' && (
          <div className="space-y-4">
            {/* Add Evidence Button */}
            <button
              onClick={() => setShowAddEvidence(true)}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-ix-green/40 text-ix-green hover:bg-ix-green-dim transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Evidence
            </button>

            <div className="space-y-2">
              {evidenceList.length > 0 ? (
                evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-ix-border bg-ix-surface p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-ix-surface-hover border border-ix-border text-ix-text-secondary">
                            {ev.type}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                            ev.verificationStatus === 'Verified'
                              ? 'text-ix-green bg-ix-green-dim border-ix-green/20'
                              : ev.verificationStatus === 'Rejected'
                              ? 'text-ix-danger bg-ix-danger-dim border-ix-danger/20'
                              : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                          }`}>
                            {ev.verificationStatus}
                          </span>
                        </div>
                        <p className="text-sm mt-2">{ev.description}</p>
                        <p className="text-xs text-ix-text-muted mt-1">{formatDate(ev.date)}</p>
                      </div>
                      {ev.evidenceLink && (
                        <a
                          href={ev.evidenceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ix-green hover:text-ix-green-hover flex-shrink-0 ml-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-ix-text-muted text-sm text-center py-8">No evidence records yet</p>
              )}
            </div>
          </div>
        )}

        {/* CERTIFICATE */}
        {activeTab === 'Certificate' && (
          <div className="rounded-2xl border border-ix-border bg-ix-surface p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-ix-green-dim border border-ix-green/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-ix-green" />
            </div>
            <h3 className="text-lg font-bold">Certificate Profile</h3>
            <p className="text-sm text-ix-text-muted mt-1">
              intellex.in/verify/{student.studentId}
            </p>
            <div className="mt-4 p-4 rounded-xl bg-ix-bg text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Name</span>
                <span>{student.fullName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Verification ID</span>
                <span>{student.studentId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Verified Skills</span>
                <span>{skills.filter(s => s.level === 'Verified').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Completed Projects</span>
                <span>{completedWorks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Verified Evidence</span>
                <span>{evidenceList.filter(e => e.verificationStatus === 'Verified').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ix-text-muted">Points</span>
                <span className={getPointsColor(localPoints)}>
                  {localPoints >= 0 ? '+' : ''}{localPoints}
                </span>
              </div>
            </div>
            <p className="text-xs text-ix-text-muted mt-4">
              QR verification page will be available when the certificate is generated.
            </p>
          </div>
        )}
      </div>

      {/* ==================== ADD POINTS MODAL ==================== */}
      {showAddPoints && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddPoints(false)} />
          <div className="absolute bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full animate-slide-up">
            <div className="bg-ix-surface border-t sm:border border-ix-border sm:rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ix-border">
                <h2 className="font-semibold text-lg">Add Points</h2>
                <button onClick={() => setShowAddPoints(false)} className="p-1 text-ix-text-muted hover:text-ix-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Point Type Toggle */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-2">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPointType('positive')}
                      className={`flex-1 h-11 rounded-xl text-sm font-medium transition-all ${
                        pointType === 'positive'
                          ? 'bg-ix-green text-ix-bg'
                          : 'bg-ix-bg border border-ix-border text-ix-text-secondary hover:text-ix-text'
                      }`}
                    >
                      + Positive
                    </button>
                    <button
                      onClick={() => setPointType('negative')}
                      className={`flex-1 h-11 rounded-xl text-sm font-medium transition-all ${
                        pointType === 'negative'
                          ? 'bg-ix-danger text-white'
                          : 'bg-ix-bg border border-ix-border text-ix-text-secondary hover:text-ix-text'
                      }`}
                    >
                      - Negative
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-2">Points</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setPointAmount(amt)}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium transition-all ${
                          pointAmount === amt
                            ? pointType === 'positive' ? 'bg-ix-green text-ix-bg' : 'bg-ix-danger text-white'
                            : 'bg-ix-bg border border-ix-border text-ix-text-secondary'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason (quick select) */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-2">Reason</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(pointType === 'positive' ? POSITIVE_REASONS : NEGATIVE_REASONS).map((reason) => (
                      <button
                        key={reason}
                        onClick={() => { setPointReason(reason); setPointCustomReason(''); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          pointReason === reason
                            ? 'bg-ix-green text-ix-bg'
                            : 'bg-ix-bg border border-ix-border text-ix-text-secondary hover:text-ix-text'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                    <button
                      onClick={() => setPointReason('__custom__')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        pointReason === '__custom__'
                          ? 'bg-ix-green text-ix-bg'
                          : 'bg-ix-bg border border-ix-border text-ix-text-secondary hover:text-ix-text'
                      }`}
                    >
                      Custom...
                    </button>
                  </div>
                  {pointReason === '__custom__' && (
                    <input
                      type="text"
                      value={pointCustomReason}
                      onChange={(e) => setPointCustomReason(e.target.value)}
                      placeholder="Enter custom reason"
                      autoFocus
                      className="w-full h-10 px-3 mt-2 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none"
                    />
                  )}
                </div>

                {/* Related Work (optional) */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Related Work (optional)</label>
                  <select
                    value={pointWorkId}
                    onChange={(e) => setPointWorkId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none appearance-none"
                  >
                    <option value="">None</option>
                    {studentWorks.map((w) => (
                      <option key={w.id} value={w.workId}>{w.workId} — {w.companyName}</option>
                    ))}
                  </select>
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Note (optional)</label>
                  <textarea
                    value={pointNote}
                    onChange={(e) => setPointNote(e.target.value)}
                    placeholder="Additional context..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none resize-none"
                  />
                </div>

                {/* Preview */}
                <div className={`p-3 rounded-xl border ${
                  pointType === 'positive' ? 'bg-ix-green-dim border-ix-green/20' : 'bg-ix-danger-dim border-ix-danger/20'
                }`}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`font-bold ${pointType === 'positive' ? 'text-ix-green' : 'text-ix-danger'}`}>
                      {pointType === 'positive' ? '+' : '-'}{pointAmount}
                    </span>
                    <span className="text-ix-text-secondary">to</span>
                    <span className="font-medium">{student.fullName}</span>
                  </div>
                  {(pointReason && pointReason !== '__custom__') && (
                    <p className="text-xs text-ix-text-muted mt-1">{pointReason}</p>
                  )}
                  {(pointReason === '__custom__' && pointCustomReason) && (
                    <p className="text-xs text-ix-text-muted mt-1">{pointCustomReason}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleAddPoints}
                  disabled={!pointReason || (pointReason === '__custom__' && !pointCustomReason.trim())}
                  className={`w-full h-12 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
                    pointType === 'positive'
                      ? 'bg-ix-green text-ix-bg hover:bg-ix-green-hover'
                      : 'bg-ix-danger text-white hover:bg-red-600'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {pointType === 'positive' ? `Add +${pointAmount} Points` : `Deduct -${pointAmount} Points`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD EVIDENCE MODAL ==================== */}
      {showAddEvidence && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddEvidence(false)} />
          <div className="absolute bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full animate-slide-up">
            <div className="bg-ix-surface border-t sm:border border-ix-border sm:rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ix-border">
                <h2 className="font-semibold text-lg">Add Evidence</h2>
                <button onClick={() => setShowAddEvidence(false)} className="p-1 text-ix-text-muted hover:text-ix-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Evidence Type */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-2">Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EVIDENCE_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setEvidenceType(type)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          evidenceType === type
                            ? 'bg-ix-green text-ix-bg'
                            : 'bg-ix-bg border border-ix-border text-ix-text-secondary hover:text-ix-text'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Description *</label>
                  <textarea
                    value={evidenceDescription}
                    onChange={(e) => setEvidenceDescription(e.target.value)}
                    placeholder="What did the student do? Be specific..."
                    rows={3}
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none resize-none"
                  />
                </div>

                {/* Related Project */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Related Project</label>
                  <select
                    value={evidenceProjectId}
                    onChange={(e) => setEvidenceProjectId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none appearance-none"
                  >
                    <option value="">None</option>
                    {studentWorks.map((w) => (
                      <option key={w.id} value={w.id}>{w.workId} — {w.companyName}</option>
                    ))}
                  </select>
                </div>

                {/* Evidence Link */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Evidence Link (optional)</label>
                  <input
                    type="url"
                    value={evidenceLink}
                    onChange={(e) => setEvidenceLink(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none"
                  />
                </div>

                {/* Preview */}
                <div className="p-3 rounded-xl bg-ix-bg border border-ix-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-ix-surface border border-ix-border text-ix-text-secondary">
                      {evidenceType}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-ix-text-secondary mt-1">
                    {evidenceDescription || 'Description will appear here...'}
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleAddEvidence}
                  disabled={!evidenceDescription.trim()}
                  className="w-full h-12 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" />
                  Add Evidence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
