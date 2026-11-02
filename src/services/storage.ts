import {
  User,
  Student,
  HostelBuilding,
  Room,
  AttendanceRecord,
  LeaveRequest,
  Visitor,
  Complaint,
  MaintenanceTask,
  DayMessMenu,
  MessFeedback,
  FeeRecord,
  PaymentTransaction,
  Announcement,
  NotificationItem,
  InventoryItem,
  ActivityLog,
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'smarthostel_current_user',
  USERS: 'smarthostel_users',
  STUDENTS: 'smarthostel_students',
  HOSTELS: 'smarthostel_hostels',
  ROOMS: 'smarthostel_rooms',
  ATTENDANCE: 'smarthostel_attendance',
  LEAVE_REQUESTS: 'smarthostel_leave_requests',
  VISITORS: 'smarthostel_visitors',
  COMPLAINTS: 'smarthostel_complaints',
  MAINTENANCE_TASKS: 'smarthostel_maintenance_tasks',
  MESS_MENU: 'smarthostel_mess_menu',
  MESS_FEEDBACK: 'smarthostel_mess_feedback',
  FEE_RECORDS: 'smarthostel_fee_records',
  PAYMENTS: 'smarthostel_payments',
  ANNOUNCEMENTS: 'smarthostel_announcements',
  NOTIFICATIONS: 'smarthostel_notifications',
  INVENTORY: 'smarthostel_inventory',
  ACTIVITY_LOGS: 'smarthostel_activity_logs',
};

// Event emitter for reactive UI updates across components
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifySubscribers = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in storage subscriber:', e);
    }
  });
};

// Seed Data
const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Rajesh Sharma',
    email: 'admin@smarthostel.edu',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98401 22345',
  },
  {
    id: 'usr-warden-1',
    name: 'Prof. Anita Desai',
    email: 'warden@smarthostel.edu',
    role: 'WARDEN',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98402 33456',
    assignedHostelId: 'hostel-1',
  },
  {
    id: 'usr-student-1',
    name: 'Rahul Verma',
    email: 'rahul@student.edu',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98403 44567',
    studentId: 'stu-1',
    assignedHostelId: 'hostel-1',
  },
  {
    id: 'usr-staff-1',
    name: 'Ramesh Kumar',
    email: 'ramesh@staff.edu',
    role: 'STAFF',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98404 55678',
    staffRole: 'Chief Maintenance Officer & Electrician',
  },
];

const DEFAULT_HOSTELS: HostelBuilding[] = [
  {
    id: 'hostel-1',
    name: 'Aryabhatta Boys Hostel (Block A)',
    code: 'ABH-A',
    gender: 'Boys',
    totalFloors: 3,
    totalRooms: 36,
    totalBeds: 96,
    wardenName: 'Prof. Anita Desai',
    wardenContact: '+91 98402 33456',
    caretakerName: 'Mr. Sundar Rajan',
  },
  {
    id: 'hostel-2',
    name: 'Kalpana Chawla Girls Hostel (Block B)',
    code: 'KCGH-B',
    gender: 'Girls',
    totalFloors: 4,
    totalRooms: 48,
    totalBeds: 120,
    wardenName: 'Dr. Meenakshi Sundaram',
    wardenContact: '+91 98405 66789',
    caretakerName: 'Mrs. Lakshmi Priya',
  },
  {
    id: 'hostel-3',
    name: 'Ramanujan PG & Research Hostel (Block C)',
    code: 'RPGH-C',
    gender: 'Boys',
    totalFloors: 2,
    totalRooms: 20,
    totalBeds: 40,
    wardenName: 'Dr. K. Venkatesh',
    wardenContact: '+91 98406 77890',
    caretakerName: 'Mr. Murugan S',
  },
];

const DEFAULT_ROOMS: Room[] = [
  {
    id: 'rm-101',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNumber: 1,
    roomNumber: 'A-101',
    type: 'Double',
    capacity: 2,
    occupiedBeds: 2,
    status: 'Fully Occupied',
    hasAC: true,
    hasAttachedWashroom: true,
    beds: [
      { bedNumber: 'Bed 1', isOccupied: true, studentId: 'stu-1', studentName: 'Rahul Verma' },
      { bedNumber: 'Bed 2', isOccupied: true, studentId: 'stu-2', studentName: 'Aditya Sen' },
    ],
  },
  {
    id: 'rm-102',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNumber: 1,
    roomNumber: 'A-102',
    type: 'Triple',
    capacity: 3,
    occupiedBeds: 2,
    status: 'Partially Occupied',
    hasAC: false,
    hasAttachedWashroom: true,
    beds: [
      { bedNumber: 'Bed 1', isOccupied: true, studentId: 'stu-3', studentName: 'Vikram Patel' },
      { bedNumber: 'Bed 2', isOccupied: true, studentId: 'stu-4', studentName: 'Siddharth Nair' },
      { bedNumber: 'Bed 3', isOccupied: false },
    ],
  },
  {
    id: 'rm-103',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNumber: 1,
    roomNumber: 'A-103',
    type: 'Single',
    capacity: 1,
    occupiedBeds: 0,
    status: 'Available',
    hasAC: true,
    hasAttachedWashroom: true,
    beds: [{ bedNumber: 'Bed 1', isOccupied: false }],
  },
  {
    id: 'rm-104',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNumber: 1,
    roomNumber: 'A-104',
    type: 'Four Sharing',
    capacity: 4,
    occupiedBeds: 0,
    status: 'Maintenance',
    hasAC: false,
    hasAttachedWashroom: false,
    beds: [
      { bedNumber: 'Bed 1', isOccupied: false },
      { bedNumber: 'Bed 2', isOccupied: false },
      { bedNumber: 'Bed 3', isOccupied: false },
      { bedNumber: 'Bed 4', isOccupied: false },
    ],
  },
  {
    id: 'rm-201',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNumber: 2,
    roomNumber: 'A-201',
    type: 'Double',
    capacity: 2,
    occupiedBeds: 1,
    status: 'Partially Occupied',
    hasAC: true,
    hasAttachedWashroom: true,
    beds: [
      { bedNumber: 'Bed 1', isOccupied: true, studentId: 'stu-5', studentName: 'Karthik Raja' },
      { bedNumber: 'Bed 2', isOccupied: false },
    ],
  },
  {
    id: 'rm-202',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNumber: 2,
    roomNumber: 'A-202',
    type: 'Triple',
    capacity: 3,
    occupiedBeds: 3,
    status: 'Fully Occupied',
    hasAC: false,
    hasAttachedWashroom: true,
    beds: [
      { bedNumber: 'Bed 1', isOccupied: true, studentId: 'stu-6', studentName: 'Arjun Das' },
      { bedNumber: 'Bed 2', isOccupied: true, studentId: 'stu-7', studentName: 'Manoj Pillai' },
      { bedNumber: 'Bed 3', isOccupied: true, studentId: 'stu-8', studentName: 'Tanmay Joshi' },
    ],
  },
  {
    id: 'rm-b101',
    hostelId: 'hostel-2',
    hostelName: 'Kalpana Chawla Girls Hostel (Block B)',
    floorNumber: 1,
    roomNumber: 'B-101',
    type: 'Double',
    capacity: 2,
    occupiedBeds: 2,
    status: 'Fully Occupied',
    hasAC: true,
    hasAttachedWashroom: true,
    beds: [
      { bedNumber: 'Bed 1', isOccupied: true, studentId: 'stu-9', studentName: 'Priya Iyer' },
      { bedNumber: 'Bed 2', isOccupied: true, studentId: 'stu-10', studentName: 'Ananya Roy' },
    ],
  },
  {
    id: 'rm-b102',
    hostelId: 'hostel-2',
    hostelName: 'Kalpana Chawla Girls Hostel (Block B)',
    floorNumber: 1,
    roomNumber: 'B-102',
    type: 'Double',
    capacity: 2,
    occupiedBeds: 0,
    status: 'Available',
    hasAC: false,
    hasAttachedWashroom: true,
    beds: [
      { bedNumber: 'Bed 1', isOccupied: false },
      { bedNumber: 'Bed 2', isOccupied: false },
    ],
  },
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    studentId: 'STU-2024-001',
    collegeRegNo: 'RA2411003010045',
    name: 'Rahul Verma',
    email: 'rahul@student.edu',
    phone: '+91 98403 44567',
    gender: 'Male',
    dob: '2004-06-15',
    department: 'Information Technology',
    yearOfStudy: 3,
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    parentName: 'Suresh Verma',
    parentPhone: '+91 94440 11223',
    emergencyContact: '+91 94440 99887 (Uncle)',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNo: 1,
    roomId: 'rm-101',
    roomNumber: 'A-101',
    bedNumber: 'Bed 1',
    admissionDate: '2022-08-20',
    status: 'Active',
  },
  {
    id: 'stu-2',
    studentId: 'STU-2024-002',
    collegeRegNo: 'RA2411003010088',
    name: 'Aditya Sen',
    email: 'aditya.sen@college.edu',
    phone: '+91 98403 77889',
    gender: 'Male',
    dob: '2004-03-22',
    department: 'Computer Science & Engineering',
    yearOfStudy: 3,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    parentName: 'Debabrata Sen',
    parentPhone: '+91 94441 22334',
    emergencyContact: '+91 94441 55667',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNo: 1,
    roomId: 'rm-101',
    roomNumber: 'A-101',
    bedNumber: 'Bed 2',
    admissionDate: '2022-08-20',
    status: 'Active',
  },
  {
    id: 'stu-3',
    studentId: 'STU-2024-003',
    collegeRegNo: 'RA2411004010112',
    name: 'Vikram Patel',
    email: 'vikram.p@college.edu',
    phone: '+91 98408 12345',
    gender: 'Male',
    dob: '2005-01-10',
    department: 'Mechanical Engineering',
    yearOfStudy: 2,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    parentName: 'Bhavesh Patel',
    parentPhone: '+91 94442 33445',
    emergencyContact: '+91 94442 77889',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNo: 1,
    roomId: 'rm-102',
    roomNumber: 'A-102',
    bedNumber: 'Bed 1',
    admissionDate: '2023-08-14',
    status: 'Active',
  },
  {
    id: 'stu-4',
    studentId: 'STU-2024-004',
    collegeRegNo: 'RA2411005010091',
    name: 'Siddharth Nair',
    email: 'siddharth.n@college.edu',
    phone: '+91 98409 66778',
    gender: 'Male',
    dob: '2004-11-28',
    department: 'Electronics & Communication',
    yearOfStudy: 2,
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    parentName: 'K. Nair',
    parentPhone: '+91 94443 44556',
    emergencyContact: '+91 94443 88990',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNo: 1,
    roomId: 'rm-102',
    roomNumber: 'A-102',
    bedNumber: 'Bed 2',
    admissionDate: '2023-08-15',
    status: 'Active',
  },
  {
    id: 'stu-5',
    studentId: 'STU-2024-005',
    collegeRegNo: 'RA2411003010199',
    name: 'Karthik Raja',
    email: 'karthik.r@college.edu',
    phone: '+91 98401 99887',
    gender: 'Male',
    dob: '2003-09-04',
    department: 'Civil Engineering',
    yearOfStudy: 4,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    parentName: 'Rajaraman V',
    parentPhone: '+91 94444 55667',
    emergencyContact: '+91 94444 11223',
    hostelId: 'hostel-1',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    floorNo: 2,
    roomId: 'rm-201',
    roomNumber: 'A-201',
    bedNumber: 'Bed 1',
    admissionDate: '2021-09-01',
    status: 'Active',
  },
  {
    id: 'stu-9',
    studentId: 'STU-2024-009',
    collegeRegNo: 'RA2411003020014',
    name: 'Priya Iyer',
    email: 'priya.iyer@college.edu',
    phone: '+91 98405 11223',
    gender: 'Female',
    dob: '2004-08-19',
    department: 'Information Technology',
    yearOfStudy: 3,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    parentName: 'V. S. Iyer',
    parentPhone: '+91 94445 66778',
    emergencyContact: '+91 94445 99881',
    hostelId: 'hostel-2',
    hostelName: 'Kalpana Chawla Girls Hostel (Block B)',
    floorNo: 1,
    roomId: 'rm-b101',
    roomNumber: 'B-101',
    bedNumber: 'Bed 1',
    admissionDate: '2022-08-22',
    status: 'Active',
  },
  {
    id: 'stu-10',
    studentId: 'STU-2024-010',
    collegeRegNo: 'RA2411003020038',
    name: 'Ananya Roy',
    email: 'ananya.roy@college.edu',
    phone: '+91 98405 44332',
    gender: 'Female',
    dob: '2004-12-05',
    department: 'Computer Science & Engineering',
    yearOfStudy: 3,
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    parentName: 'Prabir Roy',
    parentPhone: '+91 94446 77889',
    emergencyContact: '+91 94446 22334',
    hostelId: 'hostel-2',
    hostelName: 'Kalpana Chawla Girls Hostel (Block B)',
    floorNo: 1,
    roomId: 'rm-b101',
    roomNumber: 'B-101',
    bedNumber: 'Bed 2',
    admissionDate: '2022-08-22',
    status: 'Active',
  },
];

const DEFAULT_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    date: '2026-11-02',
    studentId: 'stu-1',
    studentName: 'Rahul Verma',
    collegeRegNo: 'RA2411003010045',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    roomNumber: 'A-101',
    department: 'Information Technology',
    yearOfStudy: 3,
    status: 'Present',
    markedBy: 'Prof. Anita Desai (Warden)',
    markedAt: '2026-11-02 21:15',
    lateEntry: false,
  },
  {
    id: 'att-2',
    date: '2026-11-02',
    studentId: 'stu-2',
    studentName: 'Aditya Sen',
    collegeRegNo: 'RA2411003010088',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    roomNumber: 'A-101',
    department: 'Computer Science & Engineering',
    yearOfStudy: 3,
    status: 'Present',
    markedBy: 'Prof. Anita Desai (Warden)',
    markedAt: '2026-11-02 21:16',
    lateEntry: true,
    lateEntryTime: '21:40 (Library Extended Hours)',
  },
  {
    id: 'att-3',
    date: '2026-11-02',
    studentId: 'stu-3',
    studentName: 'Vikram Patel',
    collegeRegNo: 'RA2411004010112',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    roomNumber: 'A-102',
    department: 'Mechanical Engineering',
    yearOfStudy: 2,
    status: 'Absent',
    markedBy: 'Prof. Anita Desai (Warden)',
    markedAt: '2026-11-02 21:20',
    lateEntry: false,
    remarks: 'Uninformed absence - warden alert dispatched to parent',
  },
  {
    id: 'att-4',
    date: '2026-11-02',
    studentId: 'stu-4',
    studentName: 'Siddharth Nair',
    collegeRegNo: 'RA2411005010091',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    roomNumber: 'A-102',
    department: 'Electronics & Communication',
    yearOfStudy: 2,
    status: 'On Leave',
    markedBy: 'System (Approved Leave)',
    markedAt: '2026-11-02 18:00',
    lateEntry: false,
    remarks: 'Approved Leave (Home Visit #LV-102)',
  },
  {
    id: 'att-5',
    date: '2026-11-02',
    studentId: 'stu-5',
    studentName: 'Karthik Raja',
    collegeRegNo: 'RA2411003010199',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    roomNumber: 'A-201',
    department: 'Civil Engineering',
    yearOfStudy: 4,
    status: 'Present',
    markedBy: 'Prof. Anita Desai (Warden)',
    markedAt: '2026-11-02 21:18',
    lateEntry: false,
  },
  {
    id: 'att-6',
    date: '2026-11-02',
    studentId: 'stu-9',
    studentName: 'Priya Iyer',
    collegeRegNo: 'RA2411003020014',
    hostelName: 'Kalpana Chawla Girls Hostel (Block B)',
    roomNumber: 'B-101',
    department: 'Information Technology',
    yearOfStudy: 3,
    status: 'Present',
    markedBy: 'Dr. Meenakshi Sundaram (Warden)',
    markedAt: '2026-11-02 21:05',
    lateEntry: false,
  },
  {
    id: 'att-7',
    date: '2026-11-02',
    studentId: 'stu-10',
    studentName: 'Ananya Roy',
    collegeRegNo: 'RA2411003020038',
    hostelName: 'Kalpana Chawla Girls Hostel (Block B)',
    roomNumber: 'B-101',
    department: 'Computer Science & Engineering',
    yearOfStudy: 3,
    status: 'Present',
    markedBy: 'Dr. Meenakshi Sundaram (Warden)',
    markedAt: '2026-11-02 21:06',
    lateEntry: false,
  },
];

const DEFAULT_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lv-101',
    studentId: 'stu-1',
    studentName: 'Rahul Verma',
    collegeRegNo: 'RA2411003010045',
    department: 'Information Technology',
    roomNumber: 'A-101',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    leaveType: 'Home Visit',
    reason: 'Sister wedding celebration in Bangalore',
    destination: 'Bangalore, Karnataka',
    departureDate: '2026-11-08',
    departureTime: '17:00',
    expectedReturnDate: '2026-11-12',
    expectedReturnTime: '20:00',
    parentPhone: '+91 94440 11223',
    parentConsentVerified: true,
    status: 'Pending',
    createdAt: '2026-11-01 14:30',
  },
  {
    id: 'lv-102',
    studentId: 'stu-4',
    studentName: 'Siddharth Nair',
    collegeRegNo: 'RA2411005010091',
    department: 'Electronics & Communication',
    roomNumber: 'A-102',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    leaveType: 'Medical Emergency',
    reason: 'Dental surgery and follow-up rest at home',
    destination: 'Kochi, Kerala',
    departureDate: '2026-11-01',
    departureTime: '08:00',
    expectedReturnDate: '2026-11-05',
    expectedReturnTime: '18:00',
    parentPhone: '+91 94443 44556',
    parentConsentVerified: true,
    status: 'Approved',
    reviewedBy: 'Prof. Anita Desai (Warden)',
    reviewedAt: '2026-10-31 16:45',
    createdAt: '2026-10-31 11:20',
  },
  {
    id: 'lv-103',
    studentId: 'stu-3',
    studentName: 'Vikram Patel',
    collegeRegNo: 'RA2411004010112',
    department: 'Mechanical Engineering',
    roomNumber: 'A-102',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    leaveType: 'Academic / Conference',
    reason: 'Attending National Robotics Championship at IIT Madras',
    destination: 'Chennai, Tamil Nadu',
    departureDate: '2026-10-25',
    departureTime: '07:00',
    expectedReturnDate: '2026-10-28',
    expectedReturnTime: '21:00',
    actualReturnDateTime: '2026-10-28 20:30',
    parentPhone: '+91 94442 33445',
    parentConsentVerified: true,
    status: 'Completed',
    reviewedBy: 'Prof. Anita Desai (Warden)',
    reviewedAt: '2026-10-24 10:15',
    createdAt: '2026-10-23 18:00',
  },
];

const DEFAULT_VISITORS: Visitor[] = [
  {
    id: 'vis-1',
    visitorName: 'Suresh Verma',
    phone: '+91 94440 11223',
    idProofType: 'Aadhar Card',
    idProofNumber: 'XXXX-XXXX-4589',
    relationWithStudent: 'Father',
    studentId: 'stu-1',
    studentName: 'Rahul Verma',
    studentRoomNo: 'A-101',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    purpose: 'Delivering winter apparel and college tuition documents',
    visitDate: '2026-11-03',
    passCode: 'VIS-9021',
    status: 'Approved',
    approvedBy: 'Prof. Anita Desai',
    createdAt: '2026-11-01 10:00',
  },
  {
    id: 'vis-2',
    visitorName: 'Meera Patel',
    phone: '+91 94442 88990',
    idProofType: 'Driving License',
    idProofNumber: 'DL-0420110089',
    relationWithStudent: 'Mother',
    studentId: 'stu-3',
    studentName: 'Vikram Patel',
    studentRoomNo: 'A-102',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    purpose: 'Weekend personal meeting',
    visitDate: '2026-11-02',
    entryTime: '15:30',
    passCode: 'VIS-8412',
    status: 'Checked In',
    approvedBy: 'Prof. Anita Desai',
    createdAt: '2026-11-02 09:15',
  },
];

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-1',
    ticketNumber: 'TCK-8921',
    studentId: 'stu-1',
    studentName: 'Rahul Verma',
    roomNumber: 'A-101',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    category: 'Electrical',
    title: 'Ceiling fan regulator sparking and speed control stuck',
    description: 'The ceiling fan speed dial sparks when switched to position 3. Needs immediate replacement before electrical short.',
    status: 'Assigned',
    priority: 'High',
    assignedToStaffId: 'usr-staff-1',
    assignedStaffName: 'Ramesh Kumar (Senior Electrician)',
    submittedAt: '2026-11-01 09:20',
  },
  {
    id: 'cmp-2',
    ticketNumber: 'TCK-8922',
    studentId: 'stu-3',
    studentName: 'Vikram Patel',
    roomNumber: 'A-102',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    category: 'Plumbing',
    title: 'Bathroom shower tap dripping continuously',
    description: 'Water tap washer worn out, leaking roughly 5-10 liters per day causing water wastage.',
    status: 'Submitted',
    priority: 'Medium',
    submittedAt: '2026-11-02 07:45',
  },
  {
    id: 'cmp-3',
    ticketNumber: 'TCK-8890',
    studentId: 'stu-5',
    studentName: 'Karthik Raja',
    roomNumber: 'A-201',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    category: 'Wi-Fi',
    title: 'Floor 2 access point Wi-Fi signal drops frequently',
    description: 'Packet drop on the hallway Wi-Fi repeater during evening study hours.',
    status: 'Resolved',
    priority: 'Medium',
    assignedToStaffId: 'usr-staff-1',
    assignedStaffName: 'Ramesh Kumar',
    submittedAt: '2026-10-29 11:15',
    resolvedAt: '2026-10-30 14:00',
    resolutionNotes: 'Firmware upgraded and channel switched to 5GHz interference-free frequency.',
  },
];

const DEFAULT_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'tsk-1',
    complaintId: 'cmp-1',
    title: 'Replace electrical ceiling regulator in Room A-101',
    category: 'Electrical',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    roomNumber: 'A-101',
    assignedStaffId: 'usr-staff-1',
    assignedStaffName: 'Ramesh Kumar',
    priority: 'High',
    status: 'In Progress',
    scheduledDate: '2026-11-02',
    remarks: 'Parts collected from central store. Scheduled inspection at 4:30 PM.',
  },
  {
    id: 'tsk-2',
    title: 'Routine water tank chlorination and filter backwash',
    category: 'Plumbing',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    roomNumber: 'Rooftop Utility',
    assignedStaffId: 'usr-staff-1',
    assignedStaffName: 'Ramesh Kumar',
    priority: 'Medium',
    status: 'Pending',
    scheduledDate: '2026-11-04',
    remarks: 'Quarterly compliance maintenance.',
  },
  {
    id: 'tsk-3',
    complaintId: 'cmp-3',
    title: 'Wi-Fi AP reconfiguration Floor 2',
    category: 'Wi-Fi',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    roomNumber: 'A-201 Corridor',
    assignedStaffId: 'usr-staff-1',
    assignedStaffName: 'Ramesh Kumar',
    priority: 'Medium',
    status: 'Completed',
    scheduledDate: '2026-10-30',
    completedAt: '2026-10-30 14:00',
    remarks: 'Completed successfully.',
  },
];

const DEFAULT_MESS_MENU: DayMessMenu[] = [
  {
    day: 'Monday',
    breakfast: 'Idli, Medu Vada, Sambar, Coconut & Tomato Chutney, Tea / Coffee / Milk',
    lunch: 'Steamed Rice, South Indian Dal, Paneer Butter Masala, Rasam, Curd, Appalam',
    snacks: 'Vegetable Samosa, Green Mint Chutney, Masala Chai',
    dinner: 'Phulka Roti, Mixed Vegetable Kurma, Jeera Rice, Dal Tadka, Seasonal Fruit',
    specialDish: 'Special Filter Coffee & Hot Gulab Jamun',
  },
  {
    day: 'Tuesday',
    breakfast: 'Puri Bhaji / Aloo Masala, Boiled Sprouts, Banana, Tea / Coffee',
    lunch: 'North Indian Thali: Roti, Rajma Masala, Steamed Rice, Aloo Gobi, Buttermilk',
    snacks: 'Crispy Veg Cutlet, Tomato Ketchup, Tea',
    dinner: 'Egg Curry / Paneer Do Pyaza, Chapati, Veg Pulao, Dal Fry, Ice Cream Cup',
    specialDish: 'Egg Curry / Paneer Delight',
  },
  {
    day: 'Wednesday',
    breakfast: 'Masala Dosa, Potato Masala, Sambar, Peanut Chutney, Tea / Coffee',
    lunch: 'Hyderabadi Veg Dum Biryani, Onion Raita, Mirchi Ka Salan, Sweet Corn Soup',
    snacks: 'Sweet Corn Chaat, Lemon Ginger Tea',
    dinner: 'Tandoori Roti, Dal Makhani, Kadai Paneer, Steamed Rice, Gulab Jamun',
    specialDish: 'Chef Special Veg Biryani & Gulab Jamun',
  },
  {
    day: 'Thursday',
    breakfast: 'Poha with Roasted Peanuts, Sev, Upma, Coconut Chutney, Boiled Egg/Fruit',
    lunch: 'Lemon Rice, Curd Rice, Potato Fry, Mor Kuzhambu, Pickle & Papad',
    snacks: 'Onion Pakoda, Hot Masala Tea',
    dinner: 'Methi Paratha, Paneer Bhurji / Soya Chaap Curry, Steamed Rice, Dal Palak',
    specialDish: 'Methi Paratha Feast',
  },
  {
    day: 'Friday',
    breakfast: 'Ven Pongal, Medu Vada, Kosthu, Coconut Chutney, Tea / Coffee',
    lunch: 'Ghee Rice, Vegetable Korma, Chana Masala, Cucumber Salad, Rasam, Curd',
    snacks: 'Pani Puri / Sev Puri Stall, Lemon Juice',
    dinner: 'Naan, Shahi Paneer, Jeera Rice, Yellow Dal, Fruit Custard',
    specialDish: 'Evening Street Chaat Counter',
  },
  {
    day: 'Saturday',
    breakfast: 'Aloo Paratha, Fresh Curd, Pickle, Boiled Egg / Fruit, Tea / Coffee',
    lunch: 'Bisibelebath, Boondi Raita, Potato Wafers, Curd Rice, Cut Fruits',
    snacks: 'Pav Bhaji, Butter Toasted Pav, Tea',
    dinner: 'Veg Fried Rice, Hakka Noodles, Gobi Manchurian, Hot & Sour Soup',
    specialDish: 'Indo-Chinese Fusion Dinner Night',
  },
  {
    day: 'Sunday',
    breakfast: 'Chole Bhature, Pickled Onions, Mint Raita, Sweet Lassi / Coffee',
    lunch: 'Special Grand Feast: Chicken Dum Biryani / Mushroom Paneer Biryani, Raitha, Brinjal Curry, Rasam, Payasam',
    snacks: 'Biscuits, Roasted Makhana, Filter Coffee',
    dinner: 'Soft Roti, Malai Kofta, Kashmiri Pulao, Dal Tadka, Chocolate Brownie',
    specialDish: 'Sunday Special Chicken / Royal Paneer Feast',
  },
];

const DEFAULT_MESS_FEEDBACK: MessFeedback[] = [
  {
    id: 'fb-1',
    studentId: 'stu-1',
    studentName: 'Rahul Verma',
    date: '2026-11-01',
    mealType: 'Lunch',
    rating: 4,
    quality: 'Good',
    comments: 'Paneer gravy was rich and curd was fresh. Sambar could be a bit less spicy.',
    createdAt: '2026-11-01 14:15',
  },
  {
    id: 'fb-2',
    studentId: 'stu-3',
    studentName: 'Vikram Patel',
    date: '2026-11-01',
    mealType: 'Dinner',
    rating: 5,
    quality: 'Excellent',
    comments: 'Sunday special Biryani and Gulab Jamun was top tier!',
    createdAt: '2026-11-01 21:00',
  },
];

const DEFAULT_FEE_RECORDS: FeeRecord[] = [
  {
    id: 'fee-1',
    studentId: 'stu-1',
    studentName: 'Rahul Verma',
    collegeRegNo: 'RA2411003010045',
    roomNumber: 'A-101',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    academicYear: '2026-2027',
    semester: 'Odd Semester (V Sem)',
    hostelFee: 45000,
    messFee: 32000,
    maintenanceFee: 5000,
    totalAmount: 82000,
    paidAmount: 82000,
    pendingAmount: 0,
    dueDate: '2026-09-15',
    status: 'Paid',
    lastPaymentDate: '2026-08-25',
  },
  {
    id: 'fee-2',
    studentId: 'stu-2',
    studentName: 'Aditya Sen',
    collegeRegNo: 'RA2411003010088',
    roomNumber: 'A-101',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    academicYear: '2026-2027',
    semester: 'Odd Semester (V Sem)',
    hostelFee: 45000,
    messFee: 32000,
    maintenanceFee: 5000,
    totalAmount: 82000,
    paidAmount: 50000,
    pendingAmount: 32000,
    dueDate: '2026-11-15',
    status: 'Partial',
    lastPaymentDate: '2026-08-28',
  },
  {
    id: 'fee-3',
    studentId: 'stu-3',
    studentName: 'Vikram Patel',
    collegeRegNo: 'RA2411004010112',
    roomNumber: 'A-102',
    hostelName: 'Aryabhatta Boys Hostel (Block A)',
    academicYear: '2026-2027',
    semester: 'Odd Semester (III Sem)',
    hostelFee: 40000,
    messFee: 32000,
    maintenanceFee: 5000,
    totalAmount: 77000,
    paidAmount: 0,
    pendingAmount: 77000,
    dueDate: '2026-10-30',
    status: 'Overdue',
  },
  {
    id: 'fee-9',
    studentId: 'stu-9',
    studentName: 'Priya Iyer',
    collegeRegNo: 'RA2411003020014',
    roomNumber: 'B-101',
    hostelName: 'Kalpana Chawla Girls Hostel (Block B)',
    academicYear: '2026-2027',
    semester: 'Odd Semester (V Sem)',
    hostelFee: 45000,
    messFee: 32000,
    maintenanceFee: 5000,
    totalAmount: 82000,
    paidAmount: 82000,
    pendingAmount: 0,
    dueDate: '2026-09-15',
    status: 'Paid',
    lastPaymentDate: '2026-08-20',
  },
];

const DEFAULT_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay-1',
    feeRecordId: 'fee-1',
    studentId: 'stu-1',
    studentName: 'Rahul Verma',
    collegeRegNo: 'RA2411003010045',
    receiptNumber: 'RCP-2026-0891',
    amount: 82000,
    paymentMethod: 'UPI',
    transactionId: 'UPI-TXN-9021488102',
    date: '2026-08-25 11:32',
    status: 'Success',
    breakdown: {
      hostelFee: 45000,
      messFee: 32000,
      maintenanceFee: 5000,
    },
  },
  {
    id: 'pay-2',
    feeRecordId: 'fee-2',
    studentId: 'stu-2',
    studentName: 'Aditya Sen',
    collegeRegNo: 'RA2411003010088',
    receiptNumber: 'RCP-2026-0924',
    amount: 50000,
    paymentMethod: 'Credit/Debit Card',
    transactionId: 'CARD-TXN-411204819',
    date: '2026-08-28 16:45',
    status: 'Success',
    breakdown: {
      hostelFee: 45000,
      messFee: 5000,
      maintenanceFee: 0,
    },
  },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: 'Biometric & Night Curfew Timing Revision for November',
    content: 'All hostel inmates are hereby notified that the evening roll call will be conducted strictly at 9:00 PM on weekdays and 9:30 PM on weekends. Late entries without warden prior approval will incur disciplinary inquiry.',
    targetRole: 'All',
    priority: 'Urgent',
    hostelScope: 'All Hostels',
    postedByName: 'Dr. Rajesh Sharma',
    postedByRole: 'Chief Hostel Administrator',
    createdAt: '2026-11-01 10:00',
  },
  {
    id: 'anc-2',
    title: 'High-Speed Wi-Fi Router Upgrades on 2nd and 3rd Floors',
    content: 'Network engineers will be replacing optical fibers and mesh access points on Tuesday between 10:00 AM and 1:00 PM. Brief intermittent disruptions may occur.',
    targetRole: 'Students',
    priority: 'Normal',
    hostelScope: 'Aryabhatta Boys Hostel (Block A)',
    postedByName: 'Prof. Anita Desai',
    postedByRole: 'Warden',
    createdAt: '2026-10-31 16:00',
  },
  {
    id: 'anc-3',
    title: 'Diwali Festive Special Dinner Feast & Vacation Notice',
    content: 'Special festival banquet will be served on Saturday, 14th November. Students planning to travel home must submit digital leave applications by Friday 5:00 PM.',
    targetRole: 'All',
    priority: 'Info',
    hostelScope: 'All Hostels',
    postedByName: 'Mess Committee',
    postedByRole: 'Mess Manager',
    createdAt: '2026-10-28 09:30',
  },
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'stu-1',
    title: 'Complaint Update',
    message: 'Your complaint regarding ceiling fan (TCK-8921) has been assigned to Ramesh Kumar (Electrician).',
    type: 'complaint',
    isRead: false,
    createdAt: '2026-11-01 10:15',
  },
  {
    id: 'notif-2',
    userId: 'stu-1',
    title: 'Visitor Pass Approved',
    message: 'Visitor pass for Suresh Verma on 2026-11-03 has been approved with Pass Code VIS-9021.',
    type: 'visitor',
    isRead: false,
    createdAt: '2026-11-01 11:00',
  },
  {
    id: 'notif-3',
    userId: 'usr-warden-1',
    title: 'New Leave Request Received',
    message: 'Rahul Verma has submitted a leave application for Home Visit (2026-11-08 to 2026-11-12).',
    type: 'leave',
    isRead: false,
    createdAt: '2026-11-01 14:30',
  },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    itemName: 'LED Batten Lights 20W Philips',
    category: 'Electrical',
    quantity: 42,
    unit: 'Pieces',
    minStockLevel: 15,
    location: 'Electrical Store Shelf A-2',
    lastRestocked: '2026-10-20',
  },
  {
    id: 'inv-2',
    itemName: 'Ceiling Fan Regulators (Stepped 5-speed)',
    category: 'Electrical',
    quantity: 14,
    unit: 'Pieces',
    minStockLevel: 10,
    location: 'Electrical Store Shelf A-3',
    lastRestocked: '2026-10-25',
  },
  {
    id: 'inv-3',
    itemName: 'Brass Bib Cock Water Taps 1/2"',
    category: 'Plumbing',
    quantity: 28,
    unit: 'Pieces',
    minStockLevel: 12,
    location: 'Plumbing Store Rack B',
    lastRestocked: '2026-10-18',
  },
  {
    id: 'inv-4',
    itemName: 'Disinfectant Floor Cleaner Canister',
    category: 'Cleaning',
    quantity: 65,
    unit: 'Liters',
    minStockLevel: 25,
    location: 'Sanitation Bay Ground Floor',
    lastRestocked: '2026-10-29',
  },
  {
    id: 'inv-5',
    itemName: 'Ergonomic Study Chair Spare Casters & Gas Lifts',
    category: 'Furniture',
    quantity: 18,
    unit: 'Sets',
    minStockLevel: 10,
    location: 'Carpentry Workshop',
    lastRestocked: '2026-09-30',
  },
];

const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    action: 'Student Admitted & Bed Allocated',
    performedBy: 'Dr. Rajesh Sharma',
    userRole: 'SUPER_ADMIN',
    timestamp: '2026-10-25 11:20',
    details: 'Admitted Rahul Verma (RA2411003010045) into Room A-101 Bed 1.',
    category: 'Student',
  },
  {
    id: 'log-2',
    action: 'Leave Approved',
    performedBy: 'Prof. Anita Desai',
    userRole: 'WARDEN',
    timestamp: '2026-10-31 16:45',
    details: 'Approved Medical Emergency Leave for Siddharth Nair.',
    category: 'Leave',
  },
  {
    id: 'log-3',
    action: 'Fee Payment Processed',
    performedBy: 'Rahul Verma',
    userRole: 'STUDENT',
    timestamp: '2026-08-25 11:32',
    details: 'Full semester fee payment of ₹82,000 received via UPI.',
    category: 'Fee',
  },
];

// Helper to get from storage or seed
function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
  }
}

// Initialize default state if missing
export const initializeStorage = () => {
  getStorageItem(STORAGE_KEYS.USERS, DEFAULT_USERS);
  getStorageItem(STORAGE_KEYS.HOSTELS, DEFAULT_HOSTELS);
  getStorageItem(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
  getStorageItem(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
  getStorageItem(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
  getStorageItem(STORAGE_KEYS.LEAVE_REQUESTS, DEFAULT_LEAVE_REQUESTS);
  getStorageItem(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
  getStorageItem(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);
  getStorageItem(STORAGE_KEYS.MAINTENANCE_TASKS, DEFAULT_MAINTENANCE_TASKS);
  getStorageItem(STORAGE_KEYS.MESS_MENU, DEFAULT_MESS_MENU);
  getStorageItem(STORAGE_KEYS.MESS_FEEDBACK, DEFAULT_MESS_FEEDBACK);
  getStorageItem(STORAGE_KEYS.FEE_RECORDS, DEFAULT_FEE_RECORDS);
  getStorageItem(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
  getStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
  getStorageItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  getStorageItem(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
  getStorageItem(STORAGE_KEYS.ACTIVITY_LOGS, DEFAULT_ACTIVITY_LOGS);

  // Default active user is Super Admin for instant full exploratory access
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
  }
};

// Auth & Users
export const getCurrentUser = (): User => {
  return getStorageItem<User>(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
};

export const setCurrentUser = (user: User) => {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const getAllUsers = (): User[] => {
  return getStorageItem<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
};

export const switchRole = (role: UserRole, specificStudentId?: string) => {
  const users = getAllUsers();
  let targetUser = users.find((u) => u.role === role);
  if (role === 'STUDENT' && specificStudentId) {
    const matched = users.find((u) => u.studentId === specificStudentId);
    if (matched) targetUser = matched;
  }
  if (targetUser) {
    setCurrentUser(targetUser);
  }
};

// Students
export const getStudents = (): Student[] => {
  return getStorageItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
};

export const saveStudent = (student: Student) => {
  const list = getStudents();
  const existingIdx = list.findIndex((s) => s.id === student.id);
  if (existingIdx >= 0) {
    list[existingIdx] = student;
  } else {
    list.unshift(student);
  }
  setStorageItem(STORAGE_KEYS.STUDENTS, list);
  logActivity({
    action: existingIdx >= 0 ? 'Updated Student Profile' : 'Admitted New Student',
    performedBy: getCurrentUser().name,
    userRole: getCurrentUser().role,
    category: 'Student',
    details: `${student.name} (${student.collegeRegNo}) - Room ${student.roomNumber}`,
  });
};

export const deleteStudent = (studentId: string) => {
  const list = getStudents();
  const student = list.find((s) => s.id === studentId);
  const updated = list.filter((s) => s.id !== studentId);
  setStorageItem(STORAGE_KEYS.STUDENTS, updated);

  // Free up bed in room if allocated
  if (student && student.roomId && student.bedNumber) {
    const rooms = getRooms();
    const room = rooms.find((r) => r.id === student.roomId);
    if (room) {
      room.beds = room.beds.map((b) => (b.bedNumber === student.bedNumber ? { bedNumber: b.bedNumber, isOccupied: false } : b));
      room.occupiedBeds = room.beds.filter((b) => b.isOccupied).length;
      room.status = room.occupiedBeds === 0 ? 'Available' : room.occupiedBeds === room.capacity ? 'Fully Occupied' : 'Partially Occupied';
      saveRoom(room);
    }
  }

  logActivity({
    action: 'Deactivated Student Record',
    performedBy: getCurrentUser().name,
    userRole: getCurrentUser().role,
    category: 'Student',
    details: `Deactivated student record with ID ${studentId}`,
  });
};

// Hostels & Rooms
export const getHostels = (): HostelBuilding[] => {
  return getStorageItem<HostelBuilding[]>(STORAGE_KEYS.HOSTELS, DEFAULT_HOSTELS);
};

export const saveHostel = (hostel: HostelBuilding) => {
  const list = getHostels();
  const idx = list.findIndex((h) => h.id === hostel.id);
  if (idx >= 0) {
    list[idx] = hostel;
  } else {
    list.push(hostel);
  }
  setStorageItem(STORAGE_KEYS.HOSTELS, list);
};

export const getRooms = (): Room[] => {
  return getStorageItem<Room[]>(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
};

export const saveRoom = (room: Room) => {
  const list = getRooms();
  const idx = list.findIndex((r) => r.id === room.id);
  if (idx >= 0) {
    list[idx] = room;
  } else {
    list.push(room);
  }
  setStorageItem(STORAGE_KEYS.ROOMS, list);
};

export const allocateBedToStudent = (studentId: string, targetRoomId: string, targetBedNumber: string) => {
  const students = getStudents();
  const student = students.find((s) => s.id === studentId);
  const rooms = getRooms();
  const targetRoom = rooms.find((r) => r.id === targetRoomId);

  if (!student || !targetRoom) {
    throw new Error('Student or Room not found');
  }

  // Check if bed already occupied
  const bed = targetRoom.beds.find((b) => b.bedNumber === targetBedNumber);
  if (!bed) throw new Error('Selected bed does not exist in this room');
  if (bed.isOccupied && bed.studentId !== studentId) {
    throw new Error('This bed is already occupied by another student');
  }

  // Release old bed if previously allocated
  if (student.roomId && student.bedNumber) {
    const oldRoom = rooms.find((r) => r.id === student.roomId);
    if (oldRoom) {
      oldRoom.beds = oldRoom.beds.map((b) => (b.bedNumber === student.bedNumber ? { bedNumber: b.bedNumber, isOccupied: false } : b));
      oldRoom.occupiedBeds = oldRoom.beds.filter((b) => b.isOccupied).length;
      oldRoom.status = oldRoom.occupiedBeds === 0 ? 'Available' : oldRoom.occupiedBeds === oldRoom.capacity ? 'Fully Occupied' : 'Partially Occupied';
    }
  }

  // Allocate in new room
  targetRoom.beds = targetRoom.beds.map((b) => (b.bedNumber === targetBedNumber ? { bedNumber: targetBedNumber, isOccupied: true, studentId: student.id, studentName: student.name } : b));
  targetRoom.occupiedBeds = targetRoom.beds.filter((b) => b.isOccupied).length;
  targetRoom.status = targetRoom.occupiedBeds === 0 ? 'Available' : targetRoom.occupiedBeds === targetRoom.capacity ? 'Fully Occupied' : 'Partially Occupied';

  // Update student record
  student.roomId = targetRoom.id;
  student.roomNumber = targetRoom.roomNumber;
  student.bedNumber = targetBedNumber;
  student.hostelId = targetRoom.hostelId;
  student.hostelName = targetRoom.hostelName;

  setStorageItem(STORAGE_KEYS.ROOMS, rooms);
  setStorageItem(STORAGE_KEYS.STUDENTS, students);

  logActivity({
    action: 'Bed Allocated / Transferred',
    performedBy: getCurrentUser().name,
    userRole: getCurrentUser().role,
    category: 'Room',
    details: `Allocated ${student.name} to ${targetRoom.roomNumber} - ${targetBedNumber}`,
  });
};

// Attendance
export const getAttendance = (): AttendanceRecord[] => {
  return getStorageItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, DEFAULT_ATTENDANCE);
};

export const markSingleAttendance = (record: AttendanceRecord) => {
  const list = getAttendance();
  const existingIdx = list.findIndex((a) => a.date === record.date && a.studentId === record.studentId);
  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }
  setStorageItem(STORAGE_KEYS.ATTENDANCE, list);
};

export const markBulkAttendance = (records: AttendanceRecord[]) => {
  const list = getAttendance();
  records.forEach((newRec) => {
    const idx = list.findIndex((a) => a.date === newRec.date && a.studentId === newRec.studentId);
    if (idx >= 0) {
      list[idx] = newRec;
    } else {
      list.unshift(newRec);
    }
  });
  setStorageItem(STORAGE_KEYS.ATTENDANCE, list);
  logActivity({
    action: 'Bulk Attendance Marked',
    performedBy: getCurrentUser().name,
    userRole: getCurrentUser().role,
    category: 'System',
    details: `Marked attendance for ${records.length} students on ${records[0]?.date || 'today'}`,
  });
};

// Leave Management
export const getLeaveRequests = (): LeaveRequest[] => {
  return getStorageItem<LeaveRequest[]>(STORAGE_KEYS.LEAVE_REQUESTS, DEFAULT_LEAVE_REQUESTS);
};

export const submitLeaveRequest = (req: LeaveRequest) => {
  const list = getLeaveRequests();
  list.unshift(req);
  setStorageItem(STORAGE_KEYS.LEAVE_REQUESTS, list);

  // Notify Wardens
  addNotification({
    id: `notif-${Date.now()}`,
    userId: 'usr-warden-1',
    title: 'New Leave Application',
    message: `${req.studentName} (${req.roomNumber}) submitted a ${req.leaveType} request.`,
    type: 'leave',
    isRead: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  });

  logActivity({
    action: 'Submitted Leave Request',
    performedBy: req.studentName,
    userRole: 'STUDENT',
    category: 'Leave',
    details: `${req.leaveType}: ${req.reason} (${req.departureDate} to ${req.expectedReturnDate})`,
  });
};

export const updateLeaveStatus = (id: string, status: LeaveRequest['status'], reviewedBy: string, remarks?: string) => {
  const list = getLeaveRequests();
  const item = list.find((l) => l.id === id);
  if (!item) return;

  item.status = status;
  item.reviewedBy = reviewedBy;
  item.reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  if (remarks) item.rejectionReason = remarks;

  setStorageItem(STORAGE_KEYS.LEAVE_REQUESTS, list);

  // Notify Student
  addNotification({
    id: `notif-${Date.now()}`,
    userId: item.studentId,
    title: `Leave Request ${status}`,
    message: `Your ${item.leaveType} application has been ${status.toLowerCase()} by ${reviewedBy}.`,
    type: 'leave',
    isRead: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  });

  // If approved and active today, sync student status & attendance
  if (status === 'Approved') {
    const today = new Date().toISOString().split('T')[0];
    if (today >= item.departureDate && today <= item.expectedReturnDate) {
      markSingleAttendance({
        id: `att-leave-${item.studentId}-${today}`,
        date: today,
        studentId: item.studentId,
        studentName: item.studentName,
        collegeRegNo: item.collegeRegNo,
        hostelName: item.hostelName,
        roomNumber: item.roomNumber,
        department: item.department,
        yearOfStudy: 3,
        status: 'On Leave',
        markedBy: 'System (Approved Leave)',
        markedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        lateEntry: false,
        remarks: `Approved ${item.leaveType} (#${item.id})`,
      });
    }
  }

  logActivity({
    action: `Leave Request ${status}`,
    performedBy: reviewedBy,
    userRole: 'WARDEN',
    category: 'Leave',
    details: `${status} leave for ${item.studentName} (#${item.id})`,
  });
};

// Visitors
export const getVisitors = (): Visitor[] => {
  return getStorageItem<Visitor[]>(STORAGE_KEYS.VISITORS, DEFAULT_VISITORS);
};

export const saveVisitor = (visitor: Visitor) => {
  const list = getVisitors();
  const idx = list.findIndex((v) => v.id === visitor.id);
  if (idx >= 0) {
    list[idx] = visitor;
  } else {
    list.unshift(visitor);
  }
  setStorageItem(STORAGE_KEYS.VISITORS, list);

  logActivity({
    action: idx >= 0 ? 'Updated Visitor Entry' : 'Registered Visitor Pass',
    performedBy: getCurrentUser().name,
    userRole: getCurrentUser().role,
    category: 'Visitor',
    details: `Visitor ${visitor.visitorName} visiting ${visitor.studentName} (Pass: ${visitor.passCode})`,
  });
};

export const updateVisitorStatus = (id: string, status: Visitor['status']) => {
  const list = getVisitors();
  const visitor = list.find((v) => v.id === id);
  if (!visitor) return;
  visitor.status = status;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  if (status === 'Checked In') {
    visitor.entryTime = now.split(' ')[1];
  } else if (status === 'Checked Out') {
    visitor.exitTime = now.split(' ')[1];
  }
  setStorageItem(STORAGE_KEYS.VISITORS, list);

  logActivity({
    action: `Visitor Status: ${status}`,
    performedBy: getCurrentUser().name,
    userRole: getCurrentUser().role,
    category: 'Visitor',
    details: `${visitor.visitorName} marked as ${status}`,
  });
};

// Complaints & Maintenance
export const getComplaints = (): Complaint[] => {
  return getStorageItem<Complaint[]>(STORAGE_KEYS.COMPLAINTS, DEFAULT_COMPLAINTS);
};

export const submitComplaint = (complaint: Complaint) => {
  const list = getComplaints();
  list.unshift(complaint);
  setStorageItem(STORAGE_KEYS.COMPLAINTS, list);

  // Notify Warden
  addNotification({
    id: `notif-${Date.now()}`,
    userId: 'usr-warden-1',
    title: 'New Complaint Registered',
    message: `${complaint.category} issue reported by ${complaint.studentName} in ${complaint.roomNumber}`,
    type: 'complaint',
    isRead: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  });

  logActivity({
    action: 'Registered Complaint',
    performedBy: complaint.studentName,
    userRole: 'STUDENT',
    category: 'Complaint',
    details: `[${complaint.ticketNumber}] ${complaint.category}: ${complaint.title}`,
  });
};

export const updateComplaintStatus = (
  id: string,
  status: Complaint['status'],
  assignedStaffId?: string,
  assignedStaffName?: string,
  resolutionNotes?: string
) => {
  const list = getComplaints();
  const c = list.find((item) => item.id === id);
  if (!c) return;

  c.status = status;
  if (assignedStaffId) c.assignedToStaffId = assignedStaffId;
  if (assignedStaffName) c.assignedStaffName = assignedStaffName;
  if (resolutionNotes) c.resolutionNotes = resolutionNotes;
  if (status === 'Resolved') {
    c.resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  }

  setStorageItem(STORAGE_KEYS.COMPLAINTS, list);

  // If assigned, create or update a maintenance task
  if (assignedStaffId && status === 'Assigned') {
    const tasks = getMaintenanceTasks();
    const newTask: MaintenanceTask = {
      id: `tsk-${Date.now()}`,
      complaintId: c.id,
      title: `${c.category}: ${c.title}`,
      category: c.category,
      hostelName: c.hostelName,
      roomNumber: c.roomNumber,
      assignedStaffId,
      assignedStaffName: assignedStaffName || 'Assigned Staff',
      priority: c.priority,
      status: 'Pending',
      scheduledDate: new Date().toISOString().split('T')[0],
      remarks: c.description,
    };
    tasks.unshift(newTask);
    setStorageItem(STORAGE_KEYS.MAINTENANCE_TASKS, tasks);
  }

  // Notify student
  addNotification({
    id: `notif-${Date.now()}`,
    userId: c.studentId,
    title: `Ticket ${c.ticketNumber} ${status}`,
    message: `Your complaint has been moved to status: ${status}. ${resolutionNotes ? `Notes: ${resolutionNotes}` : ''}`,
    type: 'complaint',
    isRead: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  });

  logActivity({
    action: `Complaint Status Updated: ${status}`,
    performedBy: getCurrentUser().name,
    userRole: getCurrentUser().role,
    category: 'Complaint',
    details: `Ticket ${c.ticketNumber} updated to ${status}`,
  });
};

export const getMaintenanceTasks = (): MaintenanceTask[] => {
  return getStorageItem<MaintenanceTask[]>(STORAGE_KEYS.MAINTENANCE_TASKS, DEFAULT_MAINTENANCE_TASKS);
};

export const updateMaintenanceTaskStatus = (id: string, status: MaintenanceTask['status'], remarks?: string) => {
  const list = getMaintenanceTasks();
  const task = list.find((t) => t.id === id);
  if (!task) return;
  task.status = status;
  if (remarks) task.remarks = remarks;
  if (status === 'Completed') {
    task.completedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    // If linked to complaint, auto-resolve complaint
    if (task.complaintId) {
      updateComplaintStatus(task.complaintId, 'Resolved', task.assignedStaffId, task.assignedStaffName, remarks || 'Completed by maintenance staff.');
    }
  }
  setStorageItem(STORAGE_KEYS.MAINTENANCE_TASKS, list);

  logActivity({
    action: `Maintenance Task ${status}`,
    performedBy: getCurrentUser().name,
    userRole: 'STAFF',
    category: 'System',
    details: `${task.title} in ${task.roomNumber} marked as ${status}`,
  });
};

// Mess Management
export const getMessMenu = (): DayMessMenu[] => {
  return getStorageItem<DayMessMenu[]>(STORAGE_KEYS.MESS_MENU, DEFAULT_MESS_MENU);
};

export const updateMessMenu = (dayMenu: DayMessMenu) => {
  const list = getMessMenu();
  const idx = list.findIndex((m) => m.day === dayMenu.day);
  if (idx >= 0) {
    list[idx] = dayMenu;
  }
  setStorageItem(STORAGE_KEYS.MESS_MENU, list);

  logActivity({
    action: 'Mess Menu Updated',
    performedBy: getCurrentUser().name,
    userRole: getCurrentUser().role,
    category: 'System',
    details: `Updated meal schedule for ${dayMenu.day}`,
  });
};

export const getMessFeedback = (): MessFeedback[] => {
  return getStorageItem<MessFeedback[]>(STORAGE_KEYS.MESS_FEEDBACK, DEFAULT_MESS_FEEDBACK);
};

export const submitMessFeedback = (fb: MessFeedback) => {
  const list = getMessFeedback();
  list.unshift(fb);
  setStorageItem(STORAGE_KEYS.MESS_FEEDBACK, list);

  logActivity({
    action: 'Submitted Mess Feedback',
    performedBy: fb.studentName,
    userRole: 'STUDENT',
    category: 'System',
    details: `${fb.mealType} rated ${fb.rating}/5 stars (${fb.quality})`,
  });
};

// Fee & Payments
export const getFeeRecords = (): FeeRecord[] => {
  return getStorageItem<FeeRecord[]>(STORAGE_KEYS.FEE_RECORDS, DEFAULT_FEE_RECORDS);
};

export const getPayments = (): PaymentTransaction[] => {
  return getStorageItem<PaymentTransaction[]>(STORAGE_KEYS.PAYMENTS, DEFAULT_PAYMENTS);
};

export const processPayment = (payment: PaymentTransaction) => {
  const payments = getPayments();
  payments.unshift(payment);
  setStorageItem(STORAGE_KEYS.PAYMENTS, payments);

  // Update corresponding fee record
  const feeRecords = getFeeRecords();
  const fee = feeRecords.find((f) => f.id === payment.feeRecordId);
  if (fee) {
    fee.paidAmount += payment.amount;
    fee.pendingAmount = Math.max(0, fee.totalAmount - fee.paidAmount);
    fee.status = fee.pendingAmount === 0 ? 'Paid' : 'Partial';
    fee.lastPaymentDate = payment.date.split(' ')[0];
    setStorageItem(STORAGE_KEYS.FEE_RECORDS, feeRecords);
  }

  // Send Notification
  addNotification({
    id: `notif-${Date.now()}`,
    userId: payment.studentId,
    title: 'Payment Successful',
    message: `Receipt ${payment.receiptNumber} generated for amount ₹${payment.amount.toLocaleString()}.`,
    type: 'fee',
    isRead: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  });

  logActivity({
    action: 'Fee Payment Processed',
    performedBy: payment.studentName,
    userRole: 'STUDENT',
    category: 'Fee',
    details: `Payment of ₹${payment.amount.toLocaleString()} received. Receipt: ${payment.receiptNumber}`,
  });
};

// Announcements
export const getAnnouncements = (): Announcement[] => {
  return getStorageItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
};

export const saveAnnouncement = (ann: Announcement) => {
  const list = getAnnouncements();
  const idx = list.findIndex((a) => a.id === ann.id);
  if (idx >= 0) {
    list[idx] = ann;
  } else {
    list.unshift(ann);
  }
  setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, list);

  // Broadcast notification to relevant users
  addNotification({
    id: `notif-${Date.now()}`,
    userId: 'all',
    title: `Announcement: ${ann.title}`,
    message: ann.content.substring(0, 100) + '...',
    type: 'announcement',
    isRead: false,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  });

  logActivity({
    action: 'Published Announcement',
    performedBy: ann.postedByName,
    userRole: getCurrentUser().role,
    category: 'System',
    details: `[${ann.priority}] ${ann.title}`,
  });
};

export const deleteAnnouncement = (id: string) => {
  const list = getAnnouncements();
  const updated = list.filter((a) => a.id !== id);
  setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, updated);
};

// Notifications
export const getNotifications = (): NotificationItem[] => {
  return getStorageItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
};

export const addNotification = (item: NotificationItem) => {
  const list = getNotifications();
  list.unshift(item);
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, list);
};

export const markNotificationRead = (id: string) => {
  const list = getNotifications();
  const item = list.find((n) => n.id === id);
  if (item) {
    item.isRead = true;
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }
};

export const markAllNotificationsRead = (userId: string) => {
  const list = getNotifications();
  list.forEach((n) => {
    if (n.userId === userId || n.userId === 'all') {
      n.isRead = true;
    }
  });
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, list);
};

// Inventory
export const getInventory = (): InventoryItem[] => {
  return getStorageItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
};

export const saveInventoryItem = (item: InventoryItem) => {
  const list = getInventory();
  const idx = list.findIndex((i) => i.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.push(item);
  }
  setStorageItem(STORAGE_KEYS.INVENTORY, list);

  logActivity({
    action: 'Inventory Stock Updated',
    performedBy: getCurrentUser().name,
    userRole: 'STAFF',
    category: 'System',
    details: `${item.itemName}: ${item.quantity} ${item.unit} available`,
  });
};

// Activity Logs
export const getActivityLogs = (): ActivityLog[] => {
  return getStorageItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, DEFAULT_ACTIVITY_LOGS);
};

export const logActivity = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  logs.unshift(newLog);
  // Keep last 150 logs
  if (logs.length > 150) logs.pop();
  setStorageItem(STORAGE_KEYS.ACTIVITY_LOGS, logs);
};

// Demo Data Reset and Export
export const resetDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  localStorage.setItem(STORAGE_KEYS.HOSTELS, JSON.stringify(DEFAULT_HOSTELS));
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(DEFAULT_ROOMS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(DEFAULT_ATTENDANCE));
  localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(DEFAULT_LEAVE_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(DEFAULT_VISITORS));
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(DEFAULT_COMPLAINTS));
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE_TASKS, JSON.stringify(DEFAULT_MAINTENANCE_TASKS));
  localStorage.setItem(STORAGE_KEYS.MESS_MENU, JSON.stringify(DEFAULT_MESS_MENU));
  localStorage.setItem(STORAGE_KEYS.MESS_FEEDBACK, JSON.stringify(DEFAULT_MESS_FEEDBACK));
  localStorage.setItem(STORAGE_KEYS.FEE_RECORDS, JSON.stringify(DEFAULT_FEE_RECORDS));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(DEFAULT_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(DEFAULT_ACTIVITY_LOGS));
  notifySubscribers();
};
