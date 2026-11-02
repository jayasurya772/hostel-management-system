import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  BedDouble,
  UserCheck,
  PlaneTakeoff,
  AlertCircle,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  CalendarCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  getStudents,
  getRooms,
  getHostels,
  getAttendance,
  getLeaveRequests,
  getComplaints,
  getFeeRecords,
  getVisitors,
  subscribeToStorage,
} from '../../services/storage';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AdminDashboardProps {
  onNavigate: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState({
    students: getStudents(),
    rooms: getRooms(),
    hostels: getHostels(),
    attendance: getAttendance(),
    leaves: getLeaveRequests(),
    complaints: getComplaints(),
    fees: getFeeRecords(),
    visitors: getVisitors(),
  });

  useEffect(() => {
    const refresh = () => {
      setData({
        students: getStudents(),
        rooms: getRooms(),
        hostels: getHostels(),
        attendance: getAttendance(),
        leaves: getLeaveRequests(),
        complaints: getComplaints(),
        fees: getFeeRecords(),
        visitors: getVisitors(),
      });
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  // Compute metrics
  const totalStudents = data.students.length;
  const totalRooms = data.rooms.length;
  const totalBeds = data.rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = data.rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Attendance metrics today
  const today = '2026-11-02';
  const todayAttendance = data.attendance.filter((a) => a.date === today);
  const presentCount = todayAttendance.filter((a) => a.status === 'Present').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'Absent').length;
  const onLeaveCount = todayAttendance.filter((a) => a.status === 'On Leave').length;
  const attendanceRate =
    todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 92;

  // Pending Actions
  const pendingLeaves = data.leaves.filter((l) => l.status === 'Pending').length;
  const pendingComplaints = data.complaints.filter((c) => c.status === 'Submitted' || c.status === 'In Progress').length;
  const activeVisitors = data.visitors.filter((v) => v.status === 'Checked In').length;

  // Fee totals
  const totalFeesDue = data.fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalFeesPaid = data.fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalFeesPending = data.fees.reduce((acc, f) => acc + f.pendingAmount, 0);

  // Recharts Data
  const roomStatusData = [
    { name: 'Available', value: data.rooms.filter((r) => r.status === 'Available').length, color: '#10b981' },
    { name: 'Partial', value: data.rooms.filter((r) => r.status === 'Partially Occupied').length, color: '#f59e0b' },
    { name: 'Fully Occupied', value: data.rooms.filter((r) => r.status === 'Fully Occupied').length, color: '#ef4444' },
    { name: 'Maintenance', value: data.rooms.filter((r) => r.status === 'Maintenance').length, color: '#64748b' },
  ];

  const departmentData = [
    { dept: 'IT', students: data.students.filter((s) => s.department.includes('Information')).length },
    { dept: 'CSE', students: data.students.filter((s) => s.department.includes('Computer')).length },
    { dept: 'Mech', students: data.students.filter((s) => s.department.includes('Mechanical')).length },
    { dept: 'ECE', students: data.students.filter((s) => s.department.includes('Electronics')).length },
    { dept: 'Civil', students: data.students.filter((s) => s.department.includes('Civil')).length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Summary Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-400/30">
              Campus Central Operations
            </span>
            <span className="text-xs text-slate-400">Academic Term 2026-27</span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Institutional Hostel Overview</h1>
          <p className="mt-1 text-xs text-slate-300 max-w-xl">
            Real-time command center synchronizing student admissions, biometric roll call, bed availability, visitor passes, and maintenance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigate('students')}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Admit Student</span>
          </button>
          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors border border-white/10"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Daily Roll Call</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Registered Students</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalStudents}</span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="h-3 w-3" /> 100% active
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Across 3 hostel blocks</div>
        </div>

        {/* Room Occupancy */}
        <div
          onClick={() => onNavigate('rooms')}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bed Occupancy Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <BedDouble className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{occupancyRate}%</span>
            <span className="text-[11px] text-slate-500">
              ({occupiedBeds}/{totalBeds} Beds)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">{availableBeds} beds available</div>
        </div>

        {/* Daily Attendance Rate */}
        <div
          onClick={() => onNavigate('attendance')}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Daily Attendance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{attendanceRate}%</span>
            <span className="text-[11px] text-red-600 font-semibold">{absentCount} Absent</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {presentCount} Present • {onLeaveCount} On Leave
          </div>
        </div>

        {/* Fee Collection */}
        <div
          onClick={() => onNavigate('fees')}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Fee Collection</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">₹{(totalFeesPaid / 100000).toFixed(1)}L</span>
            <span className="text-[11px] text-slate-500">of ₹{(totalFeesDue / 100000).toFixed(1)}L</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            Pending: ₹{(totalFeesPending / 1000).toFixed(0)}k
          </div>
        </div>
      </div>

      {/* Actionable Alerts Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          onClick={() => onNavigate('leave')}
          className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 hover:bg-amber-100/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-200/80 text-amber-900">
              <PlaneTakeoff className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">Pending Leave Approvals</div>
              <div className="text-[11px] text-amber-800">{pendingLeaves} applications awaiting warden review</div>
            </div>
          </div>
          <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-900">
            {pendingLeaves}
          </span>
        </div>

        <div
          onClick={() => onNavigate('complaints')}
          className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/70 p-3.5 hover:bg-red-100/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-200/80 text-red-900">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-950">Active Maintenance Tickets</div>
              <div className="text-[11px] text-red-800">{pendingComplaints} unresolved hostel complaints</div>
            </div>
          </div>
          <span className="rounded-full bg-red-200 px-2.5 py-0.5 text-xs font-bold text-red-900">
            {pendingComplaints}
          </span>
        </div>

        <div
          onClick={() => onNavigate('visitors')}
          className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 hover:bg-blue-100/70 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-200/80 text-blue-900">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950">Active Campus Visitors</div>
              <div className="text-[11px] text-blue-800">{activeVisitors} visitors currently on premises</div>
            </div>
          </div>
          <span className="rounded-full bg-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-900">
            {activeVisitors}
          </span>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Status Breakdown Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Room Availability Status</h3>
              <p className="text-[11px] text-slate-500">Live allocation across all floors</p>
            </div>
            <button
              onClick={() => onNavigate('rooms')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage Rooms &rarr;
            </button>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Resident Students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Students by Academic Department</h3>
              <p className="text-[11px] text-slate-500">Hostel residency distribution</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Full Analytics &rarr;
            </button>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="students" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Buildings Quick Status Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Hostel Blocks Status</h3>
            <p className="text-[11px] text-slate-500">Wardens, total capacity and floor occupancy</p>
          </div>
          <button
            onClick={() => onNavigate('hostels')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Configure Blocks &rarr;
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Hostel Block</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Floors</th>
                <th className="py-2.5 px-3">Assigned Warden</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Total Beds</th>
                <th className="py-2.5 px-3">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data.hostels.map((hostel) => (
                <tr key={hostel.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-semibold text-slate-900">{hostel.name}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                        hostel.gender === 'Boys'
                          ? 'bg-blue-100 text-blue-800'
                          : hostel.gender === 'Girls'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {hostel.gender}
                    </span>
                  </td>
                  <td className="py-3 px-3">{hostel.totalFloors} Floors</td>
                  <td className="py-3 px-3 font-medium text-slate-800">{hostel.wardenName}</td>
                  <td className="py-3 px-3 text-slate-500">{hostel.wardenContact}</td>
                  <td className="py-3 px-3">{hostel.totalBeds} Beds</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((hostel.totalRooms * 2) / (hostel.totalBeds || 1) * 100))}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-700">Active</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
