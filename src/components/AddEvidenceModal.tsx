'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { X, FileText, CheckCircle2, AlertCircle, User, Briefcase, Link as LinkIcon } from 'lucide-react';
import type { EvidenceType } from '@/types';

interface AddEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string;
}

const EVIDENCE_TYPES: EvidenceType[] = [
  'GitHub Contribution',
  'PR Review',
  'Code Review',
  'Client Call',
  'Client Demo',
  'Requirement Clarification',
  'Bug Fixing',
  'Performance Optimization',
  'PageSpeed Result',
  'Team Contribution',
  'Peer Mentoring',
  'Research Contribution',
  'Independent Problem Solving',
  'Project Ownership',
  'Client Feedback',
];

export default function AddEvidenceModal({
  isOpen,
  onClose,
  defaultStudentId,
}: AddEvidenceModalProps) {
  const { students, works, addEvidence } = useData();

  const [studentId, setStudentId] = useState(defaultStudentId || '');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>(EVIDENCE_TYPES[0]);
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceLink, setEvidenceLink] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStudentId(defaultStudentId || (students[0]?.id ?? ''));
      setEvidenceType(EVIDENCE_TYPES[0]);
      setProjectId('');
      setDescription('');
      setEvidenceLink('');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen, defaultStudentId, students]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId) {
      setErrorMsg('Please select a student');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please provide a description of the work / evidence');
      return;
    }

    try {
      addEvidence(studentId, {
        type: evidenceType,
        description: description.trim(),
        evidenceLink: evidenceLink.trim() || undefined,
        projectId: projectId || undefined,
      });

      setSuccessMsg(
        `Successfully added evidence record for ${currentStudent?.fullName || 'student'}!`
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to record evidence');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-ix-surface border border-ix-border shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ix-border bg-ix-surface-hover/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Evidence Record</h2>
              <p className="text-xs text-ix-text-muted">
                {currentStudent
                  ? `For ${currentStudent.fullName} (${currentStudent.studentId})`
                  : 'Document student contribution & artifacts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ix-text-muted hover:text-ix-text hover:bg-ix-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-ix-danger/10 border border-ix-danger/20 text-ix-danger text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-ix-green/10 border border-ix-green/20 text-ix-green text-xs animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Select Student *
            </label>
            <div className="relative">
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors appearance-none"
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.studentId}) — [{s.status}]
                  </option>
                ))}
              </select>
              <User className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Evidence Type */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Evidence Type *
            </label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
              className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Related Project (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Related Project / Work (Optional)
            </label>
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors appearance-none"
              >
                <option value="">None (General contribution)</option>
                {works.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.workId} - {w.projectName} ({w.clientName})
                  </option>
                ))}
              </select>
              <Briefcase className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Description of Work *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g., Built responsive navbar and tested cross-browser compatibility..."
              className="w-full p-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors resize-none"
              required
            />
          </div>

          {/* Evidence Link */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Evidence / Proof Link (Optional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                placeholder="https://github.com/..., Figma, Drive..."
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              />
              <LinkIcon className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ix-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-ix-text-secondary hover:text-ix-text hover:bg-ix-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-white hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/20"
            >
              Save Evidence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
