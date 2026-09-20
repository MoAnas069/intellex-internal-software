'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getStageLabel, WORK_STAGES } from '@/constants/stages';
import {
  Search, Plus, ChevronRight, Filter, X, Building2,
  Phone, User, Calendar, IndianRupee, ArrowUpDown, Check
} from 'lucide-react';

export default function WorksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOwner } = useAuth();
  const { works } = useData();

  const initialFilter = searchParams.get('filter') || 'all';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState(initialFilter);
  const [selectedClient, setSelectedClient] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'deadline' | 'budget' | 'pending' | 'progress'>('updated');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Extract unique clients with project count
  const clientOptions = useMemo(() => {
    const map = new Map<string, { name: string; company: string; phone: string; count: number }>();
    works.forEach((w) => {
      const key = w.clientName || w.companyName;
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          name: w.clientName,
          company: w.companyName,
          phone: w.clientPhone,
          count: 1,
        });
      }
    });
    return Array.from(map.entries()).map(([key, val]) => ({
      key,
      ...val,
    })).sort((a, b) => b.count - a.count);
  }, [works]);

  // Extract unique developers
  const developerOptions = useMemo(() => {
    const set = new Set<string>();
    works.forEach((w) => {
      if (w.developerName) set.add(w.developerName);
    });
    return Array.from(set).sort();
  }, [works]);

  // Extract unique salespersons
  const salespersonOptions = useMemo(() => {
    const set = new Set<string>();
    works.forEach((w) => {
      if (w.salespersonName) set.add(w.salespersonName);
    });
    return Array.from(set).sort();
  }, [works]);

  // Filter & Search Logic
  const filtered = useMemo(() => {
    let result = [...works];

    // Universal Text Search (Project name, Work ID, Client name, Client phone, Company, Developer, Salesperson)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const phoneDigitsOnly = q.replace(/\D/g, '');

      result = result.filter((w) => {
        const wPhoneDigits = (w.clientPhone || '').replace(/\D/g, '');
        const phoneMatch = phoneDigitsOnly.length >= 3 && wPhoneDigits.includes(phoneDigitsOnly);

        return (
          w.workId.toLowerCase().includes(q) ||
          w.projectName.toLowerCase().includes(q) ||
          w.clientName.toLowerCase().includes(q) ||
          w.companyName.toLowerCase().includes(q) ||
          w.developerName.toLowerCase().includes(q) ||
          w.salespersonName.toLowerCase().includes(q) ||
          (w.notes && w.notes.toLowerCase().includes(q)) ||
          phoneMatch
        );
      });
    }

    // Client filter
    if (selectedClient) {
      result = result.filter(
        (w) => w.clientName === selectedClient || w.companyName === selectedClient
      );
    }

    // Developer filter
    if (selectedDeveloper) {
      result = result.filter((w) => w.developerName === selectedDeveloper);
    }

    // Salesperson filter
    if (selectedSalesperson) {
      result = result.filter((w) => w.salespersonName === selectedSalesperson);
    }

    // Stage Filter
    if (stageFilter === 'ongoing') {
      result = result.filter((w) => w.currentStage !== 'COMPLETED');
    } else if (stageFilter === 'completed') {
      result = result.filter((w) => w.currentStage === 'COMPLETED');
    } else if (stageFilter === 'design') {
      result = result.filter((w) => ['DESIGN', 'DESIGN_QC'].includes(w.currentStage));
    } else if (stageFilter === 'development') {
      result = result.filter((w) => ['DEVELOPMENT', 'DEVELOPMENT_QC'].includes(w.currentStage));
    } else if (stageFilter === 'pending-payment') {
      result = result.filter((w) => w.remainingPayment > 0);
    } else if (stageFilter === 'new') {
      result = result.filter((w) => w.currentStage === 'NEW');
    } else if (stageFilter !== 'all') {
      result = result.filter((w) => w.currentStage === stageFilter);
    }

    // Payment Filter
    if (paymentFilter === 'pending') {
      result = result.filter((w) => w.remainingPayment > 0);
    } else if (paymentFilter === 'paid') {
      result = result.filter((w) => w.remainingPayment === 0);
    } else if (paymentFilter === 'advance_only') {
      result = result.filter((w) => w.advanceReceived > 0 && w.secondPayment === 0 && w.finalPayment === 0);
    }

    // Sort Logic
    result.sort((a, b) => {
      if (sortBy === 'deadline') {
        const dateA = a.expectedCompletionDate ? new Date(a.expectedCompletionDate).getTime() : Infinity;
        const dateB = b.expectedCompletionDate ? new Date(b.expectedCompletionDate).getTime() : Infinity;
        return dateA - dateB;
      }
      if (sortBy === 'budget') {
        return b.totalBudget - a.totalBudget;
      }
      if (sortBy === 'pending') {
        return b.remainingPayment - a.remainingPayment;
      }
      if (sortBy === 'progress') {
        return b.progress - a.progress;
      }
      // default: updated
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

    return result;
  }, [
    works,
    searchQuery,
    selectedClient,
    selectedDeveloper,
    selectedSalesperson,
    stageFilter,
    paymentFilter,
    sortBy,
  ]);

  const hasActiveFilters =
    searchQuery ||
    selectedClient ||
    stageFilter !== 'all' ||
    paymentFilter !== 'all' ||
    selectedDeveloper ||
    selectedSalesperson ||
    sortBy !== 'updated';

  const resetAllFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    setSelectedClient('');
    setPaymentFilter('all');
    setSelectedDeveloper('');
    setSelectedSalesperson('');
    setSortBy('updated');
  };

  const stageColor = (stage: string) => {
    if (stage === 'COMPLETED') return 'text-ix-green bg-ix-green-dim border-ix-green/20';
    if (['DESIGN', 'DESIGN_QC'].includes(stage)) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    if (['DEVELOPMENT', 'DEVELOPMENT_QC'].includes(stage)) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (stage === 'NEW') return 'text-ix-text-muted bg-ix-surface border-ix-border';
    if (['DEPLOYMENT', 'ONE_MONTH_SUPPORT'].includes(stage)) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  };

  const totalFilteredBudget = filtered.reduce((s, w) => s + w.totalBudget, 0);
  const totalFilteredPending = filtered.reduce((s, w) => s + w.remainingPayment, 0);

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Works & Projects</h1>
          <p className="text-xs sm:text-sm text-ix-text-muted">
            Showing {filtered.length} of {works.length} projects • Total Value:{' '}
            <span className="text-ix-text font-semibold">{formatCurrency(totalFilteredBudget)}</span>
            {totalFilteredPending > 0 && (
              <span className="text-amber-400 ml-1 font-semibold">
                ({formatCurrency(totalFilteredPending)} pending)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => router.push('/works/new')}
          className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-colors active:scale-[0.98] shadow-lg shadow-ix-green/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Work</span>
        </button>
      </div>

      {/* Main Search & Client Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
        {/* Universal Search Input */}
        <div className="relative md:col-span-7">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ix-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search work name, ID, client name, phone number, dev..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-ix-surface border border-ix-border text-sm text-ix-text placeholder:text-ix-text-muted focus:border-ix-green focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ix-text-muted hover:text-ix-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Client Selector Dropdown */}
        <div className="relative md:col-span-5">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full h-11 pl-9 pr-8 rounded-xl bg-ix-surface border border-ix-border text-sm text-ix-text focus:border-ix-green focus:outline-none transition-colors appearance-none font-medium"
          >
            <option value="">All Clients ({clientOptions.length})</option>
            {clientOptions.map((c) => (
              <option key={c.key} value={c.key}>
                {c.company ? `${c.company} (${c.name})` : c.name} — {c.count} {c.count === 1 ? 'work' : 'works'}
              </option>
            ))}
          </select>
          <Building2 className="w-4 h-4 text-ix-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {selectedClient && (
            <button
              onClick={() => setSelectedClient('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ix-text-muted hover:text-ix-text"
              title="Clear client filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Stage Filter Chips */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-1">
          {[
            { label: 'All Works', value: 'all' },
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Pending Payment', value: 'pending-payment' },
            { label: 'Development', value: 'development' },
            { label: 'Design', value: 'design' },
            { label: 'Completed', value: 'completed' },
            { label: 'New', value: 'new' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStageFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                stageFilter === f.value
                  ? 'bg-ix-green text-ix-bg font-semibold shadow-sm'
                  : 'bg-ix-surface border border-ix-border text-ix-text-secondary hover:text-ix-text hover:bg-ix-surface-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex-shrink-0 ${
            showAdvancedFilters || paymentFilter !== 'all' || selectedDeveloper || selectedSalesperson || sortBy !== 'updated'
              ? 'bg-ix-green-dim border-ix-green/30 text-ix-green'
              : 'bg-ix-surface border-ix-border text-ix-text-secondary hover:text-ix-text'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filter & Sort</span>
        </button>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilters && (
        <div className="p-4 rounded-2xl bg-ix-surface border border-ix-border space-y-3 animate-slide-down">
          <div className="flex items-center justify-between pb-2 border-b border-ix-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-ix-text-muted">
              Advanced Filters & Sorting
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-ix-danger hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Payment Status */}
            <div>
              <label className="block text-xs text-ix-text-muted mb-1">Payment Status</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-ix-bg border border-ix-border text-xs focus:border-ix-green focus:outline-none"
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">Pending Remaining Balance</option>
                <option value="paid">Fully Settled (Paid)</option>
                <option value="advance_only">Advance Only</option>
              </select>
            </div>

            {/* Developer Filter */}
            <div>
              <label className="block text-xs text-ix-text-muted mb-1">Developer</label>
              <select
                value={selectedDeveloper}
                onChange={(e) => setSelectedDeveloper(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-ix-bg border border-ix-border text-xs focus:border-ix-green focus:outline-none"
              >
                <option value="">All Developers ({developerOptions.length})</option>
                {developerOptions.map((dev) => (
                  <option key={dev} value={dev}>
                    {dev}
                  </option>
                ))}
              </select>
            </div>

            {/* Salesperson Filter */}
            <div>
              <label className="block text-xs text-ix-text-muted mb-1">Salesperson</label>
              <select
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-ix-bg border border-ix-border text-xs focus:border-ix-green focus:outline-none"
              >
                <option value="">All Salespersons ({salespersonOptions.length})</option>
                {salespersonOptions.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs text-ix-text-muted mb-1">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl bg-ix-bg border border-ix-border text-xs focus:border-ix-green focus:outline-none"
              >
                <option value="updated">Recently Updated</option>
                <option value="deadline">Earliest Deadline</option>
                <option value="budget">Highest Budget</option>
                <option value="pending">Highest Pending Balance</option>
                <option value="progress">Highest Progress</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5">
          <span className="text-ix-text-muted text-[11px]">Active Filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ix-surface border border-ix-border text-ix-text">
              Query: &ldquo;{searchQuery}&rdquo;
              <X className="w-3 h-3 cursor-pointer hover:text-ix-danger" onClick={() => setSearchQuery('')} />
            </span>
          )}
          {selectedClient && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ix-surface border border-ix-border text-ix-text">
              Client: {selectedClient}
              <X className="w-3 h-3 cursor-pointer hover:text-ix-danger" onClick={() => setSelectedClient('')} />
            </span>
          )}
          {stageFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ix-surface border border-ix-border text-ix-text">
              Stage: {stageFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-ix-danger" onClick={() => setStageFilter('all')} />
            </span>
          )}
          {paymentFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ix-surface border border-ix-border text-ix-text">
              Payment: {paymentFilter}
              <X className="w-3 h-3 cursor-pointer hover:text-ix-danger" onClick={() => setPaymentFilter('all')} />
            </span>
          )}
          {selectedDeveloper && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ix-surface border border-ix-border text-ix-text">
              Dev: {selectedDeveloper}
              <X className="w-3 h-3 cursor-pointer hover:text-ix-danger" onClick={() => setSelectedDeveloper('')} />
            </span>
          )}
          <button
            onClick={resetAllFilters}
            className="text-[11px] text-ix-green hover:underline ml-1 font-semibold"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Work Cards List */}
      <div className="space-y-2.5 stagger-children">
        {filtered.map((work) => (
          <div
            key={work.id}
            onClick={() => router.push(`/works/${work.id}`)}
            className="w-full rounded-2xl border border-ix-border bg-ix-surface p-4 text-left hover:bg-ix-surface-hover hover:border-ix-border-light transition-all group cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Header tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-ix-text-muted">{work.workId}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${stageColor(
                      work.currentStage
                    )}`}
                  >
                    {getStageLabel(work.currentStage)}
                  </span>
                  {work.projectPackage && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-ix-bg text-ix-text-secondary border border-ix-border">
                      {work.projectPackage}
                    </span>
                  )}
                </div>

                {/* Company & Project Title */}
                <h3 className="text-sm sm:text-base font-bold mt-1.5 truncate group-hover:text-ix-green transition-colors">
                  {work.companyName || work.clientName}
                </h3>
                <p className="text-xs text-ix-text-muted mt-0.5 truncate">{work.projectName}</p>

                {/* Client & Team Info */}
                <div className="flex items-center gap-x-4 gap-y-1.5 mt-2.5 flex-wrap text-xs text-ix-text-secondary">
                  <span className="flex items-center gap-1 truncate">
                    <User className="w-3.5 h-3.5 text-ix-text-muted" />
                    {work.clientName}
                  </span>
                  {work.clientPhone && (
                    <a
                      href={`tel:${work.clientPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-ix-text-muted hover:text-ix-green transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {work.clientPhone}
                    </a>
                  )}
                  <span className="text-ix-text-muted">
                    Lead: <span className="text-ix-text font-medium">{work.developerName}</span>
                  </span>
                  {work.expectedCompletionDate && (
                    <span className="flex items-center gap-1 text-ix-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {formatDate(work.expectedCompletionDate)}
                    </span>
                  )}
                </div>

                {/* Financial Summary Line (Owner / Admin) */}
                <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-ix-border/50 text-xs">
                  <span className="text-ix-text-muted">
                    Budget: <span className="font-semibold text-ix-text">{formatCurrency(work.totalBudget)}</span>
                  </span>
                  <span className="text-ix-text-muted">
                    Collected:{' '}
                    <span className="font-semibold text-ix-green">
                      {formatCurrency(work.advanceReceived + work.secondPayment + work.finalPayment)}
                    </span>
                  </span>
                  {work.remainingPayment > 0 ? (
                    <span className="font-bold text-amber-400">
                      Pending: {formatCurrency(work.remainingPayment)}
                    </span>
                  ) : (
                    <span className="font-semibold text-ix-green flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> Fully Paid
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Ring & Arrow */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="relative w-11 h-11">
                  <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#262626" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={work.currentStage === 'COMPLETED' ? '#00ff88' : '#4488ff'}
                      strokeWidth="3"
                      strokeDasharray={`${work.progress * 0.88} 88`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                    {work.progress}%
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-ix-border bg-ix-surface/50">
            <Search className="w-10 h-10 text-ix-text-muted mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold text-ix-text">No matching works found</p>
            <p className="text-xs text-ix-text-muted mt-1">Try adjusting your search terms or filters</p>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-ix-surface border border-ix-border text-xs font-semibold text-ix-green hover:bg-ix-surface-hover transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
