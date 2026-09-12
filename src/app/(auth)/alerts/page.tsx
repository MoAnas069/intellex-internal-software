'use client';

import { useData } from '@/contexts/DataContext';
import { formatDate } from '@/lib/utils';
import type { AlertPriority } from '@/types';
import { Bell, CheckCircle2, Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function AlertsPage() {
  const { alerts, works, students, addAlert, markAlertCompleted } = useData();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [showNewAlert, setShowNewAlert] = useState(false);

  // New Alert form state
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [alertPriority, setAlertPriority] = useState<AlertPriority>('Medium');
  const [alertWorkId, setAlertWorkId] = useState('');
  const [alertStudentId, setAlertStudentId] = useState('');

  const filtered = alerts.filter((a) => {
    if (filter === 'active') return a.status === 'Active';
    if (filter === 'completed') return a.status === 'Completed';
    return true;
  });

  const handleCreateAlert = () => {
    if (!alertTitle.trim()) return;

    addAlert({
      title: alertTitle.trim(),
      description: alertDescription.trim(),
      priority: alertPriority,
      workId: alertWorkId || undefined,
      studentId: alertStudentId || undefined,
    });

    // Reset form
    setAlertTitle('');
    setAlertDescription('');
    setAlertPriority('Medium');
    setAlertWorkId('');
    setAlertStudentId('');
    setShowNewAlert(false);
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-ix-danger text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      default: return 'bg-ix-surface text-ix-text-muted';
    }
  };

  const priorityDot = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-ix-danger';
      case 'High': return 'bg-orange-400';
      case 'Medium': return 'bg-amber-400';
      default: return 'bg-ix-text-muted';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Alerts</h1>
          <p className="text-sm text-ix-text-muted">{filtered.length} alerts</p>
        </div>
        <button
          onClick={() => setShowNewAlert(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Alert</span>
        </button>
      </div>

      <div className="flex gap-2">
        {(['active', 'all', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f ? 'bg-ix-green text-ix-bg' : 'bg-ix-surface border border-ix-border text-ix-text-secondary'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((alert) => (
          <div key={alert.id} className="rounded-xl border border-ix-border bg-ix-surface p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${priorityDot(alert.priority)}`} />
                <div>
                  <h3 className="text-sm font-semibold">{alert.title}</h3>
                  <p className="text-xs text-ix-text-muted mt-0.5">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColor(alert.priority)}`}>
                      {alert.priority}
                    </span>
                    <span className="text-[10px] text-ix-text-muted">{formatDate(alert.createdAt)}</span>
                    {alert.status === 'Completed' && (
                      <span className="text-[10px] text-ix-green flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {alert.status === 'Active' && (
                <button
                  onClick={() => markAlertCompleted(alert.id)}
                  className="p-2 rounded-lg hover:bg-ix-green-dim text-ix-text-muted hover:text-ix-green transition-colors"
                  title="Mark as completed"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-8 h-8 text-ix-text-muted mx-auto mb-2" />
            <p className="text-ix-text-muted text-sm">No alerts</p>
          </div>
        )}
      </div>

      {/* ==================== NEW ALERT MODAL ==================== */}
      {showNewAlert && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowNewAlert(false)} />
          <div className="absolute bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-md w-full animate-slide-up">
            <div className="bg-ix-surface border-t sm:border border-ix-border sm:rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ix-border">
                <h2 className="font-semibold text-lg">New Alert</h2>
                <button onClick={() => setShowNewAlert(false)} className="p-1 text-ix-text-muted hover:text-ix-text">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="Alert title..."
                    autoFocus
                    className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Description</label>
                  <textarea
                    value={alertDescription}
                    onChange={(e) => setAlertDescription(e.target.value)}
                    placeholder="More details about this alert..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-2">Priority</label>
                  <div className="flex gap-2">
                    {(['Low', 'Medium', 'High', 'Critical'] as AlertPriority[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setAlertPriority(p)}
                        className={`flex-1 h-10 rounded-xl text-xs font-medium transition-all ${
                          alertPriority === p
                            ? p === 'Critical' ? 'bg-ix-danger text-white'
                              : p === 'High' ? 'bg-orange-500 text-white'
                              : p === 'Medium' ? 'bg-amber-500 text-white'
                              : 'bg-ix-text-muted text-ix-bg'
                            : 'bg-ix-bg border border-ix-border text-ix-text-secondary hover:text-ix-text'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Related Work */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Related Work (optional)</label>
                  <select
                    value={alertWorkId}
                    onChange={(e) => setAlertWorkId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none appearance-none"
                  >
                    <option value="">None</option>
                    {works.map((w) => (
                      <option key={w.id} value={w.id}>{w.workId} — {w.companyName}</option>
                    ))}
                  </select>
                </div>

                {/* Related Student */}
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Related Student (optional)</label>
                  <select
                    value={alertStudentId}
                    onChange={(e) => setAlertStudentId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none appearance-none"
                  >
                    <option value="">None</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>
                    ))}
                  </select>
                </div>

                {/* Preview */}
                <div className="p-3 rounded-xl bg-ix-bg border border-ix-border">
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${priorityDot(alertPriority)}`} />
                    <div>
                      <p className="text-sm font-medium">{alertTitle || 'Alert title...'}</p>
                      {alertDescription && (
                        <p className="text-xs text-ix-text-muted mt-0.5">{alertDescription}</p>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${priorityColor(alertPriority)}`}>
                        {alertPriority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleCreateAlert}
                  disabled={!alertTitle.trim()}
                  className="w-full h-12 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Bell className="w-4 h-4" />
                  Create Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
