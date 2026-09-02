'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search, X, Plus, User, Briefcase, IndianRupee, Bell,
  Award, ArrowRight, Hash, Building2, FileText
} from 'lucide-react';
import { demoStudents, demoWorks, demoClients } from '@/lib/demo-data';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
}

export default function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isOwner } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        // Parent handles open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  // Build suggestions based on query
  const suggestions = useMemo((): Suggestion[] => {
    const q = query.toLowerCase().replace(/^@/, '').trim();
    const results: Suggestion[] = [];

    // Action commands
    const commands: Suggestion[] = [
      { id: 'cmd-new-work', label: 'New Work', sublabel: 'Create a new project', icon: Plus, action: () => navigate('/works/new'), category: 'Actions' },
      { id: 'cmd-new-student', label: 'New Student', sublabel: 'Add a new student', icon: Plus, action: () => navigate('/students/new'), category: 'Actions' },
      { id: 'cmd-new-alert', label: 'New Alert', sublabel: 'Create an alert', icon: Plus, action: () => navigate('/alerts?new=1'), category: 'Actions' },
    ];

    if (isOwner) {
      commands.push({
        id: 'cmd-new-payment', label: 'New Payment', sublabel: 'Record a payment', icon: Plus, action: () => navigate('/finance?new=1'), category: 'Actions'
      });
    }

    // Navigation commands
    const navCommands: Suggestion[] = [
      { id: 'nav-students', label: 'All Students', sublabel: 'View student list', icon: User, action: () => navigate('/students'), category: 'Navigate' },
      { id: 'nav-works', label: 'All Works', sublabel: 'View all projects', icon: Briefcase, action: () => navigate('/works'), category: 'Navigate' },
      { id: 'nav-ongoing', label: 'Ongoing Works', sublabel: 'Projects in progress', icon: Briefcase, action: () => navigate('/works?filter=ongoing'), category: 'Navigate' },
      { id: 'nav-completed', label: 'Completed Works', sublabel: 'Finished projects', icon: Briefcase, action: () => navigate('/works?filter=completed'), category: 'Navigate' },
      { id: 'nav-alerts', label: 'Alerts', sublabel: 'View all alerts', icon: Bell, action: () => navigate('/alerts'), category: 'Navigate' },
      { id: 'nav-top-students', label: 'Top Students', sublabel: 'Highest performing students', icon: Award, action: () => navigate('/students?sort=points-desc'), category: 'Navigate' },
      { id: 'nav-negative', label: 'Negative Points', sublabel: 'Students requiring attention', icon: Award, action: () => navigate('/students?filter=attention'), category: 'Navigate' },
    ];

    if (isOwner) {
      navCommands.push(
        { id: 'nav-pending-payments', label: 'Pending Payments', sublabel: 'Works with pending payments', icon: IndianRupee, action: () => navigate('/works?filter=pending-payment'), category: 'Navigate' },
        { id: 'nav-finance', label: 'Finance Overview', sublabel: 'Revenue, profit & payments', icon: IndianRupee, action: () => navigate('/finance'), category: 'Navigate' },
        { id: 'nav-reports', label: 'Reports', sublabel: 'Business & student reports', icon: FileText, action: () => navigate('/reports'), category: 'Navigate' },
      );
    }

    if (!q) {
      // Show default suggestions
      return [...commands.slice(0, 3), ...navCommands.slice(0, 4)];
    }

    // Filter commands
    const matchedCommands = [...commands, ...navCommands].filter(
      (c) => c.label.toLowerCase().includes(q) || c.sublabel.toLowerCase().includes(q)
    );
    results.push(...matchedCommands);

    // Search students
    const matchedStudents = demoStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.college.toLowerCase().includes(q)
    );
    results.push(
      ...matchedStudents.map((s) => ({
        id: `stu-${s.id}`,
        label: s.fullName,
        sublabel: `${s.studentId} • ${s.college} • ${s.currentPoints >= 0 ? '+' : ''}${s.currentPoints} pts`,
        icon: User,
        action: () => navigate(`/students/${s.id}`),
        category: 'Students',
      }))
    );

    // Search works
    const matchedWorks = demoWorks.filter(
      (w) =>
        w.workId.toLowerCase().includes(q) ||
        w.projectName.toLowerCase().includes(q) ||
        w.clientName.toLowerCase().includes(q) ||
        w.companyName.toLowerCase().includes(q)
    );
    results.push(
      ...matchedWorks.map((w) => ({
        id: `work-${w.id}`,
        label: `${w.workId} — ${w.companyName}`,
        sublabel: `${w.projectName} • ${w.currentStage}`,
        icon: Briefcase,
        action: () => navigate(`/works/${w.id}`),
        category: 'Works',
      }))
    );

    // Search clients
    const matchedClients = demoClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
    );
    results.push(
      ...matchedClients.map((c) => ({
        id: `client-${c.id}`,
        label: c.company || c.name,
        sublabel: `${c.projectCount} projects • ${c.name}`,
        icon: Building2,
        action: () => navigate(`/clients/${c.id}`),
        category: 'Clients',
      }))
    );

    return results.slice(0, 15);
  }, [query, isOwner]);

  // Group suggestions by category
  const grouped = useMemo(() => {
    const groups: Record<string, Suggestion[]> = {};
    suggestions.forEach((s) => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  }, [suggestions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Command Bar */}
      <div className="absolute top-0 left-0 right-0 sm:top-[15%] sm:left-1/2 sm:-translate-x-1/2 sm:max-w-lg w-full animate-slide-down">
        <div className="bg-ix-surface border-b sm:border border-ix-border sm:rounded-2xl overflow-hidden shadow-2xl">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-ix-border">
            <Search className="w-5 h-5 text-ix-text-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or type @command..."
              className="flex-1 bg-transparent text-ix-text placeholder:text-ix-text-muted text-base focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-ix-text-muted hover:text-ix-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-ix-text-muted text-xs px-2 py-1 rounded bg-ix-bg border border-ix-border hover:text-ix-text"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-ix-text-muted uppercase tracking-widest">
                  {category}
                </div>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ix-surface-hover transition-colors group text-left"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-ix-bg border border-ix-border flex-shrink-0">
                      <item.icon className="w-4 h-4 text-ix-text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ix-text truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-ix-text-muted truncate">
                        {item.sublabel}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ))}

            {suggestions.length === 0 && query && (
              <div className="py-8 text-center">
                <Hash className="w-8 h-8 text-ix-text-muted mx-auto mb-2" />
                <p className="text-sm text-ix-text-muted">No results for &ldquo;{query}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
