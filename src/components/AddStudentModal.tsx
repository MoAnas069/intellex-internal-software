'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useRouter } from 'next/navigation';
import { X, User, CheckCircle2, AlertCircle, GraduationCap, Phone, Mail, ExternalLink } from 'lucide-react';
import type { StudentStatus } from '@/types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INTERESTS = [
  'Web Development',
  'Frontend (React/Next.js)',
  'Backend (Node/Python)',
  'Full Stack',
  'UI/UX Design',
  'Mobile App Development',
  'DevOps & Cloud',
];

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const { addStudent } = useData();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('B.Tech CSE');
  const [yearSemester, setYearSemester] = useState('3rd Year');
  const [primaryInterest, setPrimaryInterest] = useState(INTERESTS[0]);
  const [status, setStatus] = useState<StudentStatus>('In Training');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setPhone('');
      setEmail('');
      setCollege('');
      setCourse('B.Tech CSE');
      setYearSemester('3rd Year');
      setPrimaryInterest(INTERESTS[0]);
      setStatus('In Training');
      setNotes('');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter student full name');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Please enter student phone number');
      return;
    }

    try {
      const created = addStudent({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        college: college.trim(),
        course: course.trim(),
        yearSemester,
        primaryInterest,
        status,
        notes: notes.trim(),
      });

      setSuccessMsg(`Student ${created.fullName} (${created.studentId}) registered successfully!`);
      setTimeout(() => {
        onClose();
        router.push(`/students/${created.id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to register student');
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
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Register Student</h2>
              <p className="text-xs text-ix-text-muted">Onboard a student into the talent pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/students/new');
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

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Karthik Nair"
              className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              required
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
                  required
                />
                <Phone className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
                />
                <Mail className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* College & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                College / Institution
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g., NIT, CUSAT..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
                />
                <GraduationCap className="w-4 h-4 text-ix-text-muted absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Course & Year
              </label>
              <input
                type="text"
                value={`${course} - ${yearSemester}`}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="B.Tech CSE - 3rd Year"
                className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              />
            </div>
          </div>

          {/* Interest & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Primary Interest
              </label>
              <select
                value={primaryInterest}
                onChange={(e) => setPrimaryInterest(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              >
                {INTERESTS.map((int) => (
                  <option key={int} value={int}>
                    {int}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full h-10 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm text-ix-text focus:outline-none focus:border-ix-green transition-colors"
              >
                <option value="In Training">In Training</option>
                <option value="Active">Active</option>
                <option value="In Project">In Project</option>
                <option value="Selected">Selected</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
              Notes / Background
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Prior experience, portfolio link, interview notes..."
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-all shadow-md shadow-green-500/20"
            >
              Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
