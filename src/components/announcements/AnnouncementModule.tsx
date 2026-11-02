import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  AlertCircle,
  Bell,
  Trash2,
  Calendar,
  User,
  X,
  Filter,
} from 'lucide-react';
import { Announcement } from '../../types';
import {
  getAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  getCurrentUser,
  subscribeToStorage,
} from '../../services/storage';

export const AnnouncementModule: React.FC = () => {
  const currentUser = getCurrentUser();
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    content: string;
    targetRole: Announcement['targetRole'];
    priority: Announcement['priority'];
    hostelScope: string;
  }>({
    title: '',
    content: '',
    targetRole: 'All',
    priority: 'Normal',
    hostelScope: 'All Hostels',
  });

  useEffect(() => {
    const refresh = () => setAnnouncements(getAnnouncements());
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const filteredAnnouncements = announcements.filter((a) => {
    if (roleFilter !== 'All' && a.targetRole !== 'All' && a.targetRole !== roleFilter) {
      return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAnn: Announcement = {
      id: `anc-${Date.now()}`,
      title: form.title,
      content: form.content,
      targetRole: form.targetRole,
      priority: form.priority,
      hostelScope: form.hostelScope,
      postedByName: currentUser.name,
      postedByRole: currentUser.role,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    saveAnnouncement(newAnn);
    setIsModalOpen(false);
    setForm({
      title: '',
      content: '',
      targetRole: 'All',
      priority: 'Normal',
      hostelScope: 'All Hostels',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this announcement?')) {
      deleteAnnouncement(id);
    }
  };

  const getPriorityBadge = (p: Announcement['priority']) => {
    switch (p) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Info':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Notice Board & Circulars</h1>
          <p className="text-xs text-slate-500">
            Publish institutional notices, curfew revisions, maintenance windows, and festival celebrations.
          </p>
        </div>
        {currentUser.role !== 'STUDENT' && currentUser.role !== 'STAFF' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Publish Circular</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['All', 'Students', 'Wardens', 'Staff'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              roleFilter === r
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {r} Circulars
          </button>
        ))}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
            No active notices for the selected audience.
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all bg-white ${
                ann.priority === 'Urgent' ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getPriorityBadge(ann.priority)}`}>
                      {ann.priority} Priority
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      Target: {ann.targetRole}
                    </span>
                    <span className="text-xs text-slate-400">• Scope: {ann.hostelScope}</span>
                    <span className="text-xs text-slate-400">• Posted {ann.createdAt}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">{ann.content}</p>

                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      Posted by: <strong className="text-slate-800">{ann.postedByName}</strong> ({ann.postedByRole})
                    </span>
                  </div>
                </div>

                {currentUser.role === 'SUPER_ADMIN' && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                    title="Delete Announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold">Publish Hostel Notice Circular</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Headline *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Curfew Revision for Semester Exams"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Circular Content *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Type the full official notice details..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience *</label>
                  <select
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="All">All Inmates & Staff</option>
                    <option value="Students">Students Only</option>
                    <option value="Wardens">Wardens Only</option>
                    <option value="Staff">Staff Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="Normal">Normal Notice</option>
                    <option value="Urgent">Urgent / Alert</option>
                    <option value="Info">Informational</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hostel Scope *</label>
                  <select
                    value={form.hostelScope}
                    onChange={(e) => setForm({ ...form, hostelScope: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="All Hostels">All Hostels</option>
                    <option value="Aryabhatta Boys Hostel (Block A)">Block A Only</option>
                    <option value="Kalpana Chawla Girls Hostel (Block B)">Block B Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Broadcast Circular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
