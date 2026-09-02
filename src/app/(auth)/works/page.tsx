'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { demoWorks } from '@/lib/demo-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getStageLabel } from '@/constants/stages';
import { Search, Plus, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Design', value: 'design' },
  { label: 'Development', value: 'development' },
  { label: 'Pending Payment', value: 'pending-payment' },
  { label: 'New', value: 'new' },
];

export default function WorksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOwner } = useAuth();

  const initialFilter = searchParams.get('filter') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  const filtered = useMemo(() => {
    let works = [...demoWorks];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      works = works.filter(
        (w) =>
          w.workId.toLowerCase().includes(q) ||
          w.projectName.toLowerCase().includes(q) ||
          w.clientName.toLowerCase().includes(q) ||
          w.companyName.toLowerCase().includes(q) ||
          w.developerName.toLowerCase().includes(q)
      );
    }

    // Filter
    switch (filter) {
      case 'ongoing':
        works = works.filter((w) => w.currentStage !== 'COMPLETED');
        break;
      case 'completed':
        works = works.filter((w) => w.currentStage === 'COMPLETED');
        break;
      case 'design':
        works = works.filter((w) => ['DESIGN', 'DESIGN_QC'].includes(w.currentStage));
        break;
      case 'development':
        works = works.filter((w) => ['DEVELOPMENT', 'DEVELOPMENT_QC'].includes(w.currentStage));
        break;
      case 'pending-payment':
        works = works.filter((w) => w.remainingPayment > 0);
        break;
      case 'new':
        works = works.filter((w) => w.currentStage === 'NEW');
        break;
    }

    // Sort by most recent update
    works.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return works;
  }, [searchQuery, filter]);

  const stageColor = (stage: string) => {
    if (stage === 'COMPLETED') return 'text-ix-green bg-ix-green-dim border-ix-green/20';
    if (['DESIGN', 'DESIGN_QC'].includes(stage)) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    if (['DEVELOPMENT', 'DEVELOPMENT_QC'].includes(stage)) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (stage === 'NEW') return 'text-ix-text-muted bg-ix-surface border-ix-border';
    if (['DEPLOYMENT', 'ONE_MONTH_SUPPORT'].includes(stage)) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Works</h1>
          <p className="text-sm text-ix-text-muted">{filtered.length} projects</p>
        </div>
        <button
          onClick={() => router.push('/works/new')}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Work</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ix-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search works, clients..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-ix-surface border border-ix-border text-sm placeholder:text-ix-text-muted focus:border-ix-green focus:outline-none transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.value
                ? 'bg-ix-green text-ix-bg'
                : 'bg-ix-surface border border-ix-border text-ix-text-secondary hover:text-ix-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Work Cards */}
      <div className="space-y-2 stagger-children">
        {filtered.map((work) => (
          <button
            key={work.id}
            onClick={() => router.push(`/works/${work.id}`)}
            className="w-full rounded-2xl border border-ix-border bg-ix-surface p-4 text-left hover:bg-ix-surface-hover hover:border-ix-border-light transition-all group active:scale-[0.99]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${stageColor(work.currentStage)}`}>
                    {getStageLabel(work.currentStage)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold mt-1.5">{work.companyName}</h3>
                <p className="text-xs text-ix-text-muted mt-0.5">{work.projectName}</p>

                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs text-ix-text-secondary">
                    Dev: {work.developerName}
                  </span>
                  {work.designerName && !work.sameAsDeveloper && (
                    <span className="text-xs text-ix-text-secondary">
                      Design: {work.designerName}
                    </span>
                  )}
                  {isOwner && work.remainingPayment > 0 && (
                    <span className="text-xs text-amber-400">
                      Pending: {formatCurrency(work.remainingPayment)}
                    </span>
                  )}
                </div>
              </div>

              <div className="ml-3 flex flex-col items-end gap-2">
                {/* Progress */}
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#262626" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="14" fill="none"
                      stroke={work.currentStage === 'COMPLETED' ? '#00ff88' : '#4488ff'}
                      strokeWidth="3"
                      strokeDasharray={`${work.progress * 0.88} 88`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {work.progress}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ix-text-muted">No works found</p>
          </div>
        )}
      </div>
    </div>
  );
}
