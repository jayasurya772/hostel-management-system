export type UserRole = 'SUPER_ADMIN' | 'WARDEN' | 'STUDENT' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  studentId?: string; // Reference to student record if role is STUDENT
  staffRole?: string; // e.g. "Senior Electrician", "Hostel Caretaker", "Plumber"
  assignedHostelId?: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. "STU-2024-001"
  collegeRegNo: string; // e.g. "RA2411003010045"
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  department: string;
  yearOfStudy: number; // 1, 2, 3, 4
  photoUrl: string;
  parentName: string;
  parentPhone: string;
  emergencyContact: string;
  hostelId: string;
  hostelName: string;
  floorNo: number;
  roomId: string;
  roomNumber: string;
  bedNumber: string;
  admissionDate: string;
  status: 'Active' | 'On Leave' | 'Vacated' | 'Suspended';
}

export interface HostelBuilding {
  id: string;
  name: string;
  code: string;
  gender: 'Boys' | 'Girls' | 'Co-ed';
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  wardenName: string;
  wardenContact: string;
  caretakerName: string;
}

export interface Floor {
  id: string;
  hostelId: string;
  floorNumber: number;
  name: string;
  totalRooms: number;
}

export type RoomType = 'Single' | 'Double' | 'Triple' | 'Four Sharing';
export type RoomStatus = 'Available' | 'Fully Occupied' | 'Partially Occupied' | 'Maintenance';

export interface Bed {
  bedNumber: string;
  isOccupied: boolean;
  studentId?: string;
  studentName?: string;
}

export interface Room {
  id: string;
  hostelId: string;
  hostelName: string;
  floorNumber: number;
  roomNumber: string;
  type: RoomType;
  capacity: number;
  occupiedBeds: number;
  status: RoomStatus;
  beds: Bed[];
  dailyRate?: number;
  hasAC: boolean;
  hasAttachedWashroom: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  collegeRegNo: string;
  hostelName: string;
  roomNumber: string;
  department: string;
  yearOfStudy: number;
  status: 'Present' | 'Absent' | 'On Leave';
  markedBy: string;
  markedAt: string;
  lateEntry: boolean;
  lateEntryTime?: string;
  remarks?: string;
}

export type LeaveType = 'Home Visit' | 'Medical Emergency' | 'Academic / Conference' | 'Weekend Outing' | 'Personal';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed';

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  collegeRegNo: string;
  department: string;
  roomNumber: string;
  hostelName: string;
  leaveType: LeaveType;
  reason: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  expectedReturnDate: string;
  expectedReturnTime: string;
  actualReturnDateTime?: string;
  parentPhone: string;
  parentConsentVerified: boolean;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type VisitorStatus = 'Pending' | 'Approved' | 'Checked In' | 'Checked Out' | 'Rejected';

export interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  idProofType: 'Aadhar Card' | 'Driving License' | 'Passport' | 'Voter ID';
  idProofNumber: string;
  relationWithStudent: string;
  studentId: string;
  studentName: string;
  studentRoomNo: string;
  hostelName: string;
  purpose: string;
  visitDate: string;
  entryTime?: string;
  exitTime?: string;
  passCode: string; // unique alphanumeric token for QR
  status: VisitorStatus;
  approvedBy?: string;
  createdAt: string;
  notes?: string;
}

export type ComplaintCategory =
  | 'Electrical'
  | 'Plumbing'
  | 'Cleaning'
  | 'Wi-Fi'
  | 'Furniture'
  | 'Room Maintenance'
  | 'Water Supply'
  | 'Mess / Food'
  | 'Other';

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';

export interface Complaint {
  id: string;
  ticketNumber: string; // e.g. "TCK-8921"
  studentId: string;
  studentName: string;
  roomNumber: string;
  hostelName: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  imageUrl?: string;
  status: ComplaintStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  assignedToStaffId?: string;
  assignedStaffName?: string;
  submittedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface MaintenanceTask {
  id: string;
  complaintId?: string;
  title: string;
  category: string;
  hostelName: string;
  roomNumber: string;
  assignedStaffId: string;
  assignedStaffName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  status: 'Pending' | 'In Progress' | 'Completed';
  scheduledDate: string;
  completedAt?: string;
  remarks?: string;
}

export interface DayMessMenu {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
  specialDish?: string;
}

export interface MessFeedback {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  rating: number; // 1 to 5
  quality: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  comments: string;
  createdAt: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  collegeRegNo: string;
  roomNumber: string;
  hostelName: string;
  academicYear: string;
  semester: string;
  hostelFee: number;
  messFee: number;
  maintenanceFee: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  lastPaymentDate?: string;
}

export interface PaymentTransaction {
  id: string;
  feeRecordId: string;
  studentId: string;
  studentName: string;
  collegeRegNo: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: 'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'Demand Draft';
  transactionId: string;
  date: string;
  status: 'Success' | 'Pending' | 'Failed';
  breakdown: {
    hostelFee: number;
    messFee: number;
    maintenanceFee: number;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'All' | 'Students' | 'Wardens' | 'Staff';
  priority: 'Normal' | 'Urgent' | 'Info';
  hostelScope: string; // 'All Hostels' or specific hostel
  postedByName: string;
  postedByRole: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // or 'all' or 'role:WARDEN'
  title: string;
  message: string;
  type: 'leave' | 'fee' | 'announcement' | 'complaint' | 'attendance' | 'visitor' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: 'Electrical' | 'Plumbing' | 'Cleaning' | 'Furniture' | 'Linen' | 'General';
  quantity: number;
  unit: string; // e.g. "Pieces", "Packets", "Liters"
  minStockLevel: number;
  location: string;
  lastRestocked: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  userRole: UserRole;
  timestamp: string;
  details: string;
  category: 'Student' | 'Room' | 'Leave' | 'Visitor' | 'Complaint' | 'Fee' | 'System';
}
