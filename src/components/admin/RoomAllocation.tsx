import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Plus,
  ArrowRightLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Shield,
  Search,
} from 'lucide-react';
import { Room, RoomStatus, RoomType, Student, HostelBuilding } from '../../types';
import {
  getRooms,
  saveRoom,
  getStudents,
  getHostels,
  allocateBedToStudent,
  subscribeToStorage,
} from '../../services/storage';

export const RoomAllocation: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(getRooms());
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [hostels, setHostels] = useState<HostelBuilding[]>(getHostels());

  // Filters
  const [selectedHostel, setSelectedHostel] = useState<string>('All');
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Modals
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBedNumber, setSelectedBedNumber] = useState<string>('Bed 1');

  // Form states
  const [allocateStudentId, setAllocateStudentId] = useState('');
  const [transferStudentId, setTransferStudentId] = useState('');
  const [transferTargetRoomId, setTransferTargetRoomId] = useState('');
  const [transferTargetBed, setTransferTargetBed] = useState('Bed 1');
  const [modalError, setModalError] = useState('');

  // New Room Form
  const [newRoomData, setNewRoomData] = useState<{
    hostelId: string;
    roomNumber: string;
    floorNumber: number;
    type: RoomType;
    capacity: number;
    hasAC: boolean;
    hasAttachedWashroom: boolean;
  }>({
    hostelId: hostels[0]?.id || '',
    roomNumber: 'A-301',
    floorNumber: 3,
    type: 'Double',
    capacity: 2,
    hasAC: true,
    hasAttachedWashroom: true,
  });

  useEffect(() => {
    const refresh = () => {
      setRooms(getRooms());
      setStudents(getStudents());
      setHostels(getHostels());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  const filteredRooms = rooms.filter((r) => {
    const matchesHostel = selectedHostel === 'All' || r.hostelId === selectedHostel;
    const matchesFloor = selectedFloor === 'All' || r.floorNumber.toString() === selectedFloor;
    const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchesHostel && matchesFloor && matchesStatus;
  });

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return 'border-emerald-300 bg-emerald-50/70 text-emerald-800';
      case 'Partially Occupied':
        return 'border-amber-300 bg-amber-50/70 text-amber-800';
      case 'Fully Occupied':
        return 'border-red-300 bg-red-50/70 text-red-800';
      case 'Maintenance':
        return 'border-slate-300 bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500 text-white';
      case 'Partially Occupied':
        return 'bg-amber-500 text-white';
      case 'Fully Occupied':
        return 'bg-red-500 text-white';
      case 'Maintenance':
        return 'bg-slate-500 text-white';
    }
  };

  const handleOpenAllocate = (room: Room, bedNumber: string) => {
    setSelectedRoom(room);
    setSelectedBedNumber(bedNumber);
    // Find unallocated or active students
    const unallocated = students.filter((s) => !s.roomId || s.roomId !== room.id);
    if (unallocated.length > 0) {
      setAllocateStudentId(unallocated[0].id);
    }
    setModalError('');
    setIsAllocateModalOpen(true);
  };

  const handleConfirmAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !allocateStudentId) return;

    try {
      allocateBedToStudent(allocateStudentId, selectedRoom.id, selectedBedNumber);
      setIsAllocateModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to allocate bed');
    }
  };

  const handleOpenTransfer = (student: Student) => {
    setTransferStudentId(student.id);
    const availableTargets = rooms.filter((r) => r.id !== student.roomId && r.status !== 'Fully Occupied' && r.status !== 'Maintenance');
    if (availableTargets.length > 0) {
      setTransferTargetRoomId(availableTargets[0].id);
      const emptyBed = availableTargets[0].beds.find((b) => !b.isOccupied);
      setTransferTargetBed(emptyBed ? emptyBed.bedNumber : 'Bed 1');
    }
    setModalError('');
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferStudentId || !transferTargetRoomId) return;

    try {
      allocateBedToStudent(transferStudentId, transferTargetRoomId, transferTargetBed);
      setIsTransferModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to transfer student');
    }
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const hostel = hostels.find((h) => h.id === newRoomData.hostelId);
    const capacity =
      newRoomData.type === 'Single'
        ? 1
        : newRoomData.type === 'Double'
        ? 2
        : newRoomData.type === 'Triple'
        ? 3
        : 4;

    const beds = Array.from({ length: capacity }, (_, i) => ({
      bedNumber: `Bed ${i + 1}`,
      isOccupied: false,
    }));

    const newRoom: Room = {
      id: `rm-${Date.now()}`,
      hostelId: newRoomData.hostelId,
      hostelName: hostel ? hostel.name : 'Main Block',
      floorNumber: newRoomData.floorNumber,
      roomNumber: newRoomData.roomNumber,
      type: newRoomData.type,
      capacity,
      occupiedBeds: 0,
      status: 'Available',
      beds,
      hasAC: newRoomData.hasAC,
      hasAttachedWashroom: newRoomData.hasAttachedWashroom,
    };

    saveRoom(newRoom);
    setIsAddRoomModalOpen(false);
  };

  // Metrics
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Room & Bed Allocation Management</h1>
          <p className="text-xs text-slate-500">
            Live interactive floor plan, individual bed slots, and anti-duplicate transfer engine.
          </p>
        </div>
        <button
          onClick={() => setIsAddRoomModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Visual Status Legend & Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              Available
            </span>
            <span className="font-bold text-emerald-800 text-sm">
              {rooms.filter((r) => r.status === 'Available').length} Rooms
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700">{availableBeds} beds ready for immediate check-in</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              Partially Occupied
            </span>
            <span className="font-bold text-amber-800 text-sm">
              {rooms.filter((r) => r.status === 'Partially Occupied').length} Rooms
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700">Has empty bed vacancies available</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-red-900 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
              Fully Occupied
            </span>
            <span className="font-bold text-red-800 text-sm">
              {rooms.filter((r) => r.status === 'Fully Occupied').length} Rooms
            </span>
          </div>
          <div className="mt-2 text-[11px] text-red-700">{occupiedBeds} students assigned</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
              Maintenance
            </span>
            <span className="font-bold text-slate-800 text-sm">
              {rooms.filter((r) => r.status === 'Maintenance').length} Rooms
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600">Under sanitization / repairs</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Filter className="h-4 w-4" />
            <span>Filter By:</span>
          </div>

          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-800 focus:outline-hidden"
          >
            <option value="All">All Hostel Blocks</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-800 focus:outline-hidden"
          >
            <option value="All">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 bg-white text-slate-800 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available (Green)</option>
            <option value="Partially Occupied">Partially Occupied (Orange)</option>
            <option value="Fully Occupied">Fully Occupied (Red)</option>
            <option value="Maintenance">Maintenance (Grey)</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Showing {filteredRooms.length} of {rooms.length} rooms
        </div>
      </div>

      {/* Visual Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className={`rounded-2xl border-2 p-5 shadow-xs transition-all ${getStatusColor(room.status)} bg-white`}
          >
            {/* Room Card Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{room.roomNumber}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(room.status)}`}>
                    {room.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Floor {room.floorNumber} • {room.type} ({room.occupiedBeds}/{room.capacity} Occupied)
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold text-slate-500 block">
                  {room.hasAC ? 'AC Room' : 'Non-AC'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {room.hasAttachedWashroom ? 'Attached Bath' : 'Common Bath'}
                </span>
              </div>
            </div>

            {/* Bed Slots Visualizer */}
            <div className="mt-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Bed Layout & Occupants
              </div>

              <div className="grid grid-cols-1 gap-2">
                {room.beds.map((bed, idx) => {
                  const student = bed.studentId ? students.find((s) => s.id === bed.studentId) : null;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                        bed.isOccupied
                          ? 'border-slate-200 bg-slate-50 text-slate-800'
                          : 'border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            bed.isOccupied ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          <BedDouble className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {bed.bedNumber}
                            {bed.isOccupied ? (
                              <span className="ml-2 font-normal text-slate-700">
                                {bed.studentName || student?.name}
                              </span>
                            ) : (
                              <span className="ml-2 text-emerald-600 font-normal italic">Vacant</span>
                            )}
                          </div>
                          {student && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              {student.collegeRegNo} • {student.department.split(' ')[0]}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div>
                        {bed.isOccupied && student ? (
                          <button
                            onClick={() => handleOpenTransfer(student)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs flex items-center gap-1"
                            title="Transfer student to another room"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            <span>Transfer</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenAllocate(room, bed.bedNumber)}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 shadow-2xs"
                          >
                            Allocate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Allocate Bed Modal */}
      {isAllocateModalOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold">
                  Allocate {selectedRoom.roomNumber} ({selectedBedNumber})
                </h2>
              </div>
              <button onClick={() => setIsAllocateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAllocation} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student to Allocate *</label>
                <select
                  value={allocateStudentId}
                  onChange={(e) => setAllocateStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.collegeRegNo}) - Currently in {s.roomNumber || 'No Room'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-slate-600 space-y-1">
                <div>Hostel: <span className="font-semibold text-slate-800">{selectedRoom.hostelName}</span></div>
                <div>Room Number: <span className="font-semibold text-slate-800">{selectedRoom.roomNumber}</span></div>
                <div>Bed Slot: <span className="font-semibold text-slate-800">{selectedBedNumber}</span></div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Student Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold">Transfer Student Room</h2>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="rounded-xl bg-red-50 p-3 text-red-700 border border-red-200">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 font-bold text-slate-800">
                  {students.find((s) => s.id === transferStudentId)?.name} (
                  {students.find((s) => s.id === transferStudentId)?.roomNumber})
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Destination Room *</label>
                <select
                  value={transferTargetRoomId}
                  onChange={(e) => {
                    setTransferTargetRoomId(e.target.value);
                    const target = rooms.find((r) => r.id === e.target.value);
                    const empty = target?.beds.find((b) => !b.isOccupied);
                    setTransferTargetBed(empty ? empty.bedNumber : 'Bed 1');
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                >
                  {rooms
                    .filter((r) => r.status !== 'Fully Occupied' && r.status !== 'Maintenance')
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} ({r.type} - {r.occupiedBeds}/{r.capacity} Occupied) - Floor {r.floorNumber}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Bed Slot *</label>
                <select
                  value={transferTargetBed}
                  onChange={(e) => setTransferTargetBed(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="Bed 1">Bed 1</option>
                  <option value="Bed 2">Bed 2</option>
                  <option value="Bed 3">Bed 3</option>
                  <option value="Bed 4">Bed 4</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Complete Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
              <h2 className="text-base font-bold">Add New Room</h2>
              <button onClick={() => setIsAddRoomModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hostel Block *</label>
                <select
                  value={newRoomData.hostelId}
                  onChange={(e) => setNewRoomData({ ...newRoomData, hostelId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                >
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    value={newRoomData.roomNumber}
                    onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })}
                    placeholder="e.g. A-301"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor *</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={newRoomData.floorNumber}
                    onChange={(e) => setNewRoomData({ ...newRoomData, floorNumber: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Sharing Type *</label>
                <select
                  value={newRoomData.type}
                  onChange={(e) => setNewRoomData({ ...newRoomData, type: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800"
                >
                  <option value="Single">Single (1 Bed)</option>
                  <option value="Double">Double (2 Beds)</option>
                  <option value="Triple">Triple (3 Beds)</option>
                  <option value="Four Sharing">Four Sharing (4 Beds)</option>
                </select>
              </div>

              <div className="flex items-center gap-4 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRoomData.hasAC}
                    onChange={(e) => setNewRoomData({ ...newRoomData, hasAC: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Air Conditioned (AC)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRoomData.hasAttachedWashroom}
                    onChange={(e) =>
                      setNewRoomData({ ...newRoomData, hasAttachedWashroom: e.target.checked })
                    }
                    className="rounded text-indigo-600"
                  />
                  <span>Attached Washroom</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
