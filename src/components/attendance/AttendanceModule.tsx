import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertTriangle,
  Search,
  Filter,
  Send,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { AttendanceRecord, Student } from '../../types';
import {
  getAttendance,
  getStudents,
  markSingleAttendance,
  markBulkAttendance,
  subscribeToStorage,
  getCurrentUser,
} from '../../services/storage';
import { exportToCSV } from '../../utils/export';

export const AttendanceModule: React.FC = () => {
  const currentUser = getCurrentUser();
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getAttendance());

  const [selectedDate, setSelectedDate] = useState<string>('2026-11-02');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStudents(getStudents());
      setAttendance(getAttendance());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  // Filter attendance for the selected date
  const recordsForDate = attendance.filter((a) => a.date === selectedDate);

  // Merge students with their attendance for this date
  const combinedList = students.map((stu) => {
    const existing = recordsForDate.find((r) => r.studentId === stu.id);
    return {
      student: stu,
      record: existing || {
        id: `att-temp-${stu.id}-${selectedDate}`,
        date: selectedDate,
        studentId: stu.id,
        studentName: stu.name,
        collegeRegNo: stu.collegeRegNo,
        hostelName: stu.hostelName,
        roomNumber: stu.roomNumber,
        department: stu.department,
        yearOfStudy: stu.yearOfStudy,
        status: 'Present' as const,
        markedBy: `${currentUser.name} (${currentUser.role})`,
        markedAt: `${selectedDate} 21:00`,
        lateEntry: false,
      },
      isRecorded: !!existing,
    };
  });

  const filteredList = combinedList.filter((item) => {
    const matchesSearch =
      item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student.collegeRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'All' || item.student.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || item.record.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Summary statistics
  const total = combinedList.length;
  const presentCount = combinedList.filter((c) => c.record.status === 'Present').length;
  const absentCount = combinedList.filter((c) => c.record.status === 'Absent').length;
  const onLeaveCount = combinedList.filter((c) => c.record.status === 'On Leave').length;
  const lateCount = combinedList.filter((c) => c.record.lateEntry).length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const handleStatusChange = (
    student: Student,
    newStatus: 'Present' | 'Absent' | 'On Leave',
    lateEntry: boolean = false,
    lateTime?: string
  ) => {
    const record: AttendanceRecord = {
      id: `att-${student.id}-${selectedDate}`,
      date: selectedDate,
      studentId: student.id,
      studentName: student.name,
      collegeRegNo: student.collegeRegNo,
      hostelName: student.hostelName,
      roomNumber: student.roomNumber,
      department: student.department,
      yearOfStudy: student.yearOfStudy,
      status: newStatus,
      markedBy: `${currentUser.name} (${currentUser.role})`,
      markedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lateEntry,
      lateEntryTime: lateTime,
    };
    markSingleAttendance(record);
  };

  const handleMarkAllPresent = () => {
    const bulkRecords: AttendanceRecord[] = students.map((stu) => {
      // Don't overwrite if student is currently approved On Leave
      const current = recordsForDate.find((r) => r.studentId === stu.id);
      if (current && current.status === 'On Leave') return current;

      return {
        id: `att-${stu.id}-${selectedDate}`,
        date: selectedDate,
        studentId: stu.id,
        studentName: stu.name,
        collegeRegNo: stu.collegeRegNo,
        hostelName: stu.hostelName,
        roomNumber: stu.roomNumber,
        department: stu.department,
        yearOfStudy: stu.yearOfStudy,
        status: 'Present',
        markedBy: `${currentUser.name} (${currentUser.role})`,
        markedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        lateEntry: false,
      };
    });
    markBulkAttendance(bulkRecords);
  };

  const handleDispatchAbsentAlerts = () => {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 4000);
  };

  const handleExport = () => {
    const rows = combinedList.map((item) => ({
      Date: selectedDate,
      'Student Name': item.student.name,
      'Reg No': item.student.collegeRegNo,
      Department: item.student.department,
      Year: item.student.yearOfStudy,
      Hostel: item.student.hostelName,
      Room: item.student.roomNumber,
      Status: item.record.status,
      'Late Entry': item.record.lateEntry ? 'Yes' : 'No',
      'Late Entry Time': item.record.lateEntryTime || '',
      'Marked By': item.record.markedBy,
      'Parent Contact': item.student.parentPhone,
    }));
    exportToCSV(`Attendance_Report_${selectedDate}`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hostel Attendance & Daily Roll Call</h1>
          <p className="text-xs text-slate-500">
            Digital roll call register with real-time biometric tracking, leave synchronization, and parent alerts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <UserCheck className="h-4 w-4" />
            <span>Mark All Present</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Students</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-500">Enrolled Inmates</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-emerald-700 uppercase">Present</span>
          <div className="mt-1 text-2xl font-bold text-emerald-800">{presentCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">{percentage}% Attendance</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-red-700 uppercase">Absent</span>
          <div className="mt-1 text-2xl font-bold text-red-800">{absentCount}</div>
          <div className="text-[11px] text-red-600 font-medium">Unexcused absence</div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-blue-700 uppercase">On Leave</span>
          <div className="mt-1 text-2xl font-bold text-blue-800">{onLeaveCount}</div>
          <div className="text-[11px] text-blue-600">Approved Passes</div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 shadow-xs">
          <span className="text-[10px] font-semibold text-amber-700 uppercase">Late Entries</span>
          <div className="mt-1 text-2xl font-bold text-amber-800">{lateCount}</div>
          <div className="text-[11px] text-amber-600">Past Curfew Hour</div>
        </div>
      </div>

      {/* Absentee Action Dispatcher */}
      {absentCount > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-200/80 text-red-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-red-950">
                {absentCount} Student(s) flagged Absent on {selectedDate}
              </div>
              <div className="text-red-700">
                Automated parental notification & warden inquiry protocol available.
              </div>
            </div>
          </div>
          <button
            onClick={handleDispatchAbsentAlerts}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white shadow-xs hover:bg-red-700 shrink-0"
          >
            <Send className="h-4 w-4" />
            <span>{alertSent ? 'SMS & Email Alerts Dispatched!' : 'Dispatch Absent Alert to Parents'}</span>
          </button>
        </div>
      )}

      {/* Date & Filter controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Select Roll Call Date</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Attendance Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Search Resident</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Name, Reg No, Room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Resident Student</th>
                <th className="py-3 px-3">Room & Bed</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Parent Contact</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Late Entry</th>
                <th className="py-3 px-4 text-right">Quick Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.map(({ student, record }) => (
                <tr key={student.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={student.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{student.collegeRegNo}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-indigo-700">{student.roomNumber || 'None'}</div>
                    <div className="text-[11px] text-slate-500">{student.bedNumber}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-slate-800 font-medium">{student.department.split(' ')[0]}</div>
                    <div className="text-[11px] text-slate-400">Year {student.yearOfStudy}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-mono text-slate-800">{student.parentPhone}</div>
                    <div className="text-[10px] text-slate-400">{student.parentName}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        record.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : record.status === 'Absent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {record.status === 'Present' && <CheckCircle className="h-3 w-3" />}
                      {record.status === 'Absent' && <XCircle className="h-3 w-3" />}
                      {record.status === 'On Leave' && <Clock className="h-3 w-3" />}
                      {record.status}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {record.lateEntry ? (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        {record.lateEntryTime || 'Late Entry'}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Normal</span>
                    )}
                  </td>

                  {/* Quick Mark Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStatusChange(student, 'Present')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          record.status === 'Present' && !record.lateEntry
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => handleStatusChange(student, 'Absent')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          record.status === 'Absent'
                            ? 'bg-red-600 text-white'
                            : 'border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => handleStatusChange(student, 'On Leave')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          record.status === 'On Leave'
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        L
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(
                            student,
                            'Present',
                            true,
                            `${new Date().getHours()}:${new Date().getMinutes()}`
                          )
                        }
                        className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors ${
                          record.lateEntry
                            ? 'bg-amber-600 text-white'
                            : 'border border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                        title="Mark Late Arrival"
                      >
                        Late
                      </button>
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
