// ===========================
// DEMO DATA LAYER
// ===========================
// This provides a fully functional in-memory data store
// so the app works without Firebase connection.
// Replace with Firestore calls when Firebase is configured.

import type {
  Student, Work, Client, Payment, Alert, PointTransaction,
  PerformanceRecord, EvidenceRecord, StudentSkill, WorkUpdate,
  TimelineEvent, Salesperson, ProjectAssignment
} from '@/types';

// --- Students ---
export const demoStudents: Student[] = [
  {
    id: '1', studentId: 'STU-1001', fullName: 'Rahul Kumar', profilePhoto: '',
    phone: '+91 98765 43210', email: 'rahul@example.com', college: 'YIT',
    course: 'B.Tech CSE', yearSemester: '3rd Year', joiningDate: '2025-06-15',
    status: 'Active', primaryInterest: 'Web Development', currentPoints: 35,
    totalPositivePoints: 50, totalNegativePoints: 15, ongoingWorksCount: 2,
    completedWorksCount: 8, notes: '', createdAt: '2025-06-15', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
  {
    id: '2', studentId: 'STU-1002', fullName: 'Arjun Menon', profilePhoto: '',
    phone: '+91 98765 43211', email: 'arjun@example.com', college: 'CET',
    course: 'B.Tech IT', yearSemester: '4th Year', joiningDate: '2025-07-01',
    status: 'In Project', primaryInterest: 'Full Stack', currentPoints: 28,
    totalPositivePoints: 38, totalNegativePoints: 10, ongoingWorksCount: 1,
    completedWorksCount: 5, notes: '', createdAt: '2025-07-01', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
  {
    id: '3', studentId: 'STU-1003', fullName: 'Priya Sharma', profilePhoto: '',
    phone: '+91 98765 43212', email: 'priya@example.com', college: 'NIT',
    course: 'B.Tech CSE', yearSemester: '3rd Year', joiningDate: '2025-08-10',
    status: 'Active', primaryInterest: 'UI/UX Design', currentPoints: 42,
    totalPositivePoints: 47, totalNegativePoints: 5, ongoingWorksCount: 1,
    completedWorksCount: 6, notes: '', createdAt: '2025-08-10', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
  {
    id: '4', studentId: 'STU-1004', fullName: 'Aditya Nair', profilePhoto: '',
    phone: '+91 98765 43213', email: 'aditya@example.com', college: 'MEC',
    course: 'BCA', yearSemester: '2nd Year', joiningDate: '2026-01-15',
    status: 'In Training', primaryInterest: 'Frontend', currentPoints: 12,
    totalPositivePoints: 17, totalNegativePoints: 5, ongoingWorksCount: 0,
    completedWorksCount: 2, notes: 'Showing good progress in React', createdAt: '2026-01-15', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
  {
    id: '5', studentId: 'STU-1005', fullName: 'Deepak Raj', profilePhoto: '',
    phone: '+91 98765 43214', email: 'deepak@example.com', college: 'CUSAT',
    course: 'MCA', yearSemester: '1st Year', joiningDate: '2026-03-01',
    status: 'Active', primaryInterest: 'Backend', currentPoints: -8,
    totalPositivePoints: 12, totalNegativePoints: 20, ongoingWorksCount: 1,
    completedWorksCount: 3, notes: 'Needs improvement in communication', createdAt: '2026-03-01', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
  {
    id: '6', studentId: 'STU-1006', fullName: 'Sneha Pillai', profilePhoto: '',
    phone: '+91 98765 43215', email: 'sneha@example.com', college: 'RIT',
    course: 'B.Tech CSE', yearSemester: '4th Year', joiningDate: '2025-05-20',
    status: 'Active', primaryInterest: 'React Development', currentPoints: 55,
    totalPositivePoints: 60, totalNegativePoints: 5, ongoingWorksCount: 2,
    completedWorksCount: 12, notes: 'Top performer', createdAt: '2025-05-20', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
  {
    id: '7', studentId: 'STU-1007', fullName: 'Vishnu Das', profilePhoto: '',
    phone: '+91 98765 43216', email: 'vishnu@example.com', college: 'YIT',
    course: 'B.Tech ECE', yearSemester: '3rd Year', joiningDate: '2025-09-01',
    status: 'Active', primaryInterest: 'WordPress', currentPoints: 18,
    totalPositivePoints: 23, totalNegativePoints: 5, ongoingWorksCount: 1,
    completedWorksCount: 4, notes: '', createdAt: '2025-09-01', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
  {
    id: '8', studentId: 'STU-1008', fullName: 'Meera Jayakumar', profilePhoto: '',
    phone: '+91 98765 43217', email: 'meera@example.com', college: 'CET',
    course: 'B.Tech IT', yearSemester: '2nd Year', joiningDate: '2026-02-15',
    status: 'In Training', primaryInterest: 'Shopify', currentPoints: 8,
    totalPositivePoints: 8, totalNegativePoints: 0, ongoingWorksCount: 0,
    completedWorksCount: 1, notes: 'New joiner, enthusiastic', createdAt: '2026-02-15', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
  {
    id: '9', studentId: 'STU-1009', fullName: 'Anand Krishnan', profilePhoto: '',
    phone: '+91 98765 43218', email: 'anand@example.com', college: 'NIT',
    course: 'B.Tech CSE', yearSemester: '4th Year', joiningDate: '2025-04-10',
    status: 'Inactive', primaryInterest: 'Full Stack', currentPoints: -18,
    totalPositivePoints: 10, totalNegativePoints: 28, ongoingWorksCount: 0,
    completedWorksCount: 3, notes: 'In correction stage. Multiple missed deadlines.', createdAt: '2025-04-10', updatedAt: '2026-08-15', createdBy: 'Amal',
  },
  {
    id: '10', studentId: 'STU-1010', fullName: 'Kavya Mohan', profilePhoto: '',
    phone: '+91 98765 43219', email: 'kavya@example.com', college: 'MEC',
    course: 'B.Tech CSE', yearSemester: '3rd Year', joiningDate: '2025-11-01',
    status: 'Active', primaryInterest: 'React & Next.js', currentPoints: 30,
    totalPositivePoints: 35, totalNegativePoints: 5, ongoingWorksCount: 1,
    completedWorksCount: 7, notes: '', createdAt: '2025-11-01', updatedAt: '2026-09-01', createdBy: 'Amal',
  },
];

// --- Works ---
export const demoWorks: Work[] = [
  {
    id: '1', workId: 'W-2026-001', clientId: '1', clientName: 'Rajesh Kumar',
    clientPhone: '+91 99887 76655', clientEmail: 'rajesh@abcinteriors.com',
    companyName: 'ABC Interiors', projectName: 'ABC Interiors Website',
    startDate: '2026-08-01', expectedCompletionDate: '2026-09-28', actualCompletionDate: '',
    currentStage: 'DEVELOPMENT', progress: 65, projectPackage: 'Business Website',
    totalBudget: 24000, advanceReceived: 12000, secondPayment: 0, finalPayment: 0,
    remainingPayment: 12000, salespersonId: '1', salespersonName: 'Nikhil',
    developerId: '1', developerName: 'Rahul Kumar', developerPayment: 8500,
    designerId: '3', designerName: 'Priya Sharma', designerPayment: 3000,
    sameAsDeveloper: false, domainCost: 500, hostingCost: 0, otherExpenses: 0,
    estimatedProfit: 12000, actualProfit: 0, leadSource: 'Referral',
    quotedPrice: 28000, finalPrice: 24000, discount: 4000,
    salesDate: '2026-07-25', notes: '', createdAt: '2026-08-01', updatedAt: '2026-09-01', createdBy: 'Owner',
  },
  {
    id: '2', workId: 'W-2026-002', clientId: '2', clientName: 'Suresh Menon',
    clientPhone: '+91 99887 76656', clientEmail: 'suresh@xyzcafe.com',
    companyName: 'XYZ Cafe', projectName: 'XYZ Cafe Website',
    startDate: '2026-07-01', expectedCompletionDate: '2026-08-15', actualCompletionDate: '2026-08-18',
    currentStage: 'COMPLETED', progress: 100, projectPackage: 'Restaurant Website',
    totalBudget: 18000, advanceReceived: 9000, secondPayment: 4500, finalPayment: 4500,
    remainingPayment: 0, salespersonId: '1', salespersonName: 'Nikhil',
    developerId: '1', developerName: 'Rahul Kumar', developerPayment: 6000,
    designerId: '1', designerName: 'Rahul Kumar', designerPayment: 0,
    sameAsDeveloper: true, domainCost: 800, hostingCost: 2000, otherExpenses: 0,
    estimatedProfit: 9200, actualProfit: 9200, leadSource: 'Google',
    quotedPrice: 20000, finalPrice: 18000, discount: 2000,
    salesDate: '2026-06-20', notes: '', createdAt: '2026-07-01', updatedAt: '2026-08-18', createdBy: 'Owner',
  },
  {
    id: '3', workId: 'W-2026-003', clientId: '3', clientName: 'Anita George',
    clientPhone: '+91 99887 76657', clientEmail: 'anita@greenvalley.com',
    companyName: 'Green Valley Farms', projectName: 'Green Valley E-commerce',
    startDate: '2026-08-15', expectedCompletionDate: '2026-10-30', actualCompletionDate: '',
    currentStage: 'DESIGN', progress: 25, projectPackage: 'E-commerce Website',
    totalBudget: 45000, advanceReceived: 22500, secondPayment: 0, finalPayment: 0,
    remainingPayment: 22500, salespersonId: '2', salespersonName: 'Arun',
    developerId: '2', developerName: 'Arjun Menon', developerPayment: 15000,
    designerId: '3', designerName: 'Priya Sharma', designerPayment: 5000,
    sameAsDeveloper: false, domainCost: 1200, hostingCost: 3000, otherExpenses: 500,
    estimatedProfit: 20300, actualProfit: 0, leadSource: 'Social Media',
    quotedPrice: 50000, finalPrice: 45000, discount: 5000,
    salesDate: '2026-08-10', notes: 'High priority client', createdAt: '2026-08-15', updatedAt: '2026-09-01', createdBy: 'Owner',
  },
  {
    id: '4', workId: 'W-2026-004', clientId: '4', clientName: 'Mohammed Ali',
    clientPhone: '+91 99887 76658', clientEmail: 'ali@starconstruction.com',
    companyName: 'Star Construction', projectName: 'Star Construction Portfolio',
    startDate: '2026-09-01', expectedCompletionDate: '2026-10-15', actualCompletionDate: '',
    currentStage: 'REQUIREMENTS', progress: 10, projectPackage: 'Portfolio Website',
    totalBudget: 15000, advanceReceived: 7500, secondPayment: 0, finalPayment: 0,
    remainingPayment: 7500, salespersonId: '1', salespersonName: 'Nikhil',
    developerId: '6', developerName: 'Sneha Pillai', developerPayment: 5000,
    designerId: '6', designerName: 'Sneha Pillai', designerPayment: 0,
    sameAsDeveloper: true, domainCost: 500, hostingCost: 0, otherExpenses: 0,
    estimatedProfit: 9500, actualProfit: 0, leadSource: 'Referral',
    quotedPrice: 15000, finalPrice: 15000, discount: 0,
    salesDate: '2026-08-28', notes: '', createdAt: '2026-09-01', updatedAt: '2026-09-01', createdBy: 'Owner',
  },
  {
    id: '5', workId: 'W-2026-005', clientId: '5', clientName: 'Latha Krishnan',
    clientPhone: '+91 99887 76659', clientEmail: 'latha@blossomflowers.com',
    companyName: 'Blossom Flowers', projectName: 'Blossom Flowers Shopify',
    startDate: '2026-08-20', expectedCompletionDate: '2026-09-20', actualCompletionDate: '',
    currentStage: 'DEVELOPMENT_QC', progress: 80, projectPackage: 'Shopify Store',
    totalBudget: 20000, advanceReceived: 10000, secondPayment: 5000, finalPayment: 0,
    remainingPayment: 5000, salespersonId: '2', salespersonName: 'Arun',
    developerId: '7', developerName: 'Vishnu Das', developerPayment: 6000,
    designerId: '3', designerName: 'Priya Sharma', designerPayment: 3000,
    sameAsDeveloper: false, domainCost: 0, hostingCost: 0, otherExpenses: 200,
    estimatedProfit: 10800, actualProfit: 0, leadSource: 'Instagram',
    quotedPrice: 22000, finalPrice: 20000, discount: 2000,
    salesDate: '2026-08-15', notes: '', createdAt: '2026-08-20', updatedAt: '2026-09-01', createdBy: 'Owner',
  },
  {
    id: '6', workId: 'W-2026-006', clientId: '6', clientName: 'Vikram Singh',
    clientPhone: '+91 99887 76660', clientEmail: 'vikram@techsolutions.com',
    companyName: 'Tech Solutions', projectName: 'Tech Solutions SaaS Landing',
    startDate: '2026-07-15', expectedCompletionDate: '2026-08-30', actualCompletionDate: '2026-08-25',
    currentStage: 'COMPLETED', progress: 100, projectPackage: 'Landing Page',
    totalBudget: 12000, advanceReceived: 6000, secondPayment: 3000, finalPayment: 3000,
    remainingPayment: 0, salespersonId: '1', salespersonName: 'Nikhil',
    developerId: '10', developerName: 'Kavya Mohan', developerPayment: 4000,
    designerId: '10', designerName: 'Kavya Mohan', designerPayment: 0,
    sameAsDeveloper: true, domainCost: 500, hostingCost: 0, otherExpenses: 0,
    estimatedProfit: 7500, actualProfit: 7500, leadSource: 'LinkedIn',
    quotedPrice: 15000, finalPrice: 12000, discount: 3000,
    salesDate: '2026-07-10', notes: '', createdAt: '2026-07-15', updatedAt: '2026-08-25', createdBy: 'Owner',
  },
  {
    id: '7', workId: 'W-2026-007', clientId: '7', clientName: 'Pradeep Varma',
    clientPhone: '+91 99887 76661', clientEmail: 'pradeep@royalhomes.com',
    companyName: 'Royal Homes', projectName: 'Royal Homes Real Estate',
    startDate: '2026-08-10', expectedCompletionDate: '2026-10-10', actualCompletionDate: '',
    currentStage: 'CLIENT_APPROVAL', progress: 40, projectPackage: 'Business Website',
    totalBudget: 30000, advanceReceived: 15000, secondPayment: 0, finalPayment: 0,
    remainingPayment: 15000, salespersonId: '2', salespersonName: 'Arun',
    developerId: '6', developerName: 'Sneha Pillai', developerPayment: 10000,
    designerId: '3', designerName: 'Priya Sharma', designerPayment: 4000,
    sameAsDeveloper: false, domainCost: 800, hostingCost: 2000, otherExpenses: 200,
    estimatedProfit: 13000, actualProfit: 0, leadSource: 'Referral',
    quotedPrice: 35000, finalPrice: 30000, discount: 5000,
    salesDate: '2026-08-05', notes: '', createdAt: '2026-08-10', updatedAt: '2026-09-01', createdBy: 'Owner',
  },
  {
    id: '8', workId: 'W-2026-008', clientId: '8', clientName: 'Divya Rajan',
    clientPhone: '+91 99887 76662', clientEmail: 'divya@sparkacademy.com',
    companyName: 'Spark Academy', projectName: 'Spark Academy LMS',
    startDate: '2026-09-02', expectedCompletionDate: '2026-11-30', actualCompletionDate: '',
    currentStage: 'NEW', progress: 5, projectPackage: 'Custom Web App',
    totalBudget: 60000, advanceReceived: 30000, secondPayment: 0, finalPayment: 0,
    remainingPayment: 30000, salespersonId: '1', salespersonName: 'Nikhil',
    developerId: '1', developerName: 'Rahul Kumar', developerPayment: 20000,
    designerId: '3', designerName: 'Priya Sharma', designerPayment: 6000,
    sameAsDeveloper: false, domainCost: 1500, hostingCost: 5000, otherExpenses: 1000,
    estimatedProfit: 26500, actualProfit: 0, leadSource: 'Website',
    quotedPrice: 75000, finalPrice: 60000, discount: 15000,
    salesDate: '2026-08-28', notes: 'Complex project, LMS features', createdAt: '2026-09-02', updatedAt: '2026-09-02', createdBy: 'Owner',
  },
  {
    id: '9', workId: 'W-2026-009', clientId: '9', clientName: 'Samir Patel',
    clientPhone: '+91 99887 76663', clientEmail: 'samir@spiceworld.com',
    companyName: 'Spice World', projectName: 'Spice World Online Store',
    startDate: '2026-06-15', expectedCompletionDate: '2026-08-15', actualCompletionDate: '2026-08-12',
    currentStage: 'COMPLETED', progress: 100, projectPackage: 'E-commerce Website',
    totalBudget: 35000, advanceReceived: 17500, secondPayment: 8750, finalPayment: 8750,
    remainingPayment: 0, salespersonId: '2', salespersonName: 'Arun',
    developerId: '2', developerName: 'Arjun Menon', developerPayment: 12000,
    designerId: '6', designerName: 'Sneha Pillai', designerPayment: 4000,
    sameAsDeveloper: false, domainCost: 1000, hostingCost: 2500, otherExpenses: 300,
    estimatedProfit: 15200, actualProfit: 15200, leadSource: 'Google',
    quotedPrice: 40000, finalPrice: 35000, discount: 5000,
    salesDate: '2026-06-10', notes: '', createdAt: '2026-06-15', updatedAt: '2026-08-12', createdBy: 'Owner',
  },
  {
    id: '10', workId: 'W-2026-010', clientId: '10', clientName: 'Nisha Thomas',
    clientPhone: '+91 99887 76664', clientEmail: 'nisha@beautyglow.com',
    companyName: 'Beauty Glow', projectName: 'Beauty Glow Website',
    startDate: '2026-08-25', expectedCompletionDate: '2026-09-25', actualCompletionDate: '',
    currentStage: 'DESIGN_QC', progress: 35, projectPackage: 'Business Website',
    totalBudget: 16000, advanceReceived: 8000, secondPayment: 0, finalPayment: 0,
    remainingPayment: 8000, salespersonId: '1', salespersonName: 'Nikhil',
    developerId: '10', developerName: 'Kavya Mohan', developerPayment: 5500,
    designerId: '10', designerName: 'Kavya Mohan', designerPayment: 0,
    sameAsDeveloper: true, domainCost: 500, hostingCost: 0, otherExpenses: 0,
    estimatedProfit: 10000, actualProfit: 0, leadSource: 'Instagram',
    quotedPrice: 18000, finalPrice: 16000, discount: 2000,
    salesDate: '2026-08-20', notes: '', createdAt: '2026-08-25', updatedAt: '2026-09-01', createdBy: 'Owner',
  },
  {
    id: '11', workId: 'W-2026-011', clientId: '11', clientName: 'Ajay Menon',
    clientPhone: '+91 99887 76665', clientEmail: 'ajay@oceanlogs.com',
    companyName: 'Ocean Logistics', projectName: 'Ocean Logistics Website',
    startDate: '2026-08-05', expectedCompletionDate: '2026-09-15', actualCompletionDate: '',
    currentStage: 'DEPLOYMENT', progress: 90, projectPackage: 'Business Website',
    totalBudget: 22000, advanceReceived: 11000, secondPayment: 5500, finalPayment: 0,
    remainingPayment: 5500, salespersonId: '2', salespersonName: 'Arun',
    developerId: '5', developerName: 'Deepak Raj', developerPayment: 7000,
    designerId: '3', designerName: 'Priya Sharma', designerPayment: 3000,
    sameAsDeveloper: false, domainCost: 600, hostingCost: 1500, otherExpenses: 0,
    estimatedProfit: 9900, actualProfit: 0, leadSource: 'Referral',
    quotedPrice: 25000, finalPrice: 22000, discount: 3000,
    salesDate: '2026-07-30', notes: '', createdAt: '2026-08-05', updatedAt: '2026-09-01', createdBy: 'Owner',
  },
  {
    id: '12', workId: 'W-2026-012', clientId: '12', clientName: 'Rekha Nair',
    clientPhone: '+91 99887 76666', clientEmail: 'rekha@artcraft.com',
    companyName: 'ArtCraft Studio', projectName: 'ArtCraft Portfolio',
    startDate: '2026-07-20', expectedCompletionDate: '2026-08-30', actualCompletionDate: '2026-08-28',
    currentStage: 'COMPLETED', progress: 100, projectPackage: 'Portfolio Website',
    totalBudget: 10000, advanceReceived: 5000, secondPayment: 2500, finalPayment: 2500,
    remainingPayment: 0, salespersonId: '1', salespersonName: 'Nikhil',
    developerId: '4', developerName: 'Aditya Nair', developerPayment: 3000,
    designerId: '3', designerName: 'Priya Sharma', designerPayment: 2000,
    sameAsDeveloper: false, domainCost: 500, hostingCost: 0, otherExpenses: 0,
    estimatedProfit: 4500, actualProfit: 4500, leadSource: 'Google',
    quotedPrice: 12000, finalPrice: 10000, discount: 2000,
    salesDate: '2026-07-15', notes: '', createdAt: '2026-07-20', updatedAt: '2026-08-28', createdBy: 'Owner',
  },
];

// --- Clients ---
export const demoClients: Client[] = demoWorks
  .reduce<Client[]>((acc, w) => {
    if (!acc.find((c) => c.id === w.clientId)) {
      acc.push({
        id: w.clientId,
        clientId: `CLT-${String(acc.length + 1).padStart(3, '0')}`,
        name: w.clientName,
        company: w.companyName,
        phone: w.clientPhone,
        email: w.clientEmail,
        totalValue: demoWorks.filter((dw) => dw.clientId === w.clientId).reduce((s, dw) => s + dw.totalBudget, 0),
        pendingPayment: demoWorks.filter((dw) => dw.clientId === w.clientId).reduce((s, dw) => s + dw.remainingPayment, 0),
        projectCount: demoWorks.filter((dw) => dw.clientId === w.clientId).length,
        notes: '',
        createdAt: w.createdAt,
      });
    }
    return acc;
  }, []);

// --- Salespersons ---
export const demoSalespersons: Salesperson[] = [
  { id: '1', name: 'Nikhil', phone: '+91 98765 11111', email: 'nikhil@intellex.in', totalWorks: 7, totalRevenue: 175000, status: 'Active' },
  { id: '2', name: 'Arun', phone: '+91 98765 22222', email: 'arun@intellex.in', totalWorks: 5, totalRevenue: 152000, status: 'Active' },
];

// --- Alerts ---
export const demoAlerts: Alert[] = [
  { id: '1', alertId: 'ALT-001', workId: '1', studentId: '', title: 'Client payment pending', description: 'ABC Interiors remaining payment of 12,000 pending', priority: 'High', status: 'Active', createdBy: 'System', createdAt: '2026-09-01', completedAt: '' },
  { id: '2', alertId: 'ALT-002', workId: '5', studentId: '', title: 'QC pending', description: 'Blossom Flowers development QC needs review', priority: 'Medium', status: 'Active', createdBy: 'Amal', createdAt: '2026-09-01', completedAt: '' },
  { id: '3', alertId: 'ALT-003', workId: '', studentId: '9', title: 'Student in correction stage', description: 'Anand Krishnan at -18 points — correction/relegation', priority: 'Critical', status: 'Active', createdBy: 'System', createdAt: '2026-08-15', completedAt: '' },
  { id: '4', alertId: 'ALT-004', workId: '7', studentId: '', title: 'Awaiting client approval', description: 'Royal Homes design needs client sign-off', priority: 'Medium', status: 'Active', createdBy: 'Amal', createdAt: '2026-09-01', completedAt: '' },
  { id: '5', alertId: 'ALT-005', workId: '11', studentId: '', title: 'Final payment required', description: 'Ocean Logistics final payment of 5,500 before deployment', priority: 'High', status: 'Active', createdBy: 'System', createdAt: '2026-09-01', completedAt: '' },
];

// --- Point Transactions (for demo student Rahul - id: 1) ---
export const demoPointTransactions: Record<string, PointTransaction[]> = {
  '1': [
    { id: '1', date: '2026-09-02', amount: 5, type: 'positive', reason: 'Completed project before deadline', addedBy: 'Amal', relatedWorkId: '2', note: '' },
    { id: '2', date: '2026-08-28', amount: 5, type: 'positive', reason: 'Excellent client communication', addedBy: 'Amal', relatedWorkId: '1', note: 'Client specifically praised responsiveness' },
    { id: '3', date: '2026-08-20', amount: -5, type: 'negative', reason: 'Missed update', addedBy: 'Amal', relatedWorkId: '1', note: 'Did not update for 2 days' },
    { id: '4', date: '2026-08-15', amount: 5, type: 'positive', reason: 'High-quality work', addedBy: 'Amal', relatedWorkId: '2', note: '' },
    { id: '5', date: '2026-08-10', amount: 5, type: 'positive', reason: 'Independent problem solving', addedBy: 'Amal', relatedWorkId: '', note: 'Solved routing issue without help' },
    { id: '6', date: '2026-08-01', amount: 5, type: 'positive', reason: 'Helpful to teammate', addedBy: 'Amal', relatedWorkId: '', note: 'Helped Aditya with React concepts' },
    { id: '7', date: '2026-07-25', amount: -5, type: 'negative', reason: 'Poor communication', addedBy: 'Amal', relatedWorkId: '', note: '' },
    { id: '8', date: '2026-07-20', amount: 5, type: 'positive', reason: 'On-time delivery', addedBy: 'Amal', relatedWorkId: '2', note: '' },
    { id: '9', date: '2026-07-15', amount: -5, type: 'negative', reason: 'Avoidable mistake', addedBy: 'Amal', relatedWorkId: '2', note: 'Wrong domain pointed' },
    { id: '10', date: '2026-07-10', amount: 5, type: 'positive', reason: 'Good QC result', addedBy: 'Amal', relatedWorkId: '2', note: '' },
  ],
};

// --- Performance Records ---
export const demoPerformanceRecords: Record<string, PerformanceRecord> = {
  '1': {
    id: '1', technicalSkill: 8, problemSolving: 7, qualityOfWork: 8,
    communication: 8, clientInteraction: 7, teamwork: 9, responsibility: 8,
    research: 6, independence: 7, deadlineDiscipline: 7, requirementUnderstanding: 8,
    issueSolving: 7, workExplanation: 8, responseBehaviour: 8, professionalBehaviour: 9,
    notes: 'Handled client requirement clarification independently.', recordedBy: 'Amal', recordedAt: '2026-09-01',
  },
  '3': {
    id: '3', technicalSkill: 7, problemSolving: 8, qualityOfWork: 9,
    communication: 9, clientInteraction: 8, teamwork: 9, responsibility: 9,
    research: 7, independence: 8, deadlineDiscipline: 9, requirementUnderstanding: 9,
    issueSolving: 8, workExplanation: 9, responseBehaviour: 9, professionalBehaviour: 10,
    notes: 'Excellent design quality consistently.', recordedBy: 'Amal', recordedAt: '2026-09-01',
  },
  '6': {
    id: '6', technicalSkill: 9, problemSolving: 9, qualityOfWork: 9,
    communication: 8, clientInteraction: 8, teamwork: 8, responsibility: 9,
    research: 8, independence: 9, deadlineDiscipline: 9, requirementUnderstanding: 9,
    issueSolving: 9, workExplanation: 8, responseBehaviour: 9, professionalBehaviour: 9,
    notes: 'Top performer. Can handle complex projects independently.', recordedBy: 'Amal', recordedAt: '2026-09-01',
  },
};

// --- Student Skills ---
export const demoStudentSkills: Record<string, StudentSkill[]> = {
  '1': [
    { id: '1', skillName: 'HTML', level: 'Advanced', updatedBy: 'Amal', updatedAt: '2026-08-01', notes: '' },
    { id: '2', skillName: 'CSS', level: 'Advanced', updatedBy: 'Amal', updatedAt: '2026-08-01', notes: '' },
    { id: '3', skillName: 'JavaScript', level: 'Intermediate', updatedBy: 'Amal', updatedAt: '2026-08-01', notes: '' },
    { id: '4', skillName: 'React', level: 'Intermediate', updatedBy: 'Amal', updatedAt: '2026-08-15', notes: '' },
    { id: '5', skillName: 'Next.js', level: 'Developing', updatedBy: 'Amal', updatedAt: '2026-08-25', notes: 'Verified in W-2026-002' },
    { id: '6', skillName: 'Tailwind CSS', level: 'Advanced', updatedBy: 'Amal', updatedAt: '2026-08-01', notes: '' },
    { id: '7', skillName: 'Firebase', level: 'Beginner', updatedBy: 'Amal', updatedAt: '2026-08-01', notes: '' },
    { id: '8', skillName: 'Git', level: 'Intermediate', updatedBy: 'Amal', updatedAt: '2026-08-01', notes: '' },
    { id: '9', skillName: 'Responsive Design', level: 'Advanced', updatedBy: 'Amal', updatedAt: '2026-08-01', notes: '' },
  ],
};

// --- Evidence Records ---
export const demoEvidenceRecords: Record<string, EvidenceRecord[]> = {
  '1': [
    { id: '1', type: 'GitHub Contribution', date: '2026-08-25', projectId: '1', description: 'Built responsive hero section for ABC Interiors', evidenceLink: 'https://github.com/intellex/abc-interiors/pull/12', verifiedBy: 'Amal', verificationStatus: 'Verified', createdAt: '2026-08-25' },
    { id: '2', type: 'Client Call', date: '2026-08-20', projectId: '1', description: 'Handled requirement clarification call with ABC Interiors client', evidenceLink: '', verifiedBy: 'Amal', verificationStatus: 'Verified', createdAt: '2026-08-20' },
    { id: '3', type: 'Bug Fixing', date: '2026-08-18', projectId: '2', description: 'Fixed mobile navigation bug on XYZ Cafe website', evidenceLink: 'https://github.com/intellex/xyz-cafe/pull/8', verifiedBy: 'Amal', verificationStatus: 'Verified', createdAt: '2026-08-18' },
    { id: '4', type: 'Performance Optimization', date: '2026-08-15', projectId: '2', description: 'Achieved 95+ PageSpeed score for XYZ Cafe', evidenceLink: '', verifiedBy: '', verificationStatus: 'Pending', createdAt: '2026-08-15' },
  ],
};
