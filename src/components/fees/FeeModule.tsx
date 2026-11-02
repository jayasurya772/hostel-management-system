import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { FeeRecord, PaymentTransaction, Student } from '../../types';
import {
  getFeeRecords,
  getPayments,
  processPayment,
  getStudents,
  getCurrentUser,
  subscribeToStorage,
} from '../../services/storage';
import { exportToCSV, printElement } from '../../utils/export';

export const FeeModule: React.FC = () => {
  const currentUser = getCurrentUser();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>(getFeeRecords());
  const [payments, setPayments] = useState<PaymentTransaction[]>(getPayments());
  const [students, setStudents] = useState<Student[]>(getStudents());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'records' | 'history'>('records');

  // Payment Gateway Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<FeeRecord | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit/Debit Card' | 'Net Banking'>('UPI');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Receipt Modal State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    const refresh = () => {
      setFeeRecords(getFeeRecords());
      setPayments(getPayments());
      setStudents(getStudents());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const filteredRecords = feeRecords.filter((f) => {
    if (currentUser.role === 'STUDENT' && currentUser.studentId) {
      if (f.studentId !== currentUser.studentId) return false;
    }
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.collegeRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter((p) => {
    if (currentUser.role === 'STUDENT' && currentUser.studentId) {
      return p.studentId === currentUser.studentId;
    }
    return true;
  });

  // Metrics
  const totalBilled = feeRecords.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalCollected = feeRecords.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = feeRecords.reduce((acc, f) => acc + f.pendingAmount, 0);

  const handleOpenPay = (record: FeeRecord) => {
    setSelectedFeeRecord(record);
    setPayAmount(record.pendingAmount > 0 ? record.pendingAmount : record.totalAmount);
    setIsPayModalOpen(true);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeRecord || payAmount <= 0) return;

    setPaymentProcessing(true);

    setTimeout(() => {
      const receiptNo = `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = `TXN-${paymentMethod.replace(/[^A-Z]/g, '')}-${Date.now().toString().slice(-8)}`;

      const newTxn: PaymentTransaction = {
        id: `pay-${Date.now()}`,
        feeRecordId: selectedFeeRecord.id,
        studentId: selectedFeeRecord.studentId,
        studentName: selectedFeeRecord.studentName,
        collegeRegNo: selectedFeeRecord.collegeRegNo,
        receiptNumber: receiptNo,
        amount: Number(payAmount),
        paymentMethod,
        transactionId: txnId,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Success',
        breakdown: {
          hostelFee: Math.round(payAmount * 0.55),
          messFee: Math.round(payAmount * 0.38),
          maintenanceFee: Math.round(payAmount * 0.07),
        },
      };

      processPayment(newTxn);
      setPaymentProcessing(false);
      setIsPayModalOpen(false);

      // Show receipt right away
      setActiveReceipt(newTxn);
      setIsReceiptModalOpen(true);
    }, 1200);
  };

  const handleOpenReceipt = (txn: PaymentTransaction) => {
    setActiveReceipt(txn);
    setIsReceiptModalOpen(true);
  };

  const getStatusBadge = (status: FeeRecord['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partial':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const handleExport = () => {
    const rows = filteredRecords.map((f) => ({
      'Student Name': f.studentName,
      'Reg No': f.collegeRegNo,
      Room: f.roomNumber,
      Semester: f.semester,
      'Hostel Fee': f.hostelFee,
      'Mess Fee': f.messFee,
      'Maintenance Fee': f.maintenanceFee,
      'Total Due': f.totalAmount,
      'Amount Paid': f.paidAmount,
      'Pending Amount': f.pendingAmount,
      'Due Date': f.dueDate,
      Status: f.status,
    }));
    exportToCSV('Fee_Collection_Report', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Fee Management & Payments</h1>
          <p className="text-xs text-slate-500">
            Student dues, hostel & mess tariff breakdown, automated receipts and online gateway integration.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Export Dues CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Term Dues</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            ₹{totalBilled.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500">Hostel accommodation & catering</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-emerald-700 uppercase">Collected Revenue</span>
          <div className="mt-1 text-2xl font-bold text-emerald-800">
            ₹{totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% Realized
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-[10px] font-semibold text-amber-700 uppercase">Pending Receivables</span>
          <div className="mt-1 text-2xl font-bold text-amber-800">
            ₹{totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-600">Pending or overdue accounts</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('records')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'records'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fee Dues & Invoices ({filteredRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Payment Transactions ({filteredPayments.length})
        </button>
      </div>

      {/* Tab 1: Fee Records */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, reg no, room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-800 focus:outline-hidden"
              >
                <option value="All">All Fee Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="text-slate-500 font-medium">{filteredRecords.length} student records</div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Resident Student</th>
                    <th className="py-3 px-3">Room</th>
                    <th className="py-3 px-3">Hostel Fee</th>
                    <th className="py-3 px-3">Mess Fee</th>
                    <th className="py-3 px-3">Total Due</th>
                    <th className="py-3 px-3">Paid / Pending</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No fee dues found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{f.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{f.collegeRegNo}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-indigo-700">{f.roomNumber}</td>
                        <td className="py-3 px-3 font-mono">₹{f.hostelFee.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono">₹{f.messFee.toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                          ₹{f.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className="text-emerald-700 font-semibold">
                            ₹{f.paidAmount.toLocaleString()}
                          </span>
                          {f.pendingAmount > 0 && (
                            <span className="text-red-600 ml-1 font-semibold">
                              / Due: ₹{f.pendingAmount.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{f.dueDate}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                              f.status
                            )}`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {f.pendingAmount > 0 ? (
                            <button
                              onClick={() => handleOpenPay(f)}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-2xs hover:bg-indigo-700"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-4 w-4" /> Cleared
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Transactions History */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Payment Method</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No payment history recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">{p.receiptNumber}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{p.studentName}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{p.transactionId}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{p.paymentMethod}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                        ₹{p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{p.date}</td>
                      <td className="py-3 px-3">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenReceipt(p)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 ml-auto"
                        >
                          <Printer className="h-3.5 w-3.5 text-slate-500" />
                          <span>View Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Online Payment Gateway Modal */}
      {isPayModalOpen && selectedFeeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Payment Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold">Smart Hostel Secure Payment Gateway</h2>
                  <p className="text-[10px] text-slate-400">256-Bit SSL Encrypted Campus Dues Settlement</p>
                </div>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="p-6 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900">{selectedFeeRecord.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reg No:</span>
                  <span className="font-mono text-slate-700">{selectedFeeRecord.collegeRegNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Academic Semester:</span>
                  <span className="text-slate-800">{selectedFeeRecord.semester}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                  <span className="font-semibold text-slate-800">Total Outstanding Balance:</span>
                  <span className="font-bold text-red-600 font-mono text-sm">
                    ₹{selectedFeeRecord.pendingAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (INR) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    min={100}
                    max={selectedFeeRecord.pendingAmount}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 pl-7 pr-3 py-2 font-bold font-mono text-sm text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Credit/Debit Card', 'Net Banking'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-xl border p-2 text-center text-xs font-semibold transition-all ${
                        paymentMethod === method
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-3 text-center space-y-1">
                  <QrCode className="h-10 w-10 text-indigo-600 mx-auto" />
                  <p className="font-bold text-indigo-950">Scan via GPay / PhonePe / BHIM</p>
                  <p className="text-[10px] text-indigo-700 font-mono">UPI ID: smarthostel.fee@institutional</p>
                </div>
              )}

              {paymentMethod === 'Credit/Debit Card' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Card Number (4111 2222 3333 4444)"
                    defaultValue="4111 2222 3333 4444"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="12/28"
                      className="rounded-xl border border-slate-200 px-3 py-2 font-mono"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      defaultValue="789"
                      className="rounded-xl border border-slate-200 px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Net Banking' && (
                <select className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white">
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  disabled={paymentProcessing}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 shadow-xs flex items-center gap-2"
                >
                  {paymentProcessing ? (
                    <span>Processing with Gateway...</span>
                  ) : (
                    <span>Authorize ₹{Number(payAmount).toLocaleString()}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      {isReceiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold">Official Hostel Fee E-Receipt</h2>
              </div>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div id="printable-receipt" className="p-8 space-y-6 text-xs text-slate-800">
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-lg font-extrabold text-slate-900">SMART HOSTEL ADMINISTRATION</h1>
                  <p className="text-slate-500 text-[11px]">Campus Housing, Dining & Living Automation Authority</p>
                  <p className="text-slate-400 text-[10px]">Tax Exemption Registered • Receipt Generated Online</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-indigo-700">{activeReceipt.receiptNumber}</div>
                  <div className="text-[11px] text-slate-500">{activeReceipt.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Resident Student Details</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{activeReceipt.studentName}</div>
                  <div className="text-slate-600 font-mono">College Reg No: {activeReceipt.collegeRegNo}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Payment Gateway Details</div>
                  <div className="font-mono text-slate-800 font-semibold">{activeReceipt.transactionId}</div>
                  <div className="text-slate-500">Channel: {activeReceipt.paymentMethod}</div>
                </div>
              </div>

              {/* Breakdown Table */}
              <table className="w-full border-collapse border border-slate-200 text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-bold text-slate-700">Fee Component</th>
                    <th className="p-2.5 text-right font-bold text-slate-700">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5">Hostel Room Rent & Electricity</td>
                    <td className="p-2.5 text-right font-mono">₹{activeReceipt.breakdown.hostelFee.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Hostel Central Mess Catering</td>
                    <td className="p-2.5 text-right font-mono">₹{activeReceipt.breakdown.messFee.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5">Campus Maintenance & Amenities</td>
                    <td className="p-2.5 text-right font-mono">
                      ₹{activeReceipt.breakdown.maintenanceFee.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="p-2.5">Total Amount Paid</td>
                    <td className="p-2.5 text-right font-mono text-sm text-emerald-700">
                      ₹{activeReceipt.amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verified Successful Transaction</span>
                </div>
                <div>Authorized Electronic Signature</div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => printElement('printable-receipt')}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
