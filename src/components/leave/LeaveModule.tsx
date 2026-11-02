import React, { useState, useEffect } from 'react';
import {
  PlaneTakeoff,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  Download,
} from 'lucide-react';
import { LeaveRequest, LeaveType, LeaveStatus, Student } from '../../types';
import {
  getLeaveRequests,
  submitLeaveRequest,
  updateLeaveStatus,
  getStudents,
  getCurrentUser,
  subscribeToStorage,
} from '../../services/storage';
import { exportToCSV } from '../../utils/export';

export const LeaveModule: React.FC = () => {
  const currentUser = getCurrentUser();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(getLeaveRequests());
  const [students, setStudents] = useState<Student[]>(getStudents());

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');

  // Apply form state
  const currentStudent = students.find((s) => s.id === currentUser.studentId) || students[0];
  const [applyForm, setApplyForm] = useState<{
    studentId: string;
    leaveType: LeaveType;
    reason: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    expectedReturnDate: string;
    expectedReturnTime: string;
    parentPhone: string;
  }>({
    studentId: currentStudent?.id || '',
    leaveType: 'Home Visit',
    reason: '',
    destination: '',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '17:00',
    expectedReturnDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    expectedReturnTime: '20:00',
    parentPhone: currentStudent?.parentPhone || '',
  });

  useEffect(() => {
    const refresh = () => {
      setLeaveRequests(getLeaveRequests());
      setStudents(getStudents());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const filteredRequests = leaveRequests.filter((r) => {
    if (currentUser.role === 'STUDENT' && currentUser.studentId) {
      if (r.studentId !== currentUser.studentId) return false;
    }
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  const handleOpenReview = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setReviewRemarks('');
    setIsReviewModalOpen(true);
  };

  const handleReviewDecision = (status: LeaveStatus) => {
    if (!selectedRequest) return;
    updateLeaveStatus(selectedRequest.id, status, currentUser.name, reviewRemarks);
    setIsReviewModalOpen(false);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === applyForm.studentId) || currentStudent;
    if (!stu) return;

    const newReq: LeaveRequest = {
      id: `lv-${Date.now().toString().slice(-4)}`,
      studentId: stu.id,
      studentName: stu.name,
      collegeRegNo: stu.collegeRegNo,
      department: stu.department,
      roomNumber: stu.roomNumber,
      hostelName: stu.hostelName,
      leaveType: applyForm.leaveType,
      reason: applyForm.reason,
      destination: applyForm.destination,
      departureDate: applyForm.departureDate,
      departureTime: applyForm.departureTime,
      expectedReturnDate: applyForm.expectedReturnDate,
      expectedReturnTime: applyForm.expectedReturnTime,
      parentPhone: applyForm.parentPhone || stu.parentPhone,
      parentConsentVerified: true,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    submitLeaveRequest(newReq);
    setIsApplyModalOpen(false);
  };

  const handleMarkReturned = (reqId: string) => {
    updateLeaveStatus(reqId, 'Completed', currentUser.name, 'Student safely reported back to hostel campus.');
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleExport = () => {
    const rows = filteredRequests.map((r) => ({
      'Application ID': r.id,
      Student: r.studentName,
      'Reg No': r.collegeRegNo,
      Room: r.roomNumber,
      'Leave Type': r.leaveType,
      Reason: r.reason,
      Destination: r.destination,
      'Departure Date': r.departureDate,
      'Departure Time': r.departureTime,
      'Return Date': r.expectedReturnDate,
      'Return Time': r.expectedReturnTime,
      'Parent Contact': r.parentPhone,
      Status: r.status,
      'Reviewed By': r.reviewedBy || 'Pending',
      'Applied On': r.createdAt,
    }));
    exportToCSV('Leave_Applications_Report', rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Leave & Outstation Passes</h1>
          <p className="text-xs text-slate-500">
            End-to-end digital approval workflow from student submission to warden sanction and return reporting.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === status
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {status} ({status === 'All' ? leaveRequests.length : leaveRequests.filter((l) => l.status === status).length})
          </button>
        ))}
      </div>

      {/* Leave Requests Cards / Table */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            No leave requests found in this view.
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-500">#{req.id}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {req.leaveType}
                  </span>
                  <span className="text-xs text-slate-400">• Applied {req.createdAt}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-bold text-slate-900 text-sm">{req.studentName}</div>
                  <span className="text-xs text-slate-500 font-mono">({req.collegeRegNo})</span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                    Room {req.roomNumber}
                  </span>
                </div>

                <p className="text-xs text-slate-700">
                  <strong className="text-slate-900">Reason:</strong> {req.reason}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <strong>Out:</strong> {req.departureDate} ({req.departureTime}) &rarr; <strong>Return:</strong>{' '}
                    {req.expectedReturnDate} ({req.expectedReturnTime})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {req.destination}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Parent: {req.parentPhone}
                  </span>
                </div>

                {req.reviewedBy && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    Sanctioned by: <span className="font-semibold text-slate-700">{req.reviewedBy}</span>{' '}
                    {req.rejectionReason && <span className="text-red-600">({req.rejectionReason})</span>}
                  </div>
                )}
              </div>

              {/* Action Buttons for Warden or Admin */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {currentUser.role !== 'STUDENT' && req.status === 'Pending' && (
                  <button
                    onClick={() => handleOpenReview(req)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                  >
                    <span>Review Application</span>
                  </button>
                )}

                {currentUser.role !== 'STUDENT' && req.status === 'Approved' && (
                  <button
                    onClick={() => handleMarkReturned(req.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                  >
                    <Check className="h-4 w-4" />
                    <span>Confirm Inmate Return</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold">Apply for Hostel Leave Pass</h2>
              </div>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              {currentUser.role !== 'STUDENT' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                  <select
                    value={applyForm.studentId}
                    onChange={(e) => {
                      const stu = students.find((s) => s.id === e.target.value);
                      setApplyForm({
                        ...applyForm,
                        studentId: e.target.value,
                        parentPhone: stu ? stu.parentPhone : '',
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.collegeRegNo}) - Room {s.roomNumber}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Category *</label>
                <select
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value as LeaveType })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden"
                >
                  <option value="Home Visit">Home Visit</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Academic / Conference">Academic / Conference</option>
                  <option value="Weekend Outing">Weekend Outing</option>
                  <option value="Personal">Personal Outing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  required
                  rows={2}
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  placeholder="Detail the exact purpose for leaving campus..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Destination Address / City *</label>
                <input
                  type="text"
                  required
                  value={applyForm.destination}
                  onChange={(e) => setApplyForm({ ...applyForm, destination: e.target.value })}
                  placeholder="e.g. Bangalore, Karnataka (Home)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.departureDate}
                    onChange={(e) => setApplyForm({ ...applyForm, departureDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departure Time *</label>
                  <input
                    type="time"
                    required
                    value={applyForm.departureTime}
                    onChange={(e) => setApplyForm({ ...applyForm, departureTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Return Date *</label>
                  <input
                    type="date"
                    required
                    value={applyForm.expectedReturnDate}
                    onChange={(e) => setApplyForm({ ...applyForm, expectedReturnDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Return Time *</label>
                  <input
                    type="time"
                    required
                    value={applyForm.expectedReturnTime}
                    onChange={(e) => setApplyForm({ ...applyForm, expectedReturnTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Verified Phone *</label>
                <input
                  type="text"
                  required
                  value={applyForm.parentPhone}
                  onChange={(e) => setApplyForm({ ...applyForm, parentPhone: e.target.value })}
                  placeholder="+91 94440 11223"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal for Warden */}
      {isReviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Warden Review: #{selectedRequest.id}</h2>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">{selectedRequest.studentName}</div>
                <div className="text-slate-600">
                  {selectedRequest.collegeRegNo} • Room {selectedRequest.roomNumber}
                </div>
                <div className="text-slate-700 pt-1">
                  <strong>Type:</strong> {selectedRequest.leaveType}
                </div>
                <div className="text-slate-700">
                  <strong>Reason:</strong> {selectedRequest.reason}
                </div>
                <div className="text-slate-700">
                  <strong>Travel:</strong> {selectedRequest.departureDate} ({selectedRequest.departureTime}) to{' '}
                  {selectedRequest.expectedReturnDate} ({selectedRequest.expectedReturnTime})
                </div>
                <div className="text-slate-700 font-mono">
                  <strong>Parent Contact:</strong> {selectedRequest.parentPhone}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Warden Remarks / Condition (Optional)
                </label>
                <input
                  type="text"
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="e.g. Verified with parent via phone call"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleReviewDecision('Rejected')}
                  className="rounded-xl bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 font-semibold border border-red-200"
                >
                  Reject Leave
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewDecision('Approved')}
                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2 font-semibold shadow-xs"
                >
                  Approve Leave Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
