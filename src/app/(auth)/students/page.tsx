'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { demoStudents } from '@/lib/demo-data';
import { getPointsColor, getInitials } from '@/lib/utils';
import { Search, Filter, Plus, ChevronRight, SortAsc } from 'lucide-react';
import type { StudentStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'In Project', value: 'In Project' },
  { label: 'In Training', value: 'In Training' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Need Attention', value: 'attention' },
  { label: 'Working', value: 'working' },
];

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Points (High)', value: 'points-desc' },
  { label: 'Points (Low)', value: 'points-asc' },
  { label: 'Recent', value: 'recent' },
];

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialFilter = searchParams.get('filter') || 'all';
  const initialSort = searchParams.get('sort') || 'name';

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState(initialSort);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let students = [...demoStudents];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      students = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.college.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q)
      );
    }

    // Filter
    switch (filter) {
      case 'attention':
        students = students.filter((s) => s.currentPoints <= -15);
        break;
      case 'working':
        students = students.filter((s) => s.ongoingWorksCount > 0);
        break;
      case 'all':
        break;
      default:
        students = students.filter((s) => s.status === filter);
    }

    // Sort
    switch (sort) {
      case 'points-desc':
        students.sort((a, b) => b.currentPoints - a.currentPoints);
        break;
      case 'points-asc':
        students.sort((a, b) => a.currentPoints - b.currentPoints);
        break;
      case 'recent':
        students.sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime());
        break;
      default:
        students.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    return students;
  }, [searchQuery, filter, sort]);

  const statusColor = (status: StudentStatus) => {
    switch (status) {
      case 'Active': return 'text-ix-green bg-ix-green-dim border-ix-green/20';
      case 'In Project': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'In Training': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Inactive': case 'Removed': return 'text-ix-text-muted bg-ix-surface border-ix-border';
      case 'On Hold': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-ix-text-secondary bg-ix-surface border-ix-border';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Students</h1>
          <p className="text-sm text-ix-text-muted">{filtered.length} students</p>
        </div>
        <button
          onClick={() => router.push('/students/new')}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-ix-green text-ix-bg font-semibold text-sm hover:bg-ix-green-hover transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Student</span>
        </button>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ix-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-ix-surface border border-ix-border text-sm placeholder:text-ix-text-muted focus:border-ix-green focus:outline-none transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f.value
                  ? 'bg-ix-green text-ix-bg'
                  : 'bg-ix-surface border border-ix-border text-ix-text-secondary hover:text-ix-text hover:border-ix-border-light'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards */}
      <div className="space-y-2 stagger-children">
        {filtered.map((student) => (
          <button
            key={student.id}
            onClick={() => router.push(`/students/${student.id}`)}
            className="w-full rounded-2xl border border-ix-border bg-ix-surface p-4 text-left hover:bg-ix-surface-hover hover:border-ix-border-light transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                student.currentPoints <= -15
                  ? 'bg-ix-danger-dim text-ix-danger border border-ix-danger/20'
                  : 'bg-ix-green-dim text-ix-green border border-ix-green/20'
              }`}>
                {getInitials(student.fullName)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">{student.fullName}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${statusColor(student.status)}`}>
                    {student.status}
                  </span>
                </div>
                <p className="text-xs text-ix-text-muted mt-0.5">
                  {student.college} • {student.primaryInterest}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-xs font-bold ${getPointsColor(student.currentPoints)}`}>
                    {student.currentPoints >= 0 ? '+' : ''}{student.currentPoints} pts
                  </span>
                  <span className="text-[10px] text-ix-text-muted">
                    {student.ongoingWorksCount} ongoing
                  </span>
                  <span className="text-[10px] text-ix-text-muted">
                    {student.completedWorksCount} completed
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-ix-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ix-text-muted">No students found</p>
          </div>
        )}
      </div>
    </div>
  );
}
