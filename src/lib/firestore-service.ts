import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Work, Payment, Student, Client, Alert } from '@/types';
import { demoWorks, demoStudents, demoClients, demoAlerts } from './demo-data';

export const COLLECTIONS = {
  WORKS: 'works',
  PAYMENTS: 'payments',
  STUDENTS: 'students',
  CLIENTS: 'clients',
  ALERTS: 'alerts',
} as const;

// Helper to check if Firestore is accessible
export function canUseFirestore(): boolean {
  return Boolean(isFirebaseConfigured && db);
}

// Generate initial payments list from existing works
export function generateInitialPayments(worksList: Work[]): Payment[] {
  const payments: Payment[] = [];
  worksList.forEach((w) => {
    if (w.advanceReceived > 0) {
      payments.push({
        id: `pay-adv-${w.id}`,
        paymentId: `PAY-${w.workId}-01`,
        workId: w.id,
        clientName: w.clientName,
        amount: w.advanceReceived,
        type: 'Advance',
        date: w.startDate,
        status: 'Received',
        paymentMethod: 'Bank Transfer',
        note: 'Advance payment recorded',
        createdBy: 'Owner',
        createdAt: w.createdAt,
      });
    }
    if (w.secondPayment > 0) {
      payments.push({
        id: `pay-sec-${w.id}`,
        paymentId: `PAY-${w.workId}-02`,
        workId: w.id,
        clientName: w.clientName,
        amount: w.secondPayment,
        type: 'Second Payment',
        date: w.updatedAt || w.startDate,
        status: 'Received',
        paymentMethod: 'UPI',
        note: 'Second stage payment',
        createdBy: 'Owner',
        createdAt: w.updatedAt || w.createdAt,
      });
    }
    if (w.finalPayment > 0) {
      payments.push({
        id: `pay-fin-${w.id}`,
        paymentId: `PAY-${w.workId}-03`,
        workId: w.id,
        clientName: w.clientName,
        amount: w.finalPayment,
        type: 'Final Payment',
        date: w.actualCompletionDate || w.updatedAt || w.startDate,
        status: 'Received',
        paymentMethod: 'Bank Transfer',
        note: 'Final settlement',
        createdBy: 'Owner',
        createdAt: w.actualCompletionDate || w.createdAt,
      });
    }
  });
  return payments;
}

/**
 * Seed Firestore with initial demo data if the 'works' collection is empty
 */
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  if (!canUseFirestore() || !db) return false;

  try {
    const worksSnapshot = await getDocs(collection(db, COLLECTIONS.WORKS));
    if (!worksSnapshot.empty) {
      return false; // Already seeded
    }

    console.log('[Firestore] Empty database detected. Seeding initial CRM data...');
    const batch = writeBatch(db);

    // Seed works
    demoWorks.forEach((work) => {
      const ref = doc(db!, COLLECTIONS.WORKS, work.id);
      batch.set(ref, work);
    });

    // Seed clients
    demoClients.forEach((client) => {
      const ref = doc(db!, COLLECTIONS.CLIENTS, client.id);
      batch.set(ref, client);
    });

    // Seed students
    demoStudents.forEach((student) => {
      const ref = doc(db!, COLLECTIONS.STUDENTS, student.id);
      batch.set(ref, student);
    });

    // Seed alerts
    demoAlerts.forEach((alert) => {
      const ref = doc(db!, COLLECTIONS.ALERTS, alert.id);
      batch.set(ref, alert);
    });

    // Seed payments
    const initialPayments = generateInitialPayments(demoWorks);
    initialPayments.forEach((payment) => {
      const ref = doc(db!, COLLECTIONS.PAYMENTS, payment.id);
      batch.set(ref, payment);
    });

    await batch.commit();
    console.log('[Firestore] CRM initial data successfully seeded to Firebase!');
    return true;
  } catch (error) {
    console.error('[Firestore] Error seeding database:', error);
    return false;
  }
}

/**
 * Real-time subscription to a collection
 */
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe | null {
  if (!canUseFirestore() || !db) return null;

  try {
    const q = query(collection(db, collectionName));
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as unknown as T[];
        onData(items);
      },
      (err) => {
        console.warn(`[Firestore] Listener error on ${collectionName}:`, err);
        onError?.(err);
      }
    );
  } catch (err) {
    console.warn(`[Firestore] Failed to subscribe to ${collectionName}:`, err);
    return null;
  }
}

/**
 * Record a payment in Firestore and update the associated work & client balances
 */
export async function recordPaymentInFirestore(paymentData: {
  workId: string;
  amount: number;
  type: 'Advance' | 'Second Payment' | 'Final Payment' | 'Other';
  paymentMethod: string;
  note?: string;
  date?: string;
  targetWork?: Work;
  targetClient?: Client;
}): Promise<Payment | null> {
  if (!canUseFirestore() || !db) return null;

  try {
    const today = paymentData.date || new Date().toISOString().split('T')[0];
    const newPaymentId = `pay-${Date.now()}`;
    const paymentRecord: Payment = {
      id: newPaymentId,
      paymentId: `PAY-${paymentData.targetWork?.workId || 'WORK'}-${Date.now().toString().slice(-4)}`,
      workId: paymentData.workId,
      clientName: paymentData.targetWork?.clientName || 'Client',
      amount: paymentData.amount,
      type: paymentData.type,
      date: today,
      status: 'Received',
      paymentMethod: paymentData.paymentMethod || 'UPI',
      note: paymentData.note || `${paymentData.type} payment recorded`,
      createdBy: 'Owner',
      createdAt: new Date().toISOString(),
    };

    const batch = writeBatch(db);

    // Save payment
    const paymentRef = doc(db, COLLECTIONS.PAYMENTS, newPaymentId);
    batch.set(paymentRef, paymentRecord);

    // Update work
    if (paymentData.targetWork) {
      let advanceReceived = paymentData.targetWork.advanceReceived;
      let secondPayment = paymentData.targetWork.secondPayment;
      let finalPayment = paymentData.targetWork.finalPayment;

      if (paymentData.type === 'Advance') {
        advanceReceived += paymentData.amount;
      } else if (paymentData.type === 'Second Payment') {
        secondPayment += paymentData.amount;
      } else if (paymentData.type === 'Final Payment') {
        finalPayment += paymentData.amount;
      } else {
        if (advanceReceived === 0) advanceReceived += paymentData.amount;
        else if (secondPayment === 0) secondPayment += paymentData.amount;
        else finalPayment += paymentData.amount;
      }

      const totalCollected = advanceReceived + secondPayment + finalPayment;
      const remainingPayment = Math.max(0, paymentData.targetWork.totalBudget - totalCollected);
      const totalExpenses =
        paymentData.targetWork.developerPayment +
        paymentData.targetWork.designerPayment +
        paymentData.targetWork.domainCost +
        paymentData.targetWork.hostingCost +
        paymentData.targetWork.otherExpenses;
      const actualProfit =
        paymentData.targetWork.currentStage === 'COMPLETED'
          ? Math.max(0, totalCollected - totalExpenses)
          : paymentData.targetWork.actualProfit;

      const workRef = doc(db, COLLECTIONS.WORKS, paymentData.workId);
      batch.update(workRef, {
        advanceReceived,
        secondPayment,
        finalPayment,
        remainingPayment,
        actualProfit,
        updatedAt: today,
      });
    }

    // Update client pending payment
    if (paymentData.targetClient) {
      const clientRef = doc(db, COLLECTIONS.CLIENTS, paymentData.targetClient.id);
      batch.update(clientRef, {
        pendingPayment: Math.max(0, paymentData.targetClient.pendingPayment - paymentData.amount),
      });
    }

    await batch.commit();
    return paymentRecord;
  } catch (error) {
    console.error('[Firestore] Error recording payment in Firestore:', error);
    return null;
  }
}

/**
 * Update a work document in Firestore
 */
export async function updateWorkInFirestore(workId: string, updates: Partial<Work>): Promise<boolean> {
  if (!canUseFirestore() || !db) return false;

  try {
    const workRef = doc(db, COLLECTIONS.WORKS, workId);
    await updateDoc(workRef, updates);
    return true;
  } catch (error) {
    console.error('[Firestore] Error updating work:', error);
    return false;
  }
}

/**
 * Add a new work document in Firestore
 */
export async function addWorkToFirestore(work: Work): Promise<boolean> {
  if (!canUseFirestore() || !db) return false;

  try {
    const workRef = doc(db, COLLECTIONS.WORKS, work.id);
    await setDoc(workRef, work);
    return true;
  } catch (error) {
    console.error('[Firestore] Error adding work:', error);
    return false;
  }
}

/**
 * Add a new student document in Firestore
 */
export async function addStudentToFirestore(student: Student): Promise<boolean> {
  if (!canUseFirestore() || !db) return false;

  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, student.id);
    await setDoc(studentRef, student);
    return true;
  } catch (error) {
    console.error('[Firestore] Error adding student:', error);
    return false;
  }
}

/**
 * Add a new alert in Firestore
 */
export async function addAlertToFirestore(alert: Alert): Promise<boolean> {
  if (!canUseFirestore() || !db) return false;

  try {
    const alertRef = doc(db, COLLECTIONS.ALERTS, alert.id);
    await setDoc(alertRef, alert);
    return true;
  } catch (error) {
    console.error('[Firestore] Error adding alert:', error);
    return false;
  }
}

/**
 * Mark an alert as completed in Firestore
 */
export async function updateAlertInFirestore(alertId: string, updates: Partial<Alert>): Promise<boolean> {
  if (!canUseFirestore() || !db) return false;

  try {
    const alertRef = doc(db, COLLECTIONS.ALERTS, alertId);
    await updateDoc(alertRef, updates);
    return true;
  } catch (error) {
    console.error('[Firestore] Error updating alert:', error);
    return false;
  }
}

/**
 * Record a point transaction and update student points in Firestore
 */
export async function addPointTransactionToFirestore(
  studentId: string,
  transaction: any,
  updatedPoints: { currentPoints: number; totalPositivePoints: number; totalNegativePoints: number }
): Promise<boolean> {
  if (!canUseFirestore() || !db) return false;

  try {
    const batch = writeBatch(db);
    const pointRef = doc(db, 'point_transactions', transaction.id);
    batch.set(pointRef, { ...transaction, studentId });

    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    batch.update(studentRef, updatedPoints);

    await batch.commit();
    return true;
  } catch (error) {
    console.error('[Firestore] Error recording point transaction:', error);
    return false;
  }
}

/**
 * Record evidence in Firestore
 */
export async function addEvidenceToFirestore(
  studentId: string,
  evidence: any
): Promise<boolean> {
  if (!canUseFirestore() || !db) return false;

  try {
    const evidenceRef = doc(db, 'evidence_records', evidence.id);
    await setDoc(evidenceRef, { ...evidence, studentId });
    return true;
  } catch (error) {
    console.error('[Firestore] Error saving evidence:', error);
    return false;
  }
}

