'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { demoSalespersons } from '@/lib/demo-data';
import { ArrowLeft, ArrowRight, Check, Briefcase } from 'lucide-react';

const STEPS = ['Client', 'Project', 'Team', 'Timeline', 'Payment', 'Confirm'];

export default function NewWorkPage() {
  const router = useRouter();
  const { isOwner } = useAuth();
  const { students, addWork } = useData();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', clientEmail: '', companyName: '',
    projectName: '', projectPackage: '', totalBudget: '',
    salesperson: '', developer: '', designer: '', sameAsDeveloper: false,
    startDate: new Date().toISOString().split('T')[0], expectedCompletionDate: '',
    advanceReceived: '', developerPayment: '', designerPayment: '',
    notes: '',
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const activeStudents = students.filter((s) => ['Active', 'In Project', 'Selected'].includes(s.status));

  const canNext = () => {
    switch (step) {
      case 0: return form.clientName.trim().length > 0 && form.clientPhone.trim().length > 0;
      case 1: return form.projectName.trim().length > 0;
      case 2: return form.developer.length > 0;
      case 3: return form.startDate.length > 0;
      case 4: return true;
      default: return true;
    }
  };

  const handleSubmit = () => {
    const dev = students.find((s) => s.id === form.developer);
    const des = form.sameAsDeveloper ? dev : students.find((s) => s.id === form.designer);

    const created = addWork({
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim(),
      clientEmail: form.clientEmail.trim(),
      companyName: form.companyName.trim() || form.clientName.trim(),
      projectName: form.projectName.trim(),
      projectPackage: form.projectPackage || 'Standard Website',
      totalBudget: parseFloat(form.totalBudget) || 0,
      advanceReceived: parseFloat(form.advanceReceived) || 0,
      developerId: dev?.id || '',
      developerName: dev?.fullName || '',
      developerPayment: parseFloat(form.developerPayment) || 0,
      designerId: des?.id || '',
      designerName: des?.fullName || '',
      designerPayment: parseFloat(form.designerPayment) || 0,
      sameAsDeveloper: form.sameAsDeveloper,
      startDate: form.startDate,
      expectedCompletionDate: form.expectedCompletionDate,
      notes: form.notes,
    });

    router.push(`/works/${created.id}`);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <button
        onClick={() => step > 0 ? setStep(step - 1) : router.push('/works')}
        className="flex items-center gap-2 text-ix-text-secondary hover:text-ix-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{step > 0 ? 'Previous Step' : 'Works'}</span>
      </button>

      <div>
        <h1 className="text-xl font-bold">Create New Work</h1>
        <p className="text-sm text-ix-text-muted mt-1">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-ix-green' : 'bg-ix-border'}`} />
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-5 animate-fade-in" key={step}>
        <h2 className="font-semibold mb-4">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Client Name *</label>
              <input type="text" value={form.clientName} onChange={(e) => update('clientName', e.target.value)}
                placeholder="Client full name" autoFocus
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Client Phone *</label>
              <input type="tel" value={form.clientPhone} onChange={(e) => update('clientPhone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Client Email</label>
              <input type="email" value={form.clientEmail} onChange={(e) => update('clientEmail', e.target.value)}
                placeholder="client@example.com"
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Company Name</label>
              <input type="text" value={form.companyName} onChange={(e) => update('companyName', e.target.value)}
                placeholder="Company name"
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Project Name *</label>
              <input type="text" value={form.projectName} onChange={(e) => update('projectName', e.target.value)}
                placeholder="Website name / project title" autoFocus
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Package</label>
              <select value={form.projectPackage} onChange={(e) => update('projectPackage', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none appearance-none">
                <option value="">Select package</option>
                <option>Landing Page</option>
                <option>Portfolio Website</option>
                <option>Business Website</option>
                <option>E-commerce Website</option>
                <option>Restaurant Website</option>
                <option>Shopify Store</option>
                <option>WordPress Site</option>
                <option>Custom Web App</option>
                <option>Other</option>
              </select>
            </div>
            {isOwner && (
              <div>
                <label className="text-sm text-ix-text-muted block mb-1.5">Total Budget</label>
                <input type="number" value={form.totalBudget} onChange={(e) => update('totalBudget', e.target.value)}
                  placeholder="e.g., 24000"
                  className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Salesperson</label>
              <select value={form.salesperson} onChange={(e) => update('salesperson', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none appearance-none">
                <option value="">Select salesperson</option>
                {demoSalespersons.map((sp) => (
                  <option key={sp.id} value={sp.name}>{sp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Developer *</label>
              <select value={form.developer} onChange={(e) => update('developer', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none appearance-none">
                <option value="">Select developer</option>
                {activeStudents.map((s) => (
                  <option key={s.id} value={s.fullName}>{s.fullName} ({s.college})</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="sameAsDev" checked={form.sameAsDeveloper}
                onChange={(e) => update('sameAsDeveloper', e.target.checked)}
                className="w-4 h-4 rounded accent-ix-green" />
              <label htmlFor="sameAsDev" className="text-sm text-ix-text-secondary">Designer same as developer</label>
            </div>
            {!form.sameAsDeveloper && (
              <div>
                <label className="text-sm text-ix-text-muted block mb-1.5">Designer</label>
                <select value={form.designer} onChange={(e) => update('designer', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none appearance-none">
                  <option value="">Select designer</option>
                  {activeStudents.map((s) => (
                    <option key={s.id} value={s.fullName}>{s.fullName} ({s.college})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Expected Completion Date</label>
              <input type="date" value={form.expectedCompletionDate} onChange={(e) => update('expectedCompletionDate', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            {isOwner && (
              <>
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Advance Received</label>
                  <input type="number" value={form.advanceReceived} onChange={(e) => update('advanceReceived', e.target.value)}
                    placeholder="e.g., 12000"
                    className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm text-ix-text-muted block mb-1.5">Developer Payment</label>
                  <input type="number" value={form.developerPayment} onChange={(e) => update('developerPayment', e.target.value)}
                    placeholder="e.g., 8500"
                    className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
                </div>
                {!form.sameAsDeveloper && (
                  <div>
                    <label className="text-sm text-ix-text-muted block mb-1.5">Designer Payment</label>
                    <input type="number" value={form.designerPayment} onChange={(e) => update('designerPayment', e.target.value)}
                      placeholder="e.g., 3000"
                      className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none" />
                  </div>
                )}
              </>
            )}
            {!isOwner && (
              <p className="text-sm text-ix-text-muted text-center py-4">
                Payment details are managed by the Owner.
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{form.projectName || 'New Project'}</h3>
                <p className="text-sm text-ix-text-muted">{form.companyName || form.clientName}</p>
              </div>
            </div>
            {[
              ['Client', form.clientName],
              ['Phone', form.clientPhone],
              ['Package', form.projectPackage || '—'],
              ['Developer', form.developer],
              ['Designer', form.sameAsDeveloper ? 'Same as Developer' : (form.designer || '—')],
              ['Start Date', form.startDate],
              ['Deadline', form.expectedCompletionDate || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-ix-border last:border-0">
                <span className="text-sm text-ix-text-muted">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)}
                placeholder="Any notes for this project..." rows={2}
                className="w-full px-4 py-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none resize-none" />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext()}
            className="flex-1 h-12 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit}
            className="flex-1 h-12 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            <Check className="w-4 h-4" /> Create Work
          </button>
        )}
      </div>
    </div>
  );
}
