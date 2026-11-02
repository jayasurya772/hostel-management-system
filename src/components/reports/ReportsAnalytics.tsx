import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Users,
  Building,
  BedDouble,
  CreditCard,
  MessageSquareWarning,
  TrendingUp,
  FileSpreadsheet,
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { exportToCSV, printElement } from '../../utils/export';

export const ReportsAnalytics: React.FC = () => {
  const [students, setStudents] = useState(getStudents());
  const [rooms, setRooms] = useState(getRooms());
  const [hostels, setHostels] = useState(getHostels());
  const [attendance, setAttendance] = useState(getAttendance());
  const [complaints, setComplaints] = useState(getComplaints());
  const [feeRecords, setFeeRecords] = useState(getFeeRecords());
  const [visitors, setVisitors] = useState(getVisitors());

  useEffect(() => {
    const refresh = () => {
      setStudents(getStudents());
      setRooms(getRooms());
      setHostels(getHostels());
      setAttendance(getAttendance());
      setComplaints(getComplaints());
      setFeeRecords(getFeeRecords());
      setVisitors(getVisitors());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  // Compute key figures
  const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
  const occupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const totalFeesDue = feeRecords.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalFeesPaid = feeRecords.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalFeesPending = feeRecords.reduce((acc, f) => acc + f.pendingAmount, 0);

  // Recharts: Monthly Attendance Trends
  const attendanceTrends = [
    { month: 'Jun', attendanceRate: 94 },
    { month: 'Jul', attendanceRate: 91 },
    { month: 'Aug', attendanceRate: 96 },
    { month: 'Sep', attendanceRate: 88 },
    { month: 'Oct', attendanceRate: 93 },
    { month: 'Nov (Current)', attendanceRate: 95 },
  ];

  // Recharts: Occupancy Distribution
  const occupancyData = [
    { name: 'Occupied Beds', value: occupiedBeds, color: '#4f46e5' },
    { name: 'Vacant Available Beds', value: totalBeds - occupiedBeds, color: '#10b981' },
    { name: 'Maintenance Beds', value: rooms.filter((r) => r.status === 'Maintenance').reduce((a, b) => a + b.capacity, 0), color: '#94a3b8' },
  ];

  // Recharts: Complaint categories
  const complaintCategories = [
    { cat: 'Electrical', count: complaints.filter((c) => c.category === 'Electrical').length },
    { cat: 'Plumbing', count: complaints.filter((c) => c.category === 'Plumbing').length },
    { cat: 'Wi-Fi', count: complaints.filter((c) => c.category === 'Wi-Fi').length },
    { cat: 'Cleaning', count: complaints.filter((c) => c.category === 'Cleaning').length },
    { cat: 'Furniture', count: complaints.filter((c) => c.category === 'Furniture').length },
    { cat: 'Water', count: complaints.filter((c) => c.category === 'Water Supply').length },
  ];

  // Fee distribution
  const feeStatusData = [
    { name: 'Collected', value: totalFeesPaid, color: '#10b981' },
    { name: 'Pending Balance', value: totalFeesPending, color: '#f59e0b' },
  ];

  const handleExportFullCSV = () => {
    const rows = students.map((s) => ({
      'Student ID': s.studentId,
      'College Reg No': s.collegeRegNo,
      Name: s.name,
      Department: s.department,
      Year: s.yearOfStudy,
      Hostel: s.hostelName,
      Room: s.roomNumber,
      Bed: s.bedNumber,
      Status: s.status,
      Mobile: s.phone,
      'Parent Contact': s.parentPhone,
    }));
    exportToCSV('Institutional_Hostel_Master_Report', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Reports & Analytics</h1>
          <p className="text-xs text-slate-500">
            Real-time business intelligence, hostel occupancy metrics, attendance trends and audit summaries.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => printElement('printable-report')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print Analytics Report</span>
          </button>
          <button
            onClick={handleExportFullCSV}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" />
            <span>Export Master CSV</span>
          </button>
        </div>
      </div>

      <div id="printable-report" className="space-y-6">
        {/* KPI Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Capacity</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{totalBeds} Beds</div>
            <div className="text-[11px] text-slate-500">{rooms.length} Rooms Across {hostels.length} Blocks</div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-indigo-700 uppercase">Occupancy Rate</span>
            <div className="mt-1 text-2xl font-bold text-indigo-900">{occupancyPct}%</div>
            <div className="text-[11px] text-indigo-700">{occupiedBeds} occupied / {totalBeds - occupiedBeds} available</div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-emerald-700 uppercase">Fee Realization</span>
            <div className="mt-1 text-2xl font-bold text-emerald-900">
              ₹{(totalFeesPaid / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] text-emerald-700">₹{(totalFeesPending / 1000).toFixed(0)}k Pending</div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
            <span className="text-[10px] font-semibold text-amber-700 uppercase">Service Complaints</span>
            <div className="mt-1 text-2xl font-bold text-amber-900">{complaints.length} Tickets</div>
            <div className="text-[11px] text-amber-700">
              {complaints.filter((c) => c.status === 'Resolved').length} Resolved
            </div>
          </div>
        </div>

        {/* Visual Charts Grid 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Attendance Trend */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">6-Month Attendance Percentage Trends</h3>
              <p className="text-[11px] text-slate-500">Average resident presence across terms</p>
            </div>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[75, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="attendanceRate"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Room Occupancy Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Bed Allocation Breakdown</h3>
              <p className="text-[11px] text-slate-500">Proportion of occupied, vacant and maintenance beds</p>
            </div>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Visual Charts Grid 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaints by Category */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Maintenance Issues by Category</h3>
              <p className="text-[11px] text-slate-500">Volume of repairs requested by residents</p>
            </div>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complaintCategories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="cat" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fee Collection Statistics */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Hostel Revenue Collection vs Pending</h3>
              <p className="text-[11px] text-slate-500">Total fees realized vs outstanding student accounts</p>
            </div>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feeStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ₹${(value / 1000).toFixed(0)}k`}
                  >
                    {feeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Hostels Summary Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Hostel Occupancy & Warden Audit Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Hostel Block</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Total Floors</th>
                  <th className="py-2.5 px-3">Total Rooms</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3">Warden</th>
                  <th className="py-2.5 px-3">Emergency Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {hostels.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-bold text-slate-900">{h.name}</td>
                    <td className="py-3 px-3">{h.gender}</td>
                    <td className="py-3 px-3">{h.totalFloors}</td>
                    <td className="py-3 px-3">{h.totalRooms}</td>
                    <td className="py-3 px-3 font-semibold">{h.totalBeds} Beds</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{h.wardenName}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{h.wardenContact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
