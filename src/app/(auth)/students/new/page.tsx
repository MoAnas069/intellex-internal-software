'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, User } from 'lucide-react';
import { AVAILABLE_SKILLS } from '@/constants/skills';

const STEPS = ['Basic Info', 'Contact', 'Education', 'Skills', 'Confirm'];

export default function NewStudentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', college: '', course: '',
    yearSemester: '', joiningDate: new Date().toISOString().split('T')[0],
    primaryInterest: '', notes: '', selectedSkills: [] as string[],
  });

  const update = (field: string, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }));
  };

  const canNext = () => {
    switch (step) {
      case 0: return form.fullName.trim().length > 0;
      case 1: return form.phone.trim().length > 0;
      case 2: return form.college.trim().length > 0;
      case 3: return true;
      default: return true;
    }
  };

  const handleSubmit = () => {
    // In production, this would call an API
    alert('Student created successfully! (Demo mode)');
    router.push('/students');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <button
        onClick={() => step > 0 ? setStep(step - 1) : router.push('/students')}
        className="flex items-center gap-2 text-ix-text-secondary hover:text-ix-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">{step > 0 ? 'Previous Step' : 'Students'}</span>
      </button>

      <div>
        <h1 className="text-xl font-bold">Add New Student</h1>
        <p className="text-sm text-ix-text-muted mt-1">Step {step + 1} of {STEPS.length}</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? 'bg-ix-green' : 'bg-ix-border'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-ix-border bg-ix-surface p-5 animate-fade-in" key={step}>
        <h2 className="font-semibold mb-4">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Full Name *</label>
              <input
                type="text" value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="Enter student's full name"
                autoFocus
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Joining Date</label>
              <input
                type="date" value={form.joiningDate}
                onChange={(e) => update('joiningDate', e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Phone *</label>
              <input
                type="tel" value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                autoFocus
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Email</label>
              <input
                type="email" value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="student@example.com"
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">College *</label>
              <input
                type="text" value={form.college}
                onChange={(e) => update('college', e.target.value)}
                placeholder="College name"
                autoFocus
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Course</label>
              <input
                type="text" value={form.course}
                onChange={(e) => update('course', e.target.value)}
                placeholder="B.Tech CSE, BCA, etc."
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Year/Semester</label>
              <input
                type="text" value={form.yearSemester}
                onChange={(e) => update('yearSemester', e.target.value)}
                placeholder="3rd Year, 5th Semester, etc."
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Primary Interest</label>
              <input
                type="text" value={form.primaryInterest}
                onChange={(e) => update('primaryInterest', e.target.value)}
                placeholder="Web Development, UI/UX, etc."
                className="w-full h-12 px-4 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm text-ix-text-muted mb-3">Select initial skills (can be updated later)</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.selectedSkills.includes(skill)
                      ? 'bg-ix-green text-ix-bg'
                      : 'bg-ix-bg border border-ix-border text-ix-text-secondary hover:text-ix-text hover:border-ix-border-light'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-ix-green-dim border border-ix-green/20 flex items-center justify-center">
                <User className="w-7 h-7 text-ix-green" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{form.fullName}</h3>
                <p className="text-sm text-ix-text-muted">{form.college}</p>
              </div>
            </div>
            {[
              ['Phone', form.phone],
              ['Email', form.email || '—'],
              ['Course', form.course || '—'],
              ['Year', form.yearSemester || '—'],
              ['Interest', form.primaryInterest || '—'],
              ['Skills', form.selectedSkills.join(', ') || 'None selected'],
              ['Joining Date', form.joiningDate],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-ix-border last:border-0">
                <span className="text-sm text-ix-text-muted">{label}</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ))}
            <div>
              <label className="text-sm text-ix-text-muted block mb-1.5">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Any initial notes..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="flex-1 h-12 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 h-12 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            Create Student
          </button>
        )}
      </div>
    </div>
  );
}
