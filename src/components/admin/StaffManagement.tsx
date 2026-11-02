import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Phone,
  Mail,
  Shield,
  Wrench,
  CheckCircle,
  X,
  Search,
} from 'lucide-react';
import { User } from '../../types';
import { getAllUsers, subscribeToStorage } from '../../services/storage';

export const StaffManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(getAllUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setUsers(getAllUsers());
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const staffList = users.filter((u) => u.role === 'STAFF' || u.role === 'WARDEN');

  const filteredStaff = staffList.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.staffRole && s.staffRole.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Staff & Wardens Directory</h1>
          <p className="text-xs text-slate-500">
            Administrative officers, wardens, electrical, plumbing and facility management personnel.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between text-xs">
        <input
          type="text"
          placeholder="Search staff by name, role or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-xs w-72 focus:outline-hidden"
        />
        <span className="text-slate-500">{filteredStaff.length} active personnel</span>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={staff.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt={staff.name}
                  className="h-12 w-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{staff.name}</h3>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                      staff.role === 'WARDEN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {staff.role === 'WARDEN' ? 'Hostel Warden' : staff.staffRole || 'Facility Staff'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{staff.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{staff.phone || '+91 98404 55678'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Wrench className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>On-Campus Duty: 24x7 Shift</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle className="h-3.5 w-3.5" />
                Active On Duty
              </span>
              <span className="text-slate-400 font-mono">ID: {staff.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add New Staff Member</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="mt-4 text-xs text-slate-600">
              Staff members and wardens are automatically linked to the authentication and task assignment engine.
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
