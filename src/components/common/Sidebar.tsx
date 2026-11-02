import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building,
  BedDouble,
  UserCog,
  CalendarCheck2,
  PlaneTakeoff,
  UserCheck,
  MessageSquareWarning,
  UtensilsCrossed,
  CreditCard,
  BarChart3,
  Megaphone,
  Settings,
  User,
  Wrench,
  Package,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
}) => {
  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'SUPER_ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Student Admissions', icon: Users },
          { id: 'hostels', label: 'Hostel Buildings', icon: Building },
          { id: 'rooms', label: 'Room & Bed Allocation', icon: BedDouble },
          { id: 'staff', label: 'Staff Management', icon: UserCog },
          { id: 'attendance', label: 'Daily Attendance', icon: CalendarCheck2 },
          { id: 'leave', label: 'Leave Management', icon: PlaneTakeoff },
          { id: 'visitors', label: 'Visitor Logs & Passes', icon: UserCheck },
          { id: 'complaints', label: 'Complaints & Service', icon: MessageSquareWarning },
          { id: 'mess', label: 'Mess & Food Menu', icon: UtensilsCrossed },
          { id: 'fees', label: 'Fee Management', icon: CreditCard },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'settings', label: 'Rules & Audit Logs', icon: Settings },
        ];

      case 'WARDEN':
        return [
          { id: 'dashboard', label: 'Warden Dashboard', icon: LayoutDashboard },
          { id: 'students', label: 'Hostel Students', icon: Users },
          { id: 'rooms', label: 'Room Occupancy Map', icon: BedDouble },
          { id: 'attendance', label: 'Daily Roll Call', icon: CalendarCheck2 },
          { id: 'leave', label: 'Leave Approvals', icon: PlaneTakeoff },
          { id: 'visitors', label: 'Visitor Management', icon: UserCheck },
          { id: 'complaints', label: 'Hostel Complaints', icon: MessageSquareWarning },
          { id: 'mess', label: 'Mess Schedule & Quality', icon: UtensilsCrossed },
          { id: 'announcements', label: 'Hostel Notices', icon: Megaphone },
          { id: 'reports', label: 'Daily Reports', icon: FileSpreadsheet },
        ];

      case 'STUDENT':
        return [
          { id: 'student_dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'student_profile', label: 'My Profile', icon: User },
          { id: 'student_room', label: 'My Room & Roommates', icon: BedDouble },
          { id: 'student_attendance', label: 'My Attendance Record', icon: CalendarCheck2 },
          { id: 'student_leave', label: 'Apply / Track Leave', icon: PlaneTakeoff },
          { id: 'student_visitors', label: 'My Visitor Passes', icon: UserCheck },
          { id: 'student_complaints', label: 'Report Complaints', icon: MessageSquareWarning },
          { id: 'student_mess', label: 'Mess Menu & Feedback', icon: UtensilsCrossed },
          { id: 'student_fees', label: 'Fees & Pay Online', icon: CreditCard },
          { id: 'student_announcements', label: 'Announcements', icon: Megaphone },
        ];

      case 'STAFF':
        return [
          { id: 'staff_dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
          { id: 'staff_tasks', label: 'Assigned Work Orders', icon: Wrench },
          { id: 'staff_inventory', label: 'Tools & Inventory', icon: Package },
          { id: 'staff_history', label: 'Completed History', icon: History },
          { id: 'staff_profile', label: 'Staff Profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-300 flex flex-col justify-between h-[calc(100vh-4rem)]">
      {/* Scrollable Navigation */}
      <div className="overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-indigo-500/30 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Campus Network</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Operational
          </span>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">Hostel ERP Server v2.4.0</p>
      </div>
    </aside>
  );
};
