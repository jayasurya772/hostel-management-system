import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Wrench,
  AlertCircle,
  User,
  X,
  Check,
  ChevronRight,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus, Student } from '../../types';
import {
  getComplaints,
  submitComplaint,
  updateComplaintStatus,
  getStudents,
  getAllUsers,
  getCurrentUser,
  subscribeToStorage,
} from '../../services/storage';

export const ComplaintModule: React.FC = () => {
  const currentUser = getCurrentUser();
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [allUsers, setAllUsers] = useState(getAllUsers());

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Assignment & Resolution State
  const [assignedStaffId, setAssignedStaffId] = useState('usr-staff-1');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Submit Form State
  const currentStudent = students.find((s) => s.id === currentUser.studentId) || students[0];
  const [form, setForm] = useState<{
    studentId: string;
    category: ComplaintCategory;
    title: string;
    description: string;
    roomNumber: string;
    priority: Complaint['priority'];
    imageUrl: string;
  }>({
    studentId: currentStudent?.id || '',
    category: 'Electrical',
    title: '',
    description: '',
    roomNumber: currentStudent?.roomNumber || 'A-101',
    priority: 'Medium',
    imageUrl: '',
  });

  useEffect(() => {
    const refresh = () => {
      setComplaints(getComplaints());
      setStudents(getStudents());
      setAllUsers(getAllUsers());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (currentUser.role === 'STUDENT' && currentUser.studentId) {
      if (c.studentId !== currentUser.studentId) return false;
    }
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const staffMembers = allUsers.filter((u) => u.role === 'STAFF');

  const handleOpenAssign = (c: Complaint) => {
    setSelectedComplaint(c);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    const staff = staffMembers.find((s) => s.id === assignedStaffId);
    updateComplaintStatus(
      selectedComplaint.id,
      'Assigned',
      assignedStaffId,
      staff ? `${staff.name} (${staff.staffRole || 'Staff'})` : 'Assigned Staff'
    );
    setIsAssignModalOpen(false);
  };

  const handleOpenResolve = (c: Complaint) => {
    setSelectedComplaint(c);
    setResolutionNotes('');
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    updateComplaintStatus(
      selectedComplaint.id,
      'Resolved',
      selectedComplaint.assignedToStaffId,
      selectedComplaint.assignedStaffName,
      resolutionNotes || 'Fixed and verified by facility maintenance team.'
    );
    setIsResolveModalOpen(false);
  };

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === form.studentId) || currentStudent;
    if (!stu) return;

    const newTicket: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: stu.id,
      studentName: stu.name,
      roomNumber: form.roomNumber || stu.roomNumber,
      hostelName: stu.hostelName,
      category: form.category,
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: 'Submitted',
      imageUrl: form.imageUrl,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    submitComplaint(newTicket);
    setIsSubmitModalOpen(false);
    setForm({
      studentId: currentStudent?.id || '',
      category: 'Electrical',
      title: '',
      description: '',
      roomNumber: currentStudent?.roomNumber || 'A-101',
      priority: 'Medium',
      imageUrl: '',
    });
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Under Review':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getPriorityBadge = (p: Complaint['priority']) => {
    switch (p) {
      case 'Emergency':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'Low':
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hostel Maintenance & Complaint Tickets
          </h1>
          <p className="text-xs text-slate-500">
            Digitized grievance ticketing tracking electrical, plumbing, Wi-Fi and civil repair requests.
          </p>
        </div>
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket #, title, resident..."
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
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-800 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Wi-Fi">Wi-Fi & Internet</option>
            <option value="Furniture">Furniture</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Mess / Food">Mess / Food</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          {filteredComplaints.length} tickets recorded
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            No complaints found matching criteria.
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {c.ticketNumber}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(c.status)}`}>
                    {c.status}
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getPriorityBadge(c.priority)}`}>
                    {c.priority} Priority
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {c.category}
                  </span>
                  <span className="text-xs text-slate-400">• {c.submittedAt}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>
                    Reported by: <strong className="text-slate-800">{c.studentName}</strong> (Room {c.roomNumber})
                  </span>
                  {c.assignedStaffName && (
                    <span className="flex items-center gap-1 text-indigo-700 font-medium">
                      <Wrench className="h-3.5 w-3.5" />
                      Assigned to: {c.assignedStaffName}
                    </span>
                  )}
                  {c.resolvedAt && (
                    <span className="text-emerald-700 font-medium">
                      Resolved on: {c.resolvedAt}
                    </span>
                  )}
                </div>

                {c.resolutionNotes && (
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-900 border border-emerald-200">
                    <strong className="font-semibold">Resolution Note:</strong> {c.resolutionNotes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {currentUser.role !== 'STUDENT' && c.status === 'Submitted' && (
                  <button
                    onClick={() => handleOpenAssign(c)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    <span>Assign Staff</span>
                  </button>
                )}

                {currentUser.role !== 'STUDENT' && (c.status === 'Assigned' || c.status === 'In Progress') && (
                  <button
                    onClick={() => handleOpenResolve(c)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit Complaint Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold">Report Hostel Problem / Maintenance</h2>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="p-6 space-y-4 text-xs">
              {currentUser.role !== 'STUDENT' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Reporting *</label>
                  <select
                    value={form.studentId}
                    onChange={(e) => {
                      const stu = students.find((s) => s.id === e.target.value);
                      setForm({
                        ...form,
                        studentId: e.target.value,
                        roomNumber: stu?.roomNumber || 'A-101',
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Room {s.roomNumber || 'None'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as ComplaintCategory })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-hidden"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Wi-Fi">Wi-Fi & Internet</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Room Maintenance">Room Maintenance</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Mess / Food">Mess / Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    placeholder="e.g. A-101"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complaint Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Bathroom light flickering, washbasin clogged"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide precise details of the malfunction or damage..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Urgency Priority *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Emergency">Emergency (Immediate)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Photo Attachment URL (Optional)</label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {isAssignModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Assign Maintenance Personnel</h2>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-6 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{selectedComplaint.title}</div>
                <div className="text-slate-500">
                  {selectedComplaint.category} • Room {selectedComplaint.roomNumber}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select On-Duty Staff Member *
                </label>
                <select
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                >
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.staffRole || 'Maintenance Staff'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Confirm Staff Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {isResolveModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Mark Ticket Resolved: #{selectedComplaint.ticketNumber}</h2>
              <button onClick={() => setIsResolveModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resolution Notes / Work Performed *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Replaced fan regulator with new 5-step model from stock. Tested speed control."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Close & Resolve Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
