// Utility functions for the Intellex Management System

/**
 * Generate a unique Work ID in the format W-YYYY-NNN
 */
export function generateWorkId(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(3, '0');
  return `W-${year}-${padded}`;
}

/**
 * Generate a unique Student ID in the format STU-NNNN
 */
export function generateStudentId(sequenceNumber: number): string {
  return `STU-${String(sequenceNumber).padStart(4, '0')}`;
}

/**
 * Generate a payment ID
 */
export function generatePaymentId(sequenceNumber: number): string {
  return `PAY-${String(sequenceNumber).padStart(5, '0')}`;
}

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date to short form (02 Sep)
 */
export function formatDateShort(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(dateString);
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Classify a CSS class based on student points
 */
export function getPointsColor(points: number): string {
  if (points >= 30) return 'text-emerald-400';
  if (points >= 10) return 'text-green-400';
  if (points >= 0) return 'text-gray-400';
  if (points >= -15) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Get attention level based on points
 */
export function getAttentionLevel(
  points: number
): 'normal' | 'watch' | 'correction' | 'removal' {
  if (points >= 0) return 'normal';
  if (points > -15) return 'watch';
  if (points > -25) return 'correction';
  return 'removal';
}

/**
 * Deep clone an object removing specified fields
 */
export function stripFields<T extends Record<string, unknown>>(
  obj: T,
  fields: readonly string[]
): Partial<T> {
  const result = { ...obj };
  for (const field of fields) {
    delete result[field];
  }
  return result;
}

/**
 * Simple fuzzy match
 */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  return t.includes(q) || q.includes(t);
}

/**
 * Class name helper (like clsx)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
