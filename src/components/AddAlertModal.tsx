'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { X, Bell, CheckCircle2, AlertCircle, Briefcase } from 'lucide-react';
import type { AlertPriority } from '@/types';

interface AddAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkId?: string;
}

export default function AddAlertModal({
  isOpen,
  onClose,
  defaultWorkId,
}: AddAlertModalProps) {
  const { works, addAlert } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AlertPriority>('Medium');
  const [selectedWorkId, setSelectedWorkId] = useState(defaultWorkId || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setSelectedWorkId(defaultWorkId || '');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen, defaultWorkId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter an alert title');
      return;
    }

    try {
      addAlert({
        title: title.trim(),
        description: description.trim(),
        priority,
        workId: selectedWorkId || undefined,
      });

      setSuccessMsg('Alert created successfully!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create alert');
    }
  };

  const priorityColors: Record<AlertPriority, string> = {
    Low: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    Medium: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    High: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    Critical: 'border-ix-danger/50 text-ix-danger bg-ix-danger/10',
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Create New Alert</h2>
              <p className="text-xs text-ix-text-muted">Broadcast a priority notification or flag</p>
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

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Alert Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Client payment overdue, QC required..."
              className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Low', 'Medium', 'High', 'Critical'] as AlertPriority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    priority === p
                      ? `${priorityColors[p]} ring-1 ring-offset-0`
                      : 'border-ix-border bg-ix-bg text-ix-text-secondary hover:border-ix-border-light'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide context or instructions for this alert..."
              className="w-full p-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors resize-none"
            />
          </div>

          {/* Related Work (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Related Project / Work (Optional)
            </label>
            <div className="relative">
              <select
                value={selectedWorkId}
                onChange={(e) => setSelectedWorkId(e.target.value)}
                className="w-full h-10 pl-9 pr-8 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors appearance-none"
              >
                <option value="">None (General Operational Alert)</option>
                {works.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.workId} - {w.projectName} ({w.clientName})
                  </option>
                ))}
              </select>
              <Briefcase className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-ix-green text-ix-bg hover:bg-ix-green-hover transition-all shadow-md shadow-ix-green/20"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
