'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Work, Payment, Student, Client, Alert, PointTransaction, EvidenceRecord } from '@/types';
import {
  demoWorks,
  demoStudents,
  demoClients,
  demoAlerts,
  demoPointTransactions,
  demoEvidenceRecords,
} from '@/lib/demo-data';
import {
  canUseFirestore,
  seedFirestoreIfEmpty,
  subscribeToCollection,
  recordPaymentInFirestore,
  generateInitialPayments,
  addWorkToFirestore,
  addStudentToFirestore,
  addAlertToFirestore,
  updateAlertInFirestore,
  addPointTransactionToFirestore,
  addEvidenceToFirestore,
  COLLECTIONS,
} from '@/lib/firestore-service';

interface DataContextType {
  works: Work[];
  payments: Payment[];
  students: Student[];
  clients: Client[];
  alerts: Alert[];
  pointTransactions: Record<string, PointTransaction[]>;
  evidenceRecords: Record<string, EvidenceRecord[]>;
  isLiveBackend: boolean;
  syncStatus: 'connected' | 'syncing' | 'offline';
  addPayment: (paymentData: {
    workId: string;
    amount: number;
    type: 'Advance' | 'Second Payment' | 'Final Payment' | 'Other';
    paymentMethod: string;
    note?: string;
    date?: string;
  }) => void;
  addWork: (workData: Partial<Work>) => Work;
  addStudent: (studentData: Partial<Student>) => Student;
  addAlert: (alertData: {
    title: string;
    description: string;
    priority: Alert['priority'];
    workId?: string;
    studentId?: string;
  }) => Alert;
  markAlertCompleted: (alertId: string) => void;
  addPointTransaction: (
    studentId: string,
    pt: {
      amount: number;
      type: 'positive' | 'negative';
      reason: string;
      relatedWorkId?: string;
      note?: string;
    }
  ) => void;
  addEvidence: (
    studentId: string,
    ev: {
      type: EvidenceRecord['type'];
      description: string;
      evidenceLink?: string;
      projectId?: string;
    }
  ) => void;
  getWorkById: (id: string) => Work | undefined;
  getPaymentsForWork: (workId: string) => Payment[];
}

const STORAGE_KEY_WORKS = 'intellex_works_data';
const STORAGE_KEY_PAYMENTS = 'intellex_payments_data';
const STORAGE_KEY_STUDENTS = 'intellex_students_data';
const STORAGE_KEY_ALERTS = 'intellex_alerts_data';
const STORAGE_KEY_POINTS = 'intellex_points_data';
const STORAGE_KEY_EVIDENCE = 'intellex_evidence_data';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [works, setWorks] = useState<Work[]>(demoWorks);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>(demoStudents);
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);
  const [pointTransactions, setPointTransactions] = useState<Record<string, PointTransaction[]>>(demoPointTransactions);
  const [evidenceRecords, setEvidenceRecords] = useState<Record<string, EvidenceRecord[]>>(demoEvidenceRecords);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('offline');
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  // Initialize from LocalStorage first for instant paint
  useEffect(() => {
    try {
      const savedWorks = localStorage.getItem(STORAGE_KEY_WORKS);
      const savedPayments = localStorage.getItem(STORAGE_KEY_PAYMENTS);
      const savedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
      const savedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
      const savedPoints = localStorage.getItem(STORAGE_KEY_POINTS);
      const savedEvidence = localStorage.getItem(STORAGE_KEY_EVIDENCE);

      if (savedWorks) setWorks(JSON.parse(savedWorks));
      if (savedStudents) setStudents(JSON.parse(savedStudents));
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
      if (savedPoints) setPointTransactions(JSON.parse(savedPoints));
      if (savedEvidence) setEvidenceRecords(JSON.parse(savedEvidence));

      if (savedPayments) {
        setPayments(JSON.parse(savedPayments));
      } else {
        const initial = generateInitialPayments(savedWorks ? JSON.parse(savedWorks) : demoWorks);
        setPayments(initial);
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save changes to localStorage as offline cache
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY_WORKS, JSON.stringify(works));
      localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
      localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(pointTransactions));
      localStorage.setItem(STORAGE_KEY_EVIDENCE, JSON.stringify(evidenceRecords));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }, [works, payments, students, alerts, pointTransactions, evidenceRecords, isInitialized]);

  // Connect to Firestore backend and set up real-time sync
  useEffect(() => {
    if (!canUseFirestore()) {
      setSyncStatus('offline');
      setIsLiveBackend(false);
      return;
    }

    let isSubscribed = true;
    setSyncStatus('syncing');

    async function initFirestore() {
      try {
        await seedFirestoreIfEmpty();
        if (!isSubscribed) return;
        setIsLiveBackend(true);
        setSyncStatus('connected');
      } catch (err) {
        console.warn('[DataContext] Firestore init fallback to local:', err);
        if (isSubscribed) {
          setSyncStatus('offline');
        }
      }
    }

    initFirestore();

    const unsubWorks = subscribeToCollection<Work>(COLLECTIONS.WORKS, (data) => {
      if (data && data.length > 0) setWorks(data);
    });

    const unsubPayments = subscribeToCollection<Payment>(COLLECTIONS.PAYMENTS, (data) => {
      if (data && data.length > 0) {
        setPayments(
          [...data].sort(
            (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
          )
        );
      }
    });

    const unsubStudents = subscribeToCollection<Student>(COLLECTIONS.STUDENTS, (data) => {
      if (data && data.length > 0) setStudents(data);
    });

    const unsubClients = subscribeToCollection<Client>(COLLECTIONS.CLIENTS, (data) => {
      if (data && data.length > 0) setClients(data);
    });

    const unsubAlerts = subscribeToCollection<Alert>(COLLECTIONS.ALERTS, (data) => {
      if (data && data.length > 0) setAlerts(data);
    });

    return () => {
      isSubscribed = false;
      unsubWorks?.();
      unsubPayments?.();
      unsubStudents?.();
      unsubClients?.();
      unsubAlerts?.();
    };
  }, []);

  // --- Add Work ---
  const addWork = useCallback(
    (workData: Partial<Work>): Work => {
      const id = String(Date.now());
      const workId = `WRK-2026-${String(works.length + 1).padStart(3, '0')}`;
      const totalBudget = Number(workData.totalBudget) || 0;
      const advanceReceived = Number(workData.advanceReceived) || 0;
      const remainingPayment = Math.max(0, totalBudget - advanceReceived);
      const developerPayment = Number(workData.developerPayment) || 0;
      const designerPayment = Number(workData.designerPayment) || 0;
      const domainCost = Number(workData.domainCost) || 0;
      const hostingCost = Number(workData.hostingCost) || 0;
      const otherExpenses = Number(workData.otherExpenses) || 0;
      const totalExpenses = developerPayment + designerPayment + domainCost + hostingCost + otherExpenses;
      const estimatedProfit = Math.max(0, totalBudget - totalExpenses);

      const newWork: Work = {
        id,
        workId,
        clientId: workData.clientId || `cli-${id}`,
        clientName: workData.clientName || 'Unnamed Client',
        clientPhone: workData.clientPhone || '',
        clientEmail: workData.clientEmail || '',
        companyName: workData.companyName || workData.clientName || '',
        projectName: workData.projectName || 'New Project',
        startDate: workData.startDate || new Date().toISOString().split('T')[0],
        expectedCompletionDate: workData.expectedCompletionDate || '',
        actualCompletionDate: '',
        currentStage: workData.currentStage || 'NEW',
        progress: workData.progress || 0,
        projectPackage: workData.projectPackage || 'Custom',
        totalBudget,
        advanceReceived,
        secondPayment: 0,
        finalPayment: 0,
        remainingPayment,
        salespersonId: workData.salespersonId || '',
        salespersonName: workData.salespersonName || 'Direct',
        developerId: workData.developerId || '',
        developerName: workData.developerName || '',
        developerPayment,
        designerId: workData.designerId || '',
        designerName: workData.designerName || '',
        designerPayment,
        sameAsDeveloper: Boolean(workData.sameAsDeveloper),
        domainCost,
        hostingCost,
        otherExpenses,
        estimatedProfit,
        actualProfit: 0,
        leadSource: workData.leadSource || 'Website',
        quotedPrice: totalBudget,
        finalPrice: totalBudget,
        discount: 0,
        salesDate: workData.startDate || new Date().toISOString().split('T')[0],
        notes: workData.notes || '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Owner',
      };

      setWorks((prev) => [newWork, ...prev]);

      // If an advance was provided, also record a payment
      if (advanceReceived > 0) {
        const newPayment: Payment = {
          id: `pay-adv-${id}`,
          paymentId: `PAY-${workId}-01`,
          workId: id,
          clientName: newWork.clientName,
          amount: advanceReceived,
          type: 'Advance',
          date: newWork.startDate,
          status: 'Received',
          paymentMethod: 'Bank Transfer',
          note: 'Initial advance payment',
          createdBy: 'Owner',
          createdAt: new Date().toISOString(),
        };
        setPayments((prev) => [newPayment, ...prev]);
        if (canUseFirestore()) {
          recordPaymentInFirestore({
            workId: id,
            amount: advanceReceived,
            type: 'Advance',
            paymentMethod: 'Bank Transfer',
            note: 'Initial advance payment',
            date: newWork.startDate,
            targetWork: newWork,
          }).catch((err) => console.error('[DataContext] Error saving advance:', err));
        }
      }

      if (canUseFirestore()) {
        addWorkToFirestore(newWork).catch((err) => console.error('[DataContext] Error saving work:', err));
      }

      return newWork;
    },
    [works.length]
  );

  // --- Add Student ---
  const addStudent = useCallback(
    (studentData: Partial<Student>): Student => {
      const id = String(Date.now());
      const studentId = `STU-${String(students.length + 1001)}`;

      const newStudent: Student = {
        id,
        studentId,
        fullName: studentData.fullName || 'New Student',
        profilePhoto: studentData.profilePhoto || '',
        phone: studentData.phone || '',
        email: studentData.email || '',
        college: studentData.college || '',
        course: studentData.course || '',
        yearSemester: studentData.yearSemester || '',
        joiningDate: studentData.joiningDate || new Date().toISOString().split('T')[0],
        status: studentData.status || 'In Training',
        primaryInterest: studentData.primaryInterest || 'Web Development',
        currentPoints: 0,
        totalPositivePoints: 0,
        totalNegativePoints: 0,
        ongoingWorksCount: 0,
        completedWorksCount: 0,
        notes: studentData.notes || '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Amal',
      };

      setStudents((prev) => [newStudent, ...prev]);

      if (canUseFirestore()) {
        addStudentToFirestore(newStudent).catch((err) => console.error('[DataContext] Error saving student:', err));
      }

      return newStudent;
    },
    [students.length]
  );

  // --- Add Alert ---
  const addAlert = useCallback(
    (alertData: {
      title: string;
      description: string;
      priority: Alert['priority'];
      workId?: string;
      studentId?: string;
    }): Alert => {
      const id = String(Date.now());
      const alertId = `ALT-${String(alerts.length + 1).padStart(3, '0')}`;

      const newAlert: Alert = {
        id,
        alertId,
        workId: alertData.workId || '',
        studentId: alertData.studentId || '',
        title: alertData.title,
        description: alertData.description,
        priority: alertData.priority,
        status: 'Active',
        createdBy: 'User',
        createdAt: new Date().toISOString().split('T')[0],
        completedAt: '',
      };

      setAlerts((prev) => [newAlert, ...prev]);

      if (canUseFirestore()) {
        addAlertToFirestore(newAlert).catch((err) => console.error('[DataContext] Error saving alert:', err));
      }

      return newAlert;
    },
    [alerts.length]
  );

  // --- Mark Alert Completed ---
  const markAlertCompleted = useCallback((alertId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Completed', completedAt: today } : a))
    );

    if (canUseFirestore()) {
      updateAlertInFirestore(alertId, { status: 'Completed', completedAt: today }).catch((err) =>
        console.error('[DataContext] Error updating alert:', err)
      );
    }
  }, []);

  // --- Add Point Transaction ---
  const addPointTransaction = useCallback(
    (
      studentId: string,
      pt: {
        amount: number;
        type: 'positive' | 'negative';
        reason: string;
        relatedWorkId?: string;
        note?: string;
      }
    ) => {
      const newTransaction: PointTransaction = {
        id: String(Date.now()),
        date: new Date().toISOString().split('T')[0],
        amount: pt.type === 'negative' ? -Math.abs(pt.amount) : Math.abs(pt.amount),
        type: pt.type,
        reason: pt.reason,
        addedBy: 'Amal',
        relatedWorkId: pt.relatedWorkId || '',
        note: pt.note || '',
      };

      setPointTransactions((prev) => {
        const studentTransactions = prev[studentId] || [];
        return {
          ...prev,
          [studentId]: [newTransaction, ...studentTransactions],
        };
      });

      // Update student points in state
      let updatedPointsObj = { currentPoints: 0, totalPositivePoints: 0, totalNegativePoints: 0 };
      setStudents((prev) =>
        prev.map((student) => {
          if (student.id !== studentId) return student;

          const change = newTransaction.amount;
          const currentPoints = student.currentPoints + change;
          const totalPositivePoints =
            pt.type === 'positive' ? student.totalPositivePoints + pt.amount : student.totalPositivePoints;
          const totalNegativePoints =
            pt.type === 'negative' ? student.totalNegativePoints + Math.abs(pt.amount) : student.totalNegativePoints;

          updatedPointsObj = { currentPoints, totalPositivePoints, totalNegativePoints };

          return {
            ...student,
            currentPoints,
            totalPositivePoints,
            totalNegativePoints,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        })
      );

      if (canUseFirestore()) {
        addPointTransactionToFirestore(studentId, newTransaction, updatedPointsObj).catch((err) =>
          console.error('[DataContext] Error saving point transaction:', err)
        );
      }
    },
    []
  );

  // --- Add Evidence ---
  const addEvidence = useCallback(
    (
      studentId: string,
      ev: {
        type: EvidenceRecord['type'];
        description: string;
        evidenceLink?: string;
        projectId?: string;
      }
    ) => {
      const newEvidence: EvidenceRecord = {
        id: String(Date.now()),
        type: ev.type,
        date: new Date().toISOString().split('T')[0],
        projectId: ev.projectId || '',
        description: ev.description,
        evidenceLink: ev.evidenceLink || '',
        verifiedBy: 'Amal',
        verificationStatus: 'Verified',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setEvidenceRecords((prev) => {
        const existing = prev[studentId] || [];
        return {
          ...prev,
          [studentId]: [newEvidence, ...existing],
        };
      });

      if (canUseFirestore()) {
        addEvidenceToFirestore(studentId, newEvidence).catch((err) =>
          console.error('[DataContext] Error saving evidence:', err)
        );
      }
    },
    []
  );

  // --- Add Payment ---
  const addPayment = useCallback(
    (paymentData: {
      workId: string;
      amount: number;
      type: 'Advance' | 'Second Payment' | 'Final Payment' | 'Other';
      paymentMethod: string;
      note?: string;
      date?: string;
    }) => {
      const today = paymentData.date || new Date().toISOString().split('T')[0];
      const targetWork = works.find((w) => w.id === paymentData.workId);
      const targetClient = targetWork ? clients.find((c) => c.id === targetWork.clientId) : undefined;

      setWorks((prevWorks) => {
        return prevWorks.map((work) => {
          if (work.id !== paymentData.workId) return work;

          let advanceReceived = work.advanceReceived;
          let secondPayment = work.secondPayment;
          let finalPayment = work.finalPayment;

          if (paymentData.type === 'Advance') {
            advanceReceived += paymentData.amount;
          } else if (paymentData.type === 'Second Payment') {
            secondPayment += paymentData.amount;
          } else if (paymentData.type === 'Final Payment') {
            finalPayment += paymentData.amount;
          } else {
            if (advanceReceived === 0) {
              advanceReceived += paymentData.amount;
            } else if (secondPayment === 0) {
              secondPayment += paymentData.amount;
            } else {
              finalPayment += paymentData.amount;
            }
          }

          const totalCollected = advanceReceived + secondPayment + finalPayment;
          const remainingPayment = Math.max(0, work.totalBudget - totalCollected);
          const totalExpenses =
            work.developerPayment + work.designerPayment + work.domainCost + work.hostingCost + work.otherExpenses;
          const actualProfit =
            work.currentStage === 'COMPLETED' ? Math.max(0, totalCollected - totalExpenses) : work.actualProfit;

          return {
            ...work,
            advanceReceived,
            secondPayment,
            finalPayment,
            remainingPayment,
            actualProfit,
            updatedAt: today,
          };
        });
      });

      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentId: `PAY-${targetWork?.workId || 'WORK'}-${Date.now().toString().slice(-4)}`,
        workId: paymentData.workId,
        clientName: targetWork?.clientName || 'Client',
        amount: paymentData.amount,
        type: paymentData.type,
        date: today,
        status: 'Received',
        paymentMethod: paymentData.paymentMethod || 'UPI',
        note: paymentData.note || `${paymentData.type} payment recorded`,
        createdBy: 'Owner',
        createdAt: new Date().toISOString(),
      };

      setPayments((prev) => [newPayment, ...prev]);

      if (targetWork) {
        setClients((prevClients) =>
          prevClients.map((client) => {
            if (client.id !== targetWork.clientId) return client;
            return {
              ...client,
              pendingPayment: Math.max(0, client.pendingPayment - paymentData.amount),
            };
          })
        );
      }

      if (canUseFirestore()) {
        recordPaymentInFirestore({
          ...paymentData,
          targetWork,
          targetClient,
        }).catch((err) => {
          console.error('[DataContext] Failed to save payment to Firestore:', err);
        });
      }
    },
    [works, clients]
  );

  const getWorkById = useCallback((id: string) => works.find((w) => w.id === id), [works]);
  const getPaymentsForWork = useCallback((workId: string) => payments.filter((p) => p.workId === workId), [payments]);

  return (
    <DataContext.Provider
      value={{
        works,
        payments,
        students,
        clients,
        alerts,
        pointTransactions,
        evidenceRecords,
        isLiveBackend,
        syncStatus,
        addPayment,
        addWork,
        addStudent,
        addAlert,
        markAlertCompleted,
        addPointTransaction,
        addEvidence,
        getWorkById,
        getPaymentsForWork,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
