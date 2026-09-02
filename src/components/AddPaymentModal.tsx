'use client';

import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/utils';
import { X, IndianRupee, CheckCircle2, AlertCircle, Calendar, CreditCard, FileText, Briefcase } from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWorkId?: string;
}

export default function AddPaymentModal({ isOpen, onClose, defaultWorkId }: AddPaymentModalProps) {
  const { works, addPayment } = useData();

  const [selectedWorkId, setSelectedWorkId] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'Advance' | 'Second Payment' | 'Final Payment' | 'Other'>('Advance');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Set initial selected work
  useEffect(() => {
    if (isOpen) {
      setSuccessMsg('');
      setErrorMsg('');
      const targetWork = defaultWorkId
        ? works.find((w) => w.id === defaultWorkId)
        : works.find((w) => w.remainingPayment > 0) || works[0];

      if (targetWork) {
        setSelectedWorkId(targetWork.id);
        const rem = targetWork.remainingPayment;
        setAmount(rem > 0 ? rem.toString() : targetWork.totalBudget.toString());

        // Suggest type
        if (targetWork.advanceReceived === 0) {
          setPaymentType('Advance');
        } else if (targetWork.secondPayment === 0) {
          setPaymentType('Second Payment');
        } else {
          setPaymentType('Final Payment');
        }
      }
    }
  }, [isOpen, defaultWorkId, works]);

  if (!isOpen) return null;

  const currentWork = works.find((w) => w.id === selectedWorkId);
  const totalCollected = currentWork
    ? currentWork.advanceReceived + currentWork.secondPayment + currentWork.finalPayment
    : 0;

  const handleWorkChange = (workId: string) => {
    setSelectedWorkId(workId);
    const work = works.find((w) => w.id === workId);
    if (work) {
      setAmount(work.remainingPayment > 0 ? work.remainingPayment.toString() : '');
      if (work.advanceReceived === 0) {
        setPaymentType('Advance');
      } else if (work.secondPayment === 0) {
        setPaymentType('Second Payment');
      } else {
        setPaymentType('Final Payment');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedWorkId) {
      setErrorMsg('Please select a project/work');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount (> 0)');
      return;
    }

    try {
      addPayment({
        workId: selectedWorkId,
        amount: numAmount,
        type: paymentType,
        paymentMethod,
        date: paymentDate,
        note,
      });

      setSuccessMsg(`Successfully recorded payment of ${formatCurrency(numAmount)}!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg('Failed to record payment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-ix-surface border border-ix-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-ix-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-ix-green-dim border border-ix-green/20 flex items-center justify-center text-ix-green">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Record Payment</h2>
              <p className="text-xs text-ix-text-muted">Add a client payment for a work project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ix-text-secondary hover:text-ix-text rounded-lg hover:bg-ix-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Error Banners */}
        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-ix-green-dim border border-ix-green/30 text-ix-green flex items-center gap-2 text-sm font-medium animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-ix-danger-dim border border-ix-danger/30 text-ix-danger flex items-center gap-2 text-sm font-medium animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Select Work */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              Select Work / Project
            </label>
            <select
              value={selectedWorkId}
              onChange={(e) => handleWorkChange(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
            >
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.companyName} ({w.workId}) — Pending: {formatCurrency(w.remainingPayment)}
                </option>
              ))}
            </select>
          </div>

          {/* Financial Breakdown Card */}
          {currentWork && (
            <div className="p-3.5 rounded-2xl bg-ix-bg border border-ix-border/70 text-xs space-y-2">
              <div className="flex justify-between items-center text-ix-text-muted">
                <span>Total Project Budget:</span>
                <span className="font-semibold text-ix-text">{formatCurrency(currentWork.totalBudget)}</span>
              </div>
              <div className="flex justify-between items-center text-ix-text-muted">
                <span>Already Collected:</span>
                <span className="font-semibold text-ix-green">{formatCurrency(totalCollected)}</span>
              </div>
              <div className="flex justify-between items-center text-ix-text-muted pt-1 border-t border-ix-border">
                <span>Remaining Pending:</span>
                <span className={`font-bold ${currentWork.remainingPayment > 0 ? 'text-amber-400' : 'text-ix-green'}`}>
                  {formatCurrency(currentWork.remainingPayment)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Type & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Payment Stage
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              >
                <option value="Advance">Advance</option>
                <option value="Second Payment">Second Payment</option>
                <option value="Final Payment">Final Payment</option>
                <option value="Other">Other / Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ix-text-muted font-semibold">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full h-11 pl-8 pr-3 rounded-xl bg-ix-bg border border-ix-border text-sm font-semibold focus:border-ix-green focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Quick Amount Suggestion Chips */}
          {currentWork && currentWork.remainingPayment > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
              <span className="text-[10px] text-ix-text-muted flex-shrink-0">Quick Fill:</span>
              <button
                type="button"
                onClick={() => setAmount(currentWork.remainingPayment.toString())}
                className="px-2.5 py-1 rounded-lg bg-ix-bg border border-ix-border text-[11px] text-ix-text-secondary hover:text-ix-green hover:border-ix-green/30 transition-colors flex-shrink-0"
              >
                Full Pending ({formatCurrency(currentWork.remainingPayment)})
              </button>
              <button
                type="button"
                onClick={() => setAmount(Math.round(currentWork.remainingPayment / 2).toString())}
                className="px-2.5 py-1 rounded-lg bg-ix-bg border border-ix-border text-[11px] text-ix-text-secondary hover:text-ix-green hover:border-ix-green/30 transition-colors flex-shrink-0"
              >
                50% Pending ({formatCurrency(Math.round(currentWork.remainingPayment / 2))})
              </button>
            </div>
          )}

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              >
                <option value="UPI">GPay / PhonePe / UPI</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Credit/Debit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Note / Reference */}
          <div>
            <label className="block text-xs font-semibold text-ix-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Notes / Transaction ID (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. UTR #12345678 or cash receipt"
              className="w-full h-11 px-3 rounded-xl bg-ix-bg border border-ix-border text-sm focus:border-ix-green focus:outline-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-ix-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-ix-bg border border-ix-border text-sm font-semibold text-ix-text-secondary hover:text-ix-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!successMsg}
              className="flex-1 h-11 rounded-xl bg-ix-green text-ix-bg text-sm font-bold hover:bg-ix-green-hover transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              Confirm & Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
