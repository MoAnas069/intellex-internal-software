import type { UserRole } from '@/types';

// Fields that are hidden from the Student Manager
export const OWNER_ONLY_WORK_FIELDS = [
  'totalBudget',
  'advanceReceived',
  'secondPayment',
  'finalPayment',
  'remainingPayment',
  'developerPayment',
  'designerPayment',
  'domainCost',
  'hostingCost',
  'otherExpenses',
  'estimatedProfit',
  'actualProfit',
  'quotedPrice',
  'finalPrice',
  'discount',
] as const;

// Route access permissions
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/owner': ['owner'],
  '/owner/finance': ['owner'],
  '/payments': ['owner'],
  '/manager': ['student_manager'],
  '/students': ['owner', 'student_manager'],
  '/works': ['owner', 'student_manager'],
  '/clients': ['owner', 'student_manager'],
  '/alerts': ['owner', 'student_manager'],
  '/reports': ['owner', 'student_manager'],
  '/search': ['owner', 'student_manager'],
};

// Features available per role
export const ROLE_FEATURES: Record<UserRole, string[]> = {
  owner: [
    'view_all_dashboards',
    'student_crud',
    'view_student_profiles',
    'manage_points',
    'performance_records',
    'evidence_management',
    'create_works',
    'view_work_full',
    'view_payment_details',
    'view_project_budgets',
    'view_profit_revenue',
    'view_company_financials',
    'payment_management',
    'finance_module',
    'sales_analysis',
    'assign_work',
    'alerts_management',
    'audit_logs',
    'system_settings',
    'delete_archive',
  ],
  student_manager: [
    'student_crud',
    'view_student_profiles',
    'manage_points',
    'performance_records',
    'evidence_management',
    'create_works',
    'view_work_restricted',
    'assign_work',
    'alerts_management',
    'view_audit_logs',
  ],
};

export function hasPermission(role: UserRole, feature: string): boolean {
  return ROLE_FEATURES[role]?.includes(feature) ?? false;
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  // Find the matching route pattern
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((r) =>
    route.startsWith(r)
  );
  if (!matchedRoute) return true; // If no restriction defined, allow
  return ROUTE_PERMISSIONS[matchedRoute].includes(role);
}
