import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  Building,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Student, HostelBuilding, Room } from '../../types';
import {
  getStudents,
  saveStudent,
  deleteStudent,
  getHostels,
  getRooms,
  allocateBedToStudent,
  subscribeToStorage,
} from '../../services/storage';
import { exportToCSV } from '../../utils/export';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(getStudents());
  const [hostels, setHostels] = useState<HostelBuilding[]>(getHostels());
  const [rooms, setRooms] = useState<Room[]>(getRooms());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [hostelFilter, setHostelFilter] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const initialForm: Student = {
    id: '',
    studentId: `STU-2024-${String(Math.floor(Math.random() * 900) + 100)}`,
    collegeRegNo: '',
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '2004-01-01',
    department: 'Information Technology',
    yearOfStudy: 1,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    parentName: '',
    parentPhone: '',
    emergencyContact: '',
    hostelId: hostels[0]?.id || '',
    hostelName: hostels[0]?.name || '',
    floorNo: 1,
    roomId: '',
    roomNumber: '',
    bedNumber: 'Bed 1',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Active',
  };

  const [formData, setFormData] = useState<Student>(initialForm);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const refresh = () => {
      setStudents(getStudents());
      setHostels(getHostels());
      setRooms(getRooms());
    };
    const unsubscribe = subscribeToStorage(refresh);
    return () => unsubscribe();
  }, []);

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.collegeRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'All' || s.department === departmentFilter;
    const matchesYear = yearFilter === 'All' || s.yearOfStudy.toString() === yearFilter;
    const matchesHostel = hostelFilter === 'All' || s.hostelId === hostelFilter;

    return matchesSearch && matchesDept && matchesYear && matchesHostel;
  });

  const handleOpenAddModal = () => {
    const newId = `stu-${Date.now()}`;
    const newReg = `RA241100${Math.floor(Math.random() * 90000) + 10000}`;
    const newStuId = `STU-2024-${String(Math.floor(Math.random() * 900) + 100)}`;
    setFormData({
      ...initialForm,
      id: newId,
      studentId: newStuId,
      collegeRegNo: newReg,
      hostelId: hostels[0]?.id || '',
      hostelName: hostels[0]?.name || '',
    });
    setIsEditing(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setFormData({ ...student });
    setIsEditing(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (student: Student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleDelete = (studentId: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate and remove student ${name}? Their bed allocation will be freed.`)) {
      deleteStudent(studentId);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Student full name is required');
      return;
    }
    if (!formData.collegeRegNo.trim()) {
      setFormError('College register number is required');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Student mobile number is required');
      return;
    }
    if (!formData.parentPhone.trim()) {
      setFormError('Parent contact number is required');
      return;
    }

    // Check duplicate student register number if new
    if (!isEditing) {
      const exists = students.some(
        (s) => s.collegeRegNo.toLowerCase() === formData.collegeRegNo.toLowerCase()
      );
      if (exists) {
        setFormError('A student with this College Register Number already exists!');
        return;
      }
    }

    // Save student
    saveStudent(formData);

    // If room is selected, allocate bed
    if (formData.roomId && formData.bedNumber) {
      try {
        allocateBedToStudent(formData.id, formData.roomId, formData.bedNumber);
      } catch (err: any) {
        console.warn('Bed allocation note:', err.message);
      }
    }

    setIsModalOpen(false);
  };

  const handleExport = () => {
    const exportRows = filteredStudents.map((s) => ({
      'Student ID': s.studentId,
      'College Reg No': s.collegeRegNo,
      Name: s.name,
      Department: s.department,
      Year: s.yearOfStudy,
      Hostel: s.hostelName,
      Room: s.roomNumber,
      Bed: s.bedNumber,
      Mobile: s.phone,
      Email: s.email,
      'Parent Name': s.parentName,
      'Parent Phone': s.parentPhone,
      'Emergency Contact': s.emergencyContact,
      'Admission Date': s.admissionDate,
      Status: s.status,
    }));
    exportToCSV('SmartHostel_Student_Directory', exportRows);
  };

  const availableRoomsInHostel = rooms.filter(
    (r) => !formData.hostelId || r.hostelId === formData.hostelId
  );

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Admissions & Directory</h1>
          <p className="text-xs text-slate-500">
            Comprehensive registry of all hostel inmates, parent emergency contacts, and assigned rooms.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, Reg No, Room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Department Filter */}
          <div>
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

          {/* Year Filter */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="All">All Years of Study</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          {/* Hostel Filter */}
          <div>
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="All">All Hostel Blocks</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          {(searchQuery || departmentFilter !== 'All' || yearFilter !== 'All' || hostelFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('All');
                setYearFilter('All');
                setHostelFilter('All');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Register No / ID</th>
                <th className="py-3 px-3">Dept & Year</th>
                <th className="py-3 px-3">Hostel & Room</th>
                <th className="py-3 px-3">Parent Contact</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No student records found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={student.name}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Reg No */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-medium text-slate-800">{student.collegeRegNo}</div>
                      <div className="text-[11px] text-slate-400">{student.studentId}</div>
                    </td>

                    {/* Dept */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{student.department}</div>
                      <div className="text-[11px] text-slate-500">Year {student.yearOfStudy}</div>
                    </td>

                    {/* Room */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-indigo-700">
                        {student.roomNumber ? `Room ${student.roomNumber}` : 'Unallocated'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {student.bedNumber} • {student.hostelName?.split('(')[0] || 'Block'}
                      </div>
                    </td>

                    {/* Parent */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{student.parentName || 'Parent'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.parentPhone}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          student.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : student.status === 'On Leave'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenViewModal(student)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="View Profile Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Deactivate Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission / Edit Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {isEditing ? `Edit Student: ${formData.name}` : 'Student Hostel Admission Form'}
                  </h2>
                  <p className="text-xs text-slate-300">Fill all mandatory institutional admission details</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Academic & Personal */}
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Academic & Personal Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">College Register No *</label>
                    <input
                      type="text"
                      required
                      value={formData.collegeRegNo}
                      onChange={(e) => setFormData({ ...formData, collegeRegNo: e.target.value })}
                      placeholder="e.g. RA2411003010045"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Student System ID</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.studentId}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden bg-white"
                    >
                      <option value="Information Technology">Information Technology</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Year of Study *</label>
                    <select
                      value={formData.yearOfStudy}
                      onChange={(e) => setFormData({ ...formData, yearOfStudy: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden bg-white"
                    >
                      <option value={1}>1st Year (Freshman)</option>
                      <option value={2}>2nd Year (Sophomore)</option>
                      <option value={3}>3rd Year (Junior)</option>
                      <option value={4}>4th Year (Senior)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98403 44567"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@college.edu"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Parent & Emergency Contacts */}
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Parent & Guardian Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="e.g. Suresh Verma"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Parent Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="+91 94440 11223"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Emergency SOS Contact</label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      placeholder="+91 94440 99887 (Uncle)"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Hostel & Bed Allocation */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Hostel & Room Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Hostel *</label>
                    <select
                      value={formData.hostelId}
                      onChange={(e) => {
                        const h = hostels.find((item) => item.id === e.target.value);
                        setFormData({
                          ...formData,
                          hostelId: e.target.value,
                          hostelName: h ? h.name : '',
                          roomId: '',
                          roomNumber: '',
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden bg-white"
                    >
                      {hostels.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Select Room</label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => {
                        const r = rooms.find((item) => item.id === e.target.value);
                        setFormData({
                          ...formData,
                          roomId: e.target.value,
                          roomNumber: r ? r.roomNumber : '',
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden bg-white"
                    >
                      <option value="">-- Choose Room --</option>
                      {availableRoomsInHostel.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.roomNumber} ({r.type} - {r.occupiedBeds}/{r.capacity} beds)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bed Slot</label>
                    <select
                      value={formData.bedNumber}
                      onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden bg-white"
                    >
                      <option value="Bed 1">Bed 1</option>
                      <option value="Bed 2">Bed 2</option>
                      <option value="Bed 3">Bed 3</option>
                      <option value="Bed 4">Bed 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Url */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  {isEditing ? 'Save Changes' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="relative bg-slate-900 px-6 pt-6 pb-12 text-white">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={selectedStudent.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold">{selectedStudent.name}</h3>
                  <p className="text-xs text-indigo-300 font-mono">{selectedStudent.collegeRegNo}</p>
                  <p className="text-xs text-slate-300">{selectedStudent.department} • Year {selectedStudent.yearOfStudy}</p>
                </div>
              </div>
            </div>

            <div className="p-6 -mt-6 bg-white rounded-t-2xl space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Hostel Allocation</div>
                  <div className="mt-1 font-bold text-indigo-700 text-sm">{selectedStudent.roomNumber || 'None'}</div>
                  <div className="text-[11px] text-slate-600">{selectedStudent.bedNumber} • {selectedStudent.hostelName}</div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Residency Status</div>
                  <div className="mt-1 font-bold text-emerald-700 text-sm">{selectedStudent.status}</div>
                  <div className="text-[11px] text-slate-600">Admitted: {selectedStudent.admissionDate}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mobile Phone:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedStudent.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Student Email:</span>
                  <span className="text-slate-800 font-medium">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Parent / Guardian:</span>
                  <span className="text-slate-800 font-bold">{selectedStudent.parentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Parent Contact:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedStudent.parentPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Emergency SOS:</span>
                  <span className="text-red-700 font-bold">{selectedStudent.emergencyContact}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-900"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
