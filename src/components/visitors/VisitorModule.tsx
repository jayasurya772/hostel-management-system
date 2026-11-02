import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ShieldCheck,
  Scan,
  User,
  Phone,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { Visitor, VisitorStatus, Student } from '../../types';
import {
  getVisitors,
  saveVisitor,
  updateVisitorStatus,
  getStudents,
  getCurrentUser,
  subscribeToStorage,
} from '../../services/storage';
import { generateQRCodeDataUrl } from '../../utils/qr';
import { exportToCSV } from '../../utils/export';

export const VisitorModule: React.FC = () => {
  const currentUser = getCurrentUser();
  const [visitors, setVisitors] = useState<Visitor[]>(getVisitors());
  const [students, setStudents] = useState<Student[]>(getStudents());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [scannerInputCode, setScannerInputCode] = useState('');
  const [scannerResult, setScannerResult] = useState<{ visitor: Visitor | null; message: string; success: boolean } | null>(null);

  // Form State
  const currentStudent = students.find((s) => s.id === currentUser.studentId) || students[0];
  const [form, setForm] = useState<{
    visitorName: string;
    phone: string;
    idProofType: Visitor['idProofType'];
    idProofNumber: string;
    relationWithStudent: string;
    studentId: string;
    purpose: string;
    visitDate: string;
  }>({
    visitorName: '',
    phone: '',
    idProofType: 'Aadhar Card',
    idProofNumber: '',
    relationWithStudent: 'Parent',
    studentId: currentStudent?.id || '',
    purpose: '',
    visitDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const refresh = () => {
      setVisitors(getVisitors());
      setStudents(getStudents());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const filteredVisitors = visitors.filter((v) => {
    if (currentUser.role === 'STUDENT' && currentUser.studentId) {
      if (v.studentId !== currentUser.studentId) return false;
    }
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.passCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.studentRoomNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenQR = async (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    const qrData = JSON.stringify({
      passCode: visitor.passCode,
      visitor: visitor.visitorName,
      student: visitor.studentName,
      room: visitor.studentRoomNo,
      date: visitor.visitDate,
      status: visitor.status,
    });
    const url = await generateQRCodeDataUrl(qrData);
    setQrCodeDataUrl(url);
    setIsQRModalOpen(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStu = students.find((s) => s.id === form.studentId) || currentStudent;
    if (!targetStu) return;

    const newPassCode = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVisitor: Visitor = {
      id: `vis-${Date.now()}`,
      visitorName: form.visitorName,
      phone: form.phone,
      idProofType: form.idProofType,
      idProofNumber: form.idProofNumber,
      relationWithStudent: form.relationWithStudent,
      studentId: targetStu.id,
      studentName: targetStu.name,
      studentRoomNo: targetStu.roomNumber,
      hostelName: targetStu.hostelName,
      purpose: form.purpose,
      visitDate: form.visitDate,
      passCode: newPassCode,
      status: currentUser.role === 'STUDENT' ? 'Pending' : 'Approved',
      approvedBy: currentUser.role !== 'STUDENT' ? currentUser.name : undefined,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    saveVisitor(newVisitor);
    setIsRegisterModalOpen(false);
  };

  const handleStatusChange = (id: string, status: VisitorStatus) => {
    updateVisitorStatus(id, status);
  };

  const handleScanVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = scannerInputCode.trim().toUpperCase();
    const matched = visitors.find((v) => v.passCode.toUpperCase() === code);

    if (matched) {
      setScannerResult({
        visitor: matched,
        message: `Verified pass for ${matched.visitorName} visiting ${matched.studentName} (${matched.studentRoomNo}).`,
        success: true,
      });
    } else {
      setScannerResult({
        visitor: null,
        message: `Invalid or unapproved Pass Code "${code}". No matching gate pass record.`,
        success: false,
      });
    }
  };

  const getStatusBadge = (status: VisitorStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Checked In':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Checked Out':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const handleExport = () => {
    const rows = filteredVisitors.map((v) => ({
      'Pass Code': v.passCode,
      'Visitor Name': v.visitorName,
      Phone: v.phone,
      'ID Type': v.idProofType,
      'ID Number': v.idProofNumber,
      Relation: v.relationWithStudent,
      'Student Visited': v.studentName,
      'Room Number': v.studentRoomNo,
      Hostel: v.hostelName,
      Purpose: v.purpose,
      Date: v.visitDate,
      'Entry Time': v.entryTime || 'N/A',
      'Exit Time': v.exitTime || 'N/A',
      Status: v.status,
    }));
    exportToCSV('Visitor_Logs_Register', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Visitor Management & Gate Passes</h1>
          <p className="text-xs text-slate-500">
            Secure biometric guest passes, QR verification, and real-time check-in/out timestamps.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </button>
          <button
            onClick={() => {
              setScannerResult(null);
              setScannerInputCode('');
              setIsScannerModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 shadow-xs"
          >
            <Scan className="h-4 w-4" />
            <span>Security QR Scanner</span>
          </button>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Register Visitor</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search visitor, student, pass code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden w-64"
            />
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
            {['All', 'Pending', 'Approved', 'Checked In', 'Checked Out'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-500 font-medium">
          Showing {filteredVisitors.length} of {visitors.length} visitors
        </div>
      </div>

      {/* Visitor Passes Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Pass Code</th>
                <th className="py-3 px-3">Visitor Name</th>
                <th className="py-3 px-3">ID Proof</th>
                <th className="py-3 px-3">Student Visited</th>
                <th className="py-3 px-3">Purpose</th>
                <th className="py-3 px-3">Visit Date & Timings</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    {/* Pass Code */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {v.passCode}
                        </span>
                        <button
                          onClick={() => handleOpenQR(v)}
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                          title="View Digital QR Pass"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                    {/* Visitor */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{v.visitorName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{v.phone}</div>
                    </td>

                    {/* ID */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{v.idProofType}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{v.idProofNumber || 'Verified at gate'}</div>
                    </td>

                    {/* Student Visited */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{v.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        Room {v.studentRoomNo} • {v.relationWithStudent}
                      </div>
                    </td>

                    {/* Purpose */}
                    <td className="py-3 px-3 max-w-xs truncate" title={v.purpose}>
                      {v.purpose}
                    </td>

                    {/* Timings */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{v.visitDate}</div>
                      <div className="text-[11px] text-slate-500">
                        {v.entryTime ? `In: ${v.entryTime}` : 'Not Checked In'}{' '}
                        {v.exitTime ? `• Out: ${v.exitTime}` : ''}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(v.status)}`}>
                        {v.status}
                      </span>
                    </td>

                    {/* Quick Gate Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {currentUser.role !== 'STUDENT' && v.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusChange(v.id, 'Approved')}
                            className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        )}

                        {currentUser.role !== 'STUDENT' && v.status === 'Approved' && (
                          <button
                            onClick={() => handleStatusChange(v.id, 'Checked In')}
                            className="rounded-lg bg-blue-600 text-white px-2.5 py-1 text-[11px] font-semibold hover:bg-blue-700"
                          >
                            Check In
                          </button>
                        )}

                        {currentUser.role !== 'STUDENT' && v.status === 'Checked In' && (
                          <button
                            onClick={() => handleStatusChange(v.id, 'Checked Out')}
                            className="rounded-lg border border-slate-300 bg-white text-slate-800 px-2.5 py-1 text-[11px] font-semibold hover:bg-slate-50"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Pass Modal */}
      {isQRModalOpen && selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-center">
            <div className="bg-slate-900 p-5 text-white">
              <div className="flex justify-end">
                <button onClick={() => setIsQRModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <h3 className="text-base font-bold">SMART HOSTEL DIGITAL GATE PASS</h3>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Authorized Entry Verification Code</p>
            </div>

            <div className="p-6 space-y-4">
              {/* QR Image */}
              <div className="flex justify-center">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Pass"
                    className="h-44 w-44 rounded-xl border border-slate-200 p-2 shadow-xs"
                  />
                ) : (
                  <div className="h-44 w-44 flex items-center justify-center bg-slate-100 rounded-xl">
                    <QrCode className="h-16 w-16 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="font-mono text-lg font-extrabold text-indigo-700 tracking-wider">
                {selectedVisitor.passCode}
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-left border border-slate-200 space-y-1">
                <div>
                  <span className="text-slate-500">Visitor:</span>{' '}
                  <span className="font-bold text-slate-900">{selectedVisitor.visitorName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Student:</span>{' '}
                  <span className="font-semibold text-slate-900">
                    {selectedVisitor.studentName} (Room {selectedVisitor.studentRoomNo})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Date:</span>{' '}
                  <span className="text-slate-800">{selectedVisitor.visitDate}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hostel:</span>{' '}
                  <span className="text-slate-800">{selectedVisitor.hostelName}</span>
                </div>
              </div>

              <button
                onClick={() => setIsQRModalOpen(false)}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security QR Scanner Simulator Modal */}
      {isScannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-indigo-950 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold">Main Gate QR & Pass Code Scanner</h2>
              </div>
              <button onClick={() => setIsScannerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-center">
                <Scan className="h-10 w-10 text-indigo-600 mx-auto animate-pulse" />
                <p className="mt-2 font-semibold text-indigo-950">Security Gate Scanner Emulation</p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Type or scan the visitor alphanumeric token (e.g. VIS-9021 or VIS-8412) to verify clearance instantly.
                </p>
              </div>

              <form onSubmit={handleScanVerify} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enter Visitor Pass Code *</label>
                  <input
                    type="text"
                    required
                    value={scannerInputCode}
                    onChange={(e) => setScannerInputCode(e.target.value)}
                    placeholder="e.g. VIS-9021"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono uppercase focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
                  >
                    Verify Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // pick first active visitor as quick demo
                      const sample = visitors[0]?.passCode;
                      if (sample) setScannerInputCode(sample);
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Load Sample Pass
                  </button>
                </div>
              </form>

              {/* Scan Results */}
              {scannerResult && (
                <div
                  className={`rounded-xl border p-4 space-y-2 ${
                    scannerResult.success
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-red-200 bg-red-50 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {scannerResult.success ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span>{scannerResult.success ? 'Security Verification Passed' : 'Verification Failed'}</span>
                  </div>
                  <p className="text-xs">{scannerResult.message}</p>

                  {scannerResult.visitor && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          handleStatusChange(scannerResult.visitor!.id, 'Checked In');
                          setIsScannerModalOpen(false);
                        }}
                        className="rounded-lg bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-800"
                      >
                        Grant Check-In Entry
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(scannerResult.visitor!.id, 'Checked Out');
                          setIsScannerModalOpen(false);
                        }}
                        className="rounded-lg border border-slate-300 bg-white text-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                      >
                        Record Gate Exit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visitor Registration Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Register Campus Visitor</h2>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.visitorName}
                    onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                    placeholder="e.g. Suresh Verma"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 94440 11223"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Government ID Proof Type *</label>
                  <select
                    value={form.idProofType}
                    onChange={(e) => setForm({ ...form, idProofType: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden"
                  >
                    <option value="Aadhar Card">Aadhar Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ID Proof Number</label>
                  <input
                    type="text"
                    value={form.idProofNumber}
                    onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })}
                    placeholder="XXXX-XXXX-4589"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Being Visited *</label>
                  <select
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.roomNumber || 'No Room'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relation with Student *</label>
                  <input
                    type="text"
                    required
                    value={form.relationWithStudent}
                    onChange={(e) => setForm({ ...form, relationWithStudent: e.target.value })}
                    placeholder="Father / Mother / Guardian / Friend"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose of Campus Visit *</label>
                <input
                  type="text"
                  required
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="e.g. Delivering luggage, personal meeting"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheduled Visit Date *</label>
                <input
                  type="date"
                  required
                  value={form.visitDate}
                  onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Generate Visitor Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
