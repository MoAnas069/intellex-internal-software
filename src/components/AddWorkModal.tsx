'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useRouter } from 'next/navigation';
import { X, Briefcase, CheckCircle2, AlertCircle, IndianRupee, Calendar, ExternalLink } from 'lucide-react';

interface AddWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddWorkModal({ isOpen, onClose }: AddWorkModalProps) {
  const { students, addWork } = useData();
  const router = useRouter();

  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [projectPackage, setProjectPackage] = useState('Standard Website');
  const [totalBudget, setTotalBudget] = useState('');
  const [advanceReceived, setAdvanceReceived] = useState('');
  const [developerId, setDeveloperId] = useState('');
  const [designerId, setDesignerId] = useState('');
  const [sameAsDeveloper, setSameAsDeveloper] = useState(false);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeStudents = students.filter((s) => ['Active', 'In Project', 'Selected'].includes(s.status));

  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setCompanyName('');
      setProjectPackage('Standard Website');
      setTotalBudget('');
      setAdvanceReceived('');
      setDeveloperId(activeStudents[0]?.id || '');
      setDesignerId(activeStudents[1]?.id || activeStudents[0]?.id || '');
      setSameAsDeveloper(false);
      setExpectedCompletionDate('');
      setNotes('');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!clientName.trim()) {
      setErrorMsg('Please enter a client name');
      return;
    }

    if (!projectName.trim()) {
      setErrorMsg('Please enter a project name');
      return;
    }

    const budgetNum = parseFloat(totalBudget) || 0;
    if (budgetNum <= 0) {
      setErrorMsg('Please enter a valid total budget');
      return;
    }

    const advNum = parseFloat(advanceReceived) || 0;
    if (advNum > budgetNum) {
      setErrorMsg('Advance amount cannot exceed total budget');
      return;
    }

    const dev = students.find((s) => s.id === developerId);
    const des = sameAsDeveloper ? dev : students.find((s) => s.id === designerId);

    try {
      const created = addWork({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim(),
        companyName: companyName.trim() || clientName.trim(),
        projectName: projectName.trim(),
        projectPackage,
        totalBudget: budgetNum,
        advanceReceived: advNum,
        developerId: dev?.id || '',
        developerName: dev?.fullName || '',
        designerId: des?.id || '',
        designerName: des?.fullName || '',
        sameAsDeveloper,
        expectedCompletionDate: expectedCompletionDate || undefined,
        notes: notes.trim(),
      });

      setSuccessMsg(`Project ${created.workId} created successfully!`);
      setTimeout(() => {
        onClose();
        router.push(`/works/${created.id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create work project');
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">New Work Project</h2>
              <p className="text-xs text-ix-text-muted">Register a new client engagement</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/works/new');
              }}
              className="px-2.5 py-1 text-xs text-ix-text-muted hover:text-ix-text flex items-center gap-1 rounded-lg hover:bg-ix-surface-hover transition-colors"
              title="Open full wizard"
            >
              <span>Full Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ix-text-muted hover:text-ix-text hover:bg-ix-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

          {/* Project & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., ABC Interiors Website"
                className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Client / Company Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Rajesh Kumar"
                className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
                required
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Client Phone
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Package / Scope
              </label>
              <select
                value={projectPackage}
                onChange={(e) => setProjectPackage(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              >
                <option value="Basic Website">Basic Website (Landing)</option>
                <option value="Standard Website">Standard Website (5-8 pages)</option>
                <option value="Full Stack Web App">Full Stack Web App</option>
                <option value="E-Commerce">E-Commerce Store</option>
                <option value="Custom">Custom Solution</option>
              </select>
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Total Budget (₹) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="25000"
                  className="w-full h-10 pl-8 pr-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
                  required
                />
                <IndianRupee className="w-4 h-4 text-ix-text-muted absolute left-2.5 top-3 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Advance Received (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={advanceReceived}
                  onChange={(e) => setAdvanceReceived(e.target.value)}
                  placeholder="10000"
                  className="w-full h-10 pl-8 pr-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
                />
                <IndianRupee className="w-4 h-4 text-ix-text-muted absolute left-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Assigned Students */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Lead Developer
              </label>
              <select
                value={developerId}
                onChange={(e) => setDeveloperId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              >
                <option value="">Select student...</option>
                {activeStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.primaryInterest})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Designer
              </label>
              <select
                value={sameAsDeveloper ? developerId : designerId}
                disabled={sameAsDeveloper}
                onChange={(e) => setDesignerId(e.target.value)}
                className={`w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors ${
                  sameAsDeveloper ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select student...</option>
                {activeStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.primaryInterest})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-ix-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={sameAsDeveloper}
              onChange={(e) => setSameAsDeveloper(e.target.checked)}
              className="rounded border-ix-border text-ix-green focus:ring-0"
            />
            <span>Designer is the same person as Lead Developer</span>
          </label>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Expected Delivery Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={expectedCompletionDate}
                onChange={(e) => setExpectedCompletionDate(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              />
              <Calendar className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Initial requirements, domain or hosting requirements..."
              className="w-full p-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors resize-none"
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
