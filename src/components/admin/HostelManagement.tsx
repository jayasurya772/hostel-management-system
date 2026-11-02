import React, { useState, useEffect } from 'react';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  Users,
  BedDouble,
  Shield,
  Phone,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { HostelBuilding } from '../../types';
import { getHostels, saveHostel, getRooms, subscribeToStorage } from '../../services/storage';

export const HostelManagement: React.FC = () => {
  const [hostels, setHostels] = useState<HostelBuilding[]>(getHostels());
  const [rooms, setRooms] = useState(getRooms());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<HostelBuilding | null>(null);

  const initialForm: HostelBuilding = {
    id: '',
    name: '',
    code: '',
    gender: 'Boys',
    totalFloors: 3,
    totalRooms: 30,
    totalBeds: 60,
    wardenName: '',
    wardenContact: '',
    caretakerName: '',
  };

  const [formData, setFormData] = useState<HostelBuilding>(initialForm);

  useEffect(() => {
    const refresh = () => {
      setHostels(getHostels());
      setRooms(getRooms());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const handleOpenAdd = () => {
    setEditingHostel(null);
    setFormData({
      ...initialForm,
      id: `hostel-${Date.now()}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h: HostelBuilding) => {
    setEditingHostel(h);
    setFormData({ ...h });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    saveHostel(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Buildings & Blocks</h1>
          <p className="text-xs text-slate-500">
            Configure residential blocks, floor architecture, assigned wardens and capacity.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Hostel Block</span>
        </button>
      </div>

      {/* Buildings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hostels.map((h) => {
          const hostelRooms = rooms.filter((r) => r.hostelId === h.id);
          const occupied = hostelRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
          const total = hostelRooms.reduce((acc, r) => acc + r.capacity, 0) || h.totalBeds;
          const pct = Math.round((occupied / (total || 1)) * 100);

          return (
            <div
              key={h.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        h.gender === 'Boys'
                          ? 'bg-blue-100 text-blue-800'
                          : h.gender === 'Girls'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {h.gender} Hostel • {h.code}
                    </span>
                    <h2 className="mt-2 text-base font-bold text-slate-900">{h.name}</h2>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(h)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Floors</div>
                    <div className="mt-0.5 font-bold text-slate-800">{h.totalFloors}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Rooms</div>
                    <div className="mt-0.5 font-bold text-slate-800">{h.totalRooms}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Beds</div>
                    <div className="mt-0.5 font-bold text-slate-800">{h.totalBeds}</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Occupancy ({occupied}/{total} Beds)</span>
                    <span className="font-bold text-slate-900">{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct > 80 ? 'bg-indigo-600' : pct > 50 ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Staff Contacts */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Hostel Warden:</span>
                    <span className="font-semibold text-slate-800">{h.wardenName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <span className="font-mono text-slate-700">{h.wardenContact}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Caretaker:</span>
                    <span className="text-slate-800 font-medium">{h.caretakerName || 'Mr. Murugan'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">
                {editingHostel ? 'Edit Hostel Building' : 'Add New Hostel Building'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Building Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. CV Raman Research Hostel"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Block Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. CVR-D"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Co-ed">Co-ed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floors</label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rooms</label>
                  <input
                    type="number"
                    value={formData.totalRooms}
                    onChange={(e) => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Beds</label>
                  <input
                    type="number"
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hostel Warden Name</label>
                <input
                  type="text"
                  value={formData.wardenName}
                  onChange={(e) => setFormData({ ...formData, wardenName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warden Emergency Phone</label>
                <input
                  type="text"
                  value={formData.wardenContact}
                  onChange={(e) => setFormData({ ...formData, wardenContact: e.target.value })}
                  placeholder="+91 98401 22345"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
                >
                  Save Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
