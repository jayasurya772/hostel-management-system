import React, { useState, useEffect } from 'react';
import {
  User,
  BedDouble,
  CalendarCheck,
  PlaneTakeoff,
  UserCheck,
  MessageSquareWarning,
  UtensilsCrossed,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Student, Room, LeaveRequest, Complaint, DayMessMenu, FeeRecord } from '../../types';
import {
  getStudents,
  getRooms,
  getLeaveRequests,
  getComplaints,
  getMessMenu,
  getFeeRecords,
  getAttendance,
  getCurrentUser,
  subscribeToStorage,
} from '../../services/storage';

interface StudentDashboardProps {
  onNavigate: (tabId: string) => void;
  onOpenSOS: () => void;
  onOpenRules: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenSOS,
  onOpenRules,
}) => {
  const currentUser = getCurrentUser();
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [rooms, setRooms] = useState<Room[]>(getRooms());
  const [leaves, setLeaves] = useState<LeaveRequest[]>(getLeaveRequests());
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [menus, setMenus] = useState<DayMessMenu[]>(getMessMenu());
  const [fees, setFees] = useState<FeeRecord[]>(getFeeRecords());
  const [attendance, setAttendance] = useState(getAttendance());

  useEffect(() => {
    const refresh = () => {
      setStudents(getStudents());
      setRooms(getRooms());
      setLeaves(getLeaveRequests());
      setComplaints(getComplaints());
      setMenus(getMessMenu());
      setFees(getFeeRecords());
      setAttendance(getAttendance());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  // Find active student record
  const student = students.find((s) => s.id === currentUser.studentId) || students[0];
  const room = rooms.find((r) => r.id === student?.roomId);
  const myLeaves = leaves.filter((l) => l.studentId === student?.id);
  const myComplaints = complaints.filter((c) => c.studentId === student?.id);
  const myFee = fees.find((f) => f.studentId === student?.id) || fees[0];
  const myAttendance = attendance.filter((a) => a.studentId === student?.id);

  // Compute attendance percentage
  const totalMarkedDays = myAttendance.length || 1;
  const presentDays = myAttendance.filter((a) => a.status === 'Present').length;
  const attendancePct = Math.round((presentDays / totalMarkedDays) * 100);

  // Today's meal menu
  const todayMenu = menus[0]; // Monday

  // Roommates
  const roommates = students.filter(
    (s) => s.roomId === student?.roomId && s.id !== student?.id
  );

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={student?.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'}
              alt={student?.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-indigo-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold">{student?.name}</h1>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                  {student?.status} Resident
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-mono mt-0.5">
                Register No: {student?.collegeRegNo} • {student?.department} (Year {student?.yearOfStudy})
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Allocated: <strong className="text-white">{student?.hostelName}</strong> •{' '}
                <strong className="text-indigo-300">{student?.roomNumber} ({student?.bedNumber})</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>SOS Emergency</span>
            </button>
            <button
              onClick={onOpenRules}
              className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              Hostel Rules
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div
          onClick={() => onNavigate('student_attendance')}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Attendance Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{attendancePct}%</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Eligible for Term Exams</div>
        </div>

        {/* Room & Bed */}
        <div
          onClick={() => onNavigate('student_room')}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Bed Slot</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BedDouble className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-indigo-700">{student?.roomNumber}</div>
          <div className="mt-1 text-[11px] text-slate-500">{student?.bedNumber} • {roommates.length} Roommate(s)</div>
        </div>

        {/* Fee Dues */}
        <div
          onClick={() => onNavigate('student_fees')}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fee Status</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">
            {myFee.pendingAmount === 0 ? 'Cleared' : `₹${myFee.pendingAmount.toLocaleString()}`}
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            {myFee.pendingAmount === 0 ? 'Full semester paid' : `Due on ${myFee.dueDate}`}
          </div>
        </div>

        {/* Active Complaints */}
        <div
          onClick={() => onNavigate('student_complaints')}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Reported Tickets</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <MessageSquareWarning className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{myComplaints.length}</div>
          <div className="mt-1 text-[11px] text-slate-500">
            {myComplaints.filter((c) => c.status === 'Resolved').length} Resolved
          </div>
        </div>
      </div>

      {/* Main Resident Portal Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Roommates & Quick Outstation Request */}
        <div className="lg:col-span-2 space-y-6">
          {/* Roommates Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Room {student?.roomNumber} Resident Inmates</h3>
                <p className="text-[11px] text-slate-500">{student?.hostelName}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                {room?.type || 'Double Sharing'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* You */}
              <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
                <img
                  src={student?.photoUrl}
                  alt={student?.name}
                  className="h-10 w-10 rounded-full object-cover border border-indigo-200"
                />
                <div>
                  <div className="font-bold text-slate-900 text-xs">{student?.name} (You)</div>
                  <div className="text-[10px] text-indigo-700 font-semibold">{student?.bedNumber}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{student?.collegeRegNo}</div>
                </div>
              </div>

              {/* Roommates */}
              {roommates.map((rm) => (
                <div key={rm.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={rm.photoUrl}
                    alt={rm.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{rm.name}</div>
                    <div className="text-[10px] text-slate-600 font-semibold">{rm.bedNumber}</div>
                    <div className="text-[10px] text-slate-500">{rm.department.split(' ')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leave Requests */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Leave Passes</h3>
                <p className="text-[11px] text-slate-500">Track warden approvals & return confirmations</p>
              </div>
              <button
                onClick={() => onNavigate('student_leave')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Apply for Leave &rarr;
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {myLeaves.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No leave passes applied yet.</div>
              ) : (
                myLeaves.slice(0, 3).map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{l.leaveType}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            l.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {l.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {l.departureDate} &rarr; {l.expectedReturnDate} ({l.destination})
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400">#{l.id}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Mess Menu & Quick Actions */}
        <div className="space-y-6">
          {/* Today's Dining Highlights */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Mess Schedule</h3>
              </div>
              <button
                onClick={() => onNavigate('student_mess')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Full Menu &rarr;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="font-bold text-amber-900 text-[11px] uppercase">Breakfast (07:30 - 09:30 AM)</div>
                <p className="text-slate-700 mt-0.5">{todayMenu.breakfast}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="font-bold text-orange-900 text-[11px] uppercase">Lunch (12:30 - 02:30 PM)</div>
                <p className="text-slate-700 mt-0.5">{todayMenu.lunch}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <div className="font-bold text-indigo-900 text-[11px] uppercase">Dinner (07:30 - 09:30 PM)</div>
                <p className="text-slate-700 mt-0.5">{todayMenu.dinner}</p>
              </div>

              {todayMenu.specialDish && (
                <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-amber-900 flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Chef Special: {todayMenu.specialDish}</span>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Quick SOS Contacts */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Hostel Rapid Helpdesk</span>
            </div>
            <p className="text-xs text-red-800">
              In need of medical support or security assistance, reach out directly:
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-red-100">
                <span className="font-semibold text-slate-800">Campus Ambulance</span>
                <a href="tel:+919840010800" className="font-mono font-bold text-red-700">
                  +91 98400 10800
                </a>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-red-100">
                <span className="font-semibold text-slate-800">Hostel Warden Desk</span>
                <a href="tel:+919840233456" className="font-mono font-bold text-red-700">
                  +91 98402 33456
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
