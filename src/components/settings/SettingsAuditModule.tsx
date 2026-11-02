import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldAlert,
  History,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  FileText,
  Search,
} from 'lucide-react';
import { ActivityLog } from '../../types';
import {
  getActivityLogs,
  resetDemoData,
  subscribeToStorage,
  getCurrentUser,
} from '../../services/storage';

export const SettingsAuditModule: React.FC = () => {
  const currentUser = getCurrentUser();
  const [logs, setLogs] = useState<ActivityLog[]>(getActivityLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const refresh = () => setLogs(getActivityLogs());
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || l.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleReset = () => {
    if (confirm('Restore default Smart Hostel institutional seed database?')) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleExportBackup = () => {
    const backup: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('smarthostel_')) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartHostel_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Audit Log</h1>
          <p className="text-xs text-slate-500">
            Administrative action audit trail, data management, rules enforcement and institutional policies.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON Database</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {resetSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Demo database restored successfully with original student, room and payment seed records.</span>
        </div>
      )}

      {/* Security & Access Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-indigo-600" />
          <span>Role-Based Access Control (RBAC) Architecture</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          The SMART HOSTEL engine enforces strict separation of responsibilities between Super Administrators, Wardens, Student Residents, and Facility Staff. All state mutations trigger persistent audit logs with cryptographic transaction tokens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="rounded-xl bg-purple-50 border border-purple-200 p-3">
            <span className="font-bold text-purple-950 block">Super Administrator</span>
            <span className="text-[11px] text-purple-800">Unrestricted institutional governance, admissions, room allocations and financial oversight.</span>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
            <span className="font-bold text-blue-950 block">Hostel Warden</span>
            <span className="text-[11px] text-blue-800">Daily roll call, outstation leave authorization, visitor validation and disciplinary notices.</span>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <span className="font-bold text-emerald-950 block">Resident Student</span>
            <span className="text-[11px] text-emerald-800">Personal room access, leave applications, grievance reporting, QR passes, and fee settlement.</span>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <span className="font-bold text-amber-950 block">Maintenance Staff</span>
            <span className="text-[11px] text-amber-800">Work orders queue, tool inventory, on-site repairs, and parts replenishment logging.</span>
          </div>
        </div>
      </div>

      {/* Audit Logs Filter & Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <History className="h-4 w-4 text-slate-500" />
            <span>Administrative Audit Log ({filteredLogs.length} events)</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search action or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs w-48 focus:outline-hidden"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-white text-slate-800 focus:outline-hidden"
            >
              <option value="All">All Categories</option>
              <option value="Student">Student Admissions</option>
              <option value="Room">Room Allocation</option>
              <option value="Leave">Leave Approvals</option>
              <option value="Visitor">Visitor Passes</option>
              <option value="Complaint">Complaints</option>
              <option value="Fee">Fee Payments</option>
              <option value="System">System Changes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Action Performed</th>
                <th className="py-3 px-3">Actor / Performed By</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-4">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{log.action}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{log.performedBy}</div>
                    <div className="text-[10px] text-slate-400">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
