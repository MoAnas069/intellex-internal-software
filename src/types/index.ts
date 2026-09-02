// ===========================
// INTELLEX MANAGEMENT SYSTEM
// Type Definitions
// ===========================

// --- Enums ---

export type UserRole = 'owner' | 'student_manager';

export type StudentStatus =
  | 'Active'
  | 'On Hold'
  | 'In Training'
  | 'In Project'
  | 'Inactive'
  | 'Removed'
  | 'Completed Program'
  | 'Applicant'
  | 'Selected';

export type SkillLevel =
  | 'Beginner'
  | 'Developing'
  | 'Intermediate'
  | 'Advanced'
  | 'Verified';

export type WorkStage =
  | 'NEW'
  | 'REQUIREMENTS'
  | 'DESIGN'
  | 'DESIGN_QC'
  | 'CLIENT_APPROVAL'
  | 'DEVELOPMENT'
  | 'DEVELOPMENT_QC'
  | 'FINAL_PAYMENT'
  | 'DEPLOYMENT'
  | 'ONE_MONTH_SUPPORT'
  | 'COMPLETED';

export type PaymentType =
  | 'Advance'
  | 'Second Payment'
  | 'Final Payment'
  | 'Developer Payment'
  | 'Designer Payment'
  | 'Domain'
  | 'Hosting'
  | 'Other';

export type PaymentStatus = 'Pending' | 'Received' | 'Paid' | 'Cancelled';

export type AlertPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertStatus = 'Active' | 'Completed';

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export type AssignmentStatus = 'Active' | 'Completed' | 'Reassigned';

export type PointType = 'positive' | 'negative';

export type EvidenceType =
  | 'GitHub Contribution'
  | 'PR Review'
  | 'Code Review'
  | 'Client Call'
  | 'Client Demo'
  | 'Requirement Clarification'
  | 'Bug Fixing'
  | 'Performance Optimization'
  | 'PageSpeed Result'
  | 'Team Contribution'
  | 'Peer Mentoring'
  | 'Research Contribution'
  | 'Independent Problem Solving'
  | 'Project Ownership'
  | 'Client Feedback';

// --- Entities ---

export interface User {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  createdAt: string;
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  profilePhoto: string;
  phone: string;
  email: string;
  college: string;
  course: string;
  yearSemester: string;
  joiningDate: string;
  status: StudentStatus;
  primaryInterest: string;
  currentPoints: number;
  totalPositivePoints: number;
  totalNegativePoints: number;
  ongoingWorksCount: number;
  completedWorksCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface StudentSkill {
  id: string;
  skillName: string;
  level: SkillLevel;
  updatedBy: string;
  updatedAt: string;
  notes: string;
}

export interface Client {
  id: string;
  clientId: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  totalValue: number;
  pendingPayment: number;
  projectCount: number;
  notes: string;
  createdAt: string;
}

export interface Work {
  id: string;
  workId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  companyName: string;
  projectName: string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate: string;
  currentStage: WorkStage;
  progress: number;
  projectPackage: string;
  // Financial fields — Owner only
  totalBudget: number;
  advanceReceived: number;
  secondPayment: number;
  finalPayment: number;
  remainingPayment: number;
  salespersonId: string;
  salespersonName: string;
  developerId: string;
  developerName: string;
  developerPayment: number;
  designerId: string;
  designerName: string;
  designerPayment: number;
  sameAsDeveloper: boolean;
  domainCost: number;
  hostingCost: number;
  otherExpenses: number;
  estimatedProfit: number;
  actualProfit: number;
  leadSource: string;
  quotedPrice: number;
  finalPrice: number;
  discount: number;
  salesDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Work without financial data — for Student Manager
export interface WorkRestricted {
  id: string;
  workId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  companyName: string;
  projectName: string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate: string;
  currentStage: WorkStage;
  progress: number;
  projectPackage: string;
  salespersonName: string;
  developerId: string;
  developerName: string;
  designerId: string;
  designerName: string;
  sameAsDeveloper: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentId: string;
  workId: string;
  clientName: string;
  amount: number;
  type: PaymentType;
  date: string;
  status: PaymentStatus;
  paymentMethod: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  date: string;
  amount: number;
  type: PointType;
  reason: string;
  addedBy: string;
  relatedWorkId: string;
  note: string;
}

export interface PerformanceRecord {
  id: string;
  technicalSkill: number;
  problemSolving: number;
  qualityOfWork: number;
  communication: number;
  clientInteraction: number;
  teamwork: number;
  responsibility: number;
  research: number;
  independence: number;
  deadlineDiscipline: number;
  requirementUnderstanding: number;
  issueSolving: number;
  workExplanation: number;
  responseBehaviour: number;
  professionalBehaviour: number;
  notes: string;
  recordedBy: string;
  recordedAt: string;
}

export interface EvidenceRecord {
  id: string;
  type: EvidenceType;
  date: string;
  projectId: string;
  description: string;
  evidenceLink: string;
  verifiedBy: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface ProjectAssignment {
  id: string;
  workId: string;
  studentId: string;
  studentName: string;
  role: 'Developer' | 'Designer';
  assignedDate: string;
  status: AssignmentStatus;
  completionDate: string;
  previousAssigneeId: string;
  previousAssigneeName: string;
  reassignmentReason: string;
  handoverStatus: string;
  notes: string;
}

export interface Alert {
  id: string;
  alertId: string;
  workId: string;
  studentId: string;
  title: string;
  description: string;
  priority: AlertPriority;
  status: AlertStatus;
  createdBy: string;
  createdAt: string;
  completedAt: string;
}

export interface WorkUpdate {
  id: string;
  description: string;
  currentStage: WorkStage;
  issue: string;
  nextStep: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  entityType: 'student' | 'work';
  entityId: string;
  eventType: string;
  description: string;
  date: string;
  metadata: Record<string, string>;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, { old: string; new: string }>;
  performedBy: string;
  performedAt: string;
  details: string;
}

export interface Salesperson {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalWorks: number;
  totalRevenue: number;
  status: 'Active' | 'Inactive';
}

// --- Dashboard Stats ---

export interface OwnerDashboardStats {
  ongoingWorks: number;
  completedWorks: number;
  pendingPayments: number;
  thisMonthRevenue: number;
  estimatedProfit: number;
  activeStudents: number;
  studentsRequiringAttention: number;
  totalClients: number;
  recentAlerts: Alert[];
}

export interface ManagerDashboardStats {
  activeStudents: number;
  studentsWorking: number;
  studentsInTraining: number;
  studentsNeedingAttention: number;
  ongoingProjects: number;
  recentlyCompletedProjects: number;
  recentPointChanges: PointTransaction[];
  recentAlerts: Alert[];
}

// --- Search ---

export interface SearchResult {
  type: 'student' | 'work' | 'client' | 'payment' | 'alert';
  id: string;
  title: string;
  subtitle: string;
  metadata: Record<string, string>;
}

export interface CommandSuggestion {
  label: string;
  command: string;
  icon: string;
  action: 'navigate' | 'create' | 'filter';
  route?: string;
}
