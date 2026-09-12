'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { X, Award, CheckCircle2, AlertCircle, User, Briefcase, Plus, Minus } from 'lucide-react';
import type { PointType } from '@/types';

interface AddPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string;
}

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

export default function AddPointsModal({
  isOpen,
  onClose,
  defaultStudentId,
}: AddPointsModalProps) {
  const { students, works, addPointTransaction } = useData();

  const [studentId, setStudentId] = useState(defaultStudentId || '');
  const [pointType, setPointType] = useState<PointType>('positive');
  const [amount, setAmount] = useState<number>(5);
  const [reason, setReason] = useState(POSITIVE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [workId, setWorkId] = useState('');
  const [note, setNote] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStudentId(defaultStudentId || (students[0]?.id ?? ''));
      setPointType('positive');
      setAmount(5);
      setReason(POSITIVE_REASONS[0]);
      setCustomReason('');
      setWorkId('');
      setNote('');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen, defaultStudentId, students]);

  useEffect(() => {
    // Switch default reason when point type changes
    if (pointType === 'positive') {
      setReason(POSITIVE_REASONS[0]);
    } else {
      setReason(NEGATIVE_REASONS[0]);
    }
  }, [pointType]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId) {
      setErrorMsg('Please select a student');
      return;
    }

    if (!amount || amount <= 0) {
      setErrorMsg('Please enter a valid point amount (> 0)');
      return;
    }

    const finalReason = customReason.trim() || reason;
    if (!finalReason) {
      setErrorMsg('Please specify a reason');
      return;
    }

    try {
      addPointTransaction(studentId, {
        amount,
        type: pointType,
        reason: finalReason,
        relatedWorkId: workId || undefined,
        note: note.trim() || undefined,
      });

      const sign = pointType === 'positive' ? '+' : '-';
      setSuccessMsg(
        `Successfully awarded ${sign}${amount} points to ${currentStudent?.fullName || 'student'}!`
      );
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to record point transaction');
    }
  };

  const currentReasons = pointType === 'positive' ? POSITIVE_REASONS : NEGATIVE_REASONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-ix-surface border border-ix-border shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ix-border bg-ix-surface-hover/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                pointType === 'positive'
                  ? 'bg-ix-green/10 border-ix-green/30 text-ix-green'
                  : 'bg-ix-danger/10 border-ix-danger/30 text-ix-danger'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Award / Deduct Points</h2>
              <p className="text-xs text-ix-text-muted">
                {currentStudent
                  ? `${currentStudent.fullName} (Current: ${currentStudent.currentPoints} pts)`
                  : 'Update student performance points'}
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
                    {s.fullName} ({s.studentId}) — {s.currentPoints} pts [{s.status}]
                  </option>
                ))}
              </select>
              <User className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Point Type (+ / -) */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Action Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPointType('positive')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  pointType === 'positive'
                    ? 'bg-ix-green-dim border-ix-green text-ix-green shadow-xs'
                    : 'bg-ix-bg border-ix-border text-ix-text-secondary hover:border-ix-border-light'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Positive (+ Points)</span>
              </button>

              <button
                type="button"
                onClick={() => setPointType('negative')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  pointType === 'negative'
                    ? 'bg-ix-danger-dim border-ix-danger text-ix-danger shadow-xs'
                    : 'bg-ix-bg border-ix-border text-ix-text-secondary hover:border-ix-border-light'
                }`}
              >
                <Minus className="w-4 h-4" />
                <span>Negative (- Points)</span>
              </button>
            </div>
          </div>

          {/* Amount presets & input */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Point Amount
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[2, 5, 10, 15].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    amount === val
                      ? pointType === 'positive'
                        ? 'bg-ix-green text-ix-bg border-ix-green'
                        : 'bg-ix-danger text-white border-ix-danger'
                      : 'bg-ix-bg border-ix-border text-ix-text-secondary hover:border-ix-border-light'
                  }`}
                >
                  {pointType === 'positive' ? `+${val}` : `-${val}`}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="100"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              placeholder="Or enter custom amount"
            />
          </div>

          {/* Preset Reasons */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Reason / Category
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {currentReasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => {
                    setReason(r);
                    setCustomReason('');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                    reason === r && !customReason
                      ? pointType === 'positive'
                        ? 'bg-ix-green/10 border-ix-green/40 text-ix-green font-semibold'
                        : 'bg-ix-danger/10 border-ix-danger/40 text-ix-danger font-semibold'
                      : 'bg-ix-bg border-ix-border text-ix-text-secondary hover:border-ix-border-light'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Or type custom reason..."
              className="w-full h-9 px-3 rounded-xl bg-ix-bg border border-ix-border text-xs text-ix-text focus:outline-none focus:border-ix-green transition-colors"
            />
          </div>

          {/* Related Project (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Related Project (Optional)
            </label>
            <div className="relative">
              <select
                value={workId}
                onChange={(e) => setWorkId(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors appearance-none"
              >
                <option value="">None (Independent of project)</option>
                {works.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.workId} - {w.projectName}
                  </option>
                ))}
              </select>
              <Briefcase className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Additional Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Extra details, e.g. Client specifically praised speed..."
              className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-xs text-ix-text focus:outline-none focus:border-ix-green transition-colors"
            />
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
              className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
                pointType === 'positive'
                  ? 'bg-ix-green text-ix-bg hover:bg-ix-green-hover shadow-ix-green/20'
                  : 'bg-ix-danger text-white hover:bg-red-600 shadow-ix-danger/20'
              }`}
            >
              Confirm {pointType === 'positive' ? `+${amount}` : `-${amount}`} Points
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
