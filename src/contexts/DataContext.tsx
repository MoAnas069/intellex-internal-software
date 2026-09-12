'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Work, Payment, Student, Client, Alert } from '@/types';
import { demoWorks, demoStudents, demoClients, demoAlerts } from '@/lib/demo-data';
import {
  canUseFirestore,
  seedFirestoreIfEmpty,
  subscribeToCollection,
  recordPaymentInFirestore,
  generateInitialPayments,
  COLLECTIONS,
} from '@/lib/firestore-service';

interface DataContextType {
  works: Work[];
  payments: Payment[];
  students: Student[];
  clients: Client[];
  alerts: Alert[];
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
  getWorkById: (id: string) => Work | undefined;
  getPaymentsForWork: (workId: string) => Payment[];
}

const STORAGE_KEY_WORKS = 'intellex_works_data';
const STORAGE_KEY_PAYMENTS = 'intellex_payments_data';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [works, setWorks] = useState<Work[]>(demoWorks);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>(demoStudents);
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('offline');
  const [isLiveBackend, setIsLiveBackend] = useState(false);

  // Initialize from LocalStorage first for instant paint
  useEffect(() => {
    try {
      const savedWorks = localStorage.getItem(STORAGE_KEY_WORKS);
      const savedPayments = localStorage.getItem(STORAGE_KEY_PAYMENTS);

      if (savedWorks) {
        setWorks(JSON.parse(savedWorks));
      }
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
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }, [works, payments, isInitialized]);

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
        // Seed Firestore if this is a newly created database
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

    // Subscribe to Firestore collections in real time
    const unsubWorks = subscribeToCollection<Work>(COLLECTIONS.WORKS, (data) => {
      if (data && data.length > 0) {
        setWorks(data);
      }
    });

    const unsubPayments = subscribeToCollection<Payment>(COLLECTIONS.PAYMENTS, (data) => {
      if (data && data.length > 0) {
        // Sort newest payments first
        setPayments(
          [...data].sort(
            (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
          )
        );
      }
    });

    const unsubStudents = subscribeToCollection<Student>(COLLECTIONS.STUDENTS, (data) => {
      if (data && data.length > 0) {
        setStudents(data);
      }
    });

    const unsubClients = subscribeToCollection<Client>(COLLECTIONS.CLIENTS, (data) => {
      if (data && data.length > 0) {
        setClients(data);
      }
    });

    const unsubAlerts = subscribeToCollection<Alert>(COLLECTIONS.ALERTS, (data) => {
      if (data && data.length > 0) {
        setAlerts(data);
      }
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

      // 1. Optimistic Local State Update
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

      // 2. Persist to Firestore backend if live
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

  const getWorkById = useCallback(
    (id: string) => {
      return works.find((w) => w.id === id);
    },
    [works]
  );

  const getPaymentsForWork = useCallback(
    (workId: string) => {
      return payments.filter((p) => p.workId === workId);
    },
    [payments]
  );

  return (
    <DataContext.Provider
      value={{
        works,
        payments,
        students,
        clients,
        alerts,
        isLiveBackend,
        syncStatus,
        addPayment,
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
