import React, { useState, useEffect } from 'react';
import {
  Bell,
  Building2,
  ShieldCheck,
  User as UserIcon,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { User, UserRole, NotificationItem } from '../../types';
import {
  getCurrentUser,
  switchRole,
  getAllUsers,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  resetDemoData,
  subscribeToStorage,
} from '../../services/storage';

interface HeaderProps {
  onOpenRules: () => void;
  onOpenEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRules, onOpenEmergency }) => {
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(getAllUsers());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const update = () => {
      setCurrentUserState(getCurrentUser());
      setAllUsers(getAllUsers());
      const notifs = getNotifications();
      const user = getCurrentUser();
      const filtered = notifs.filter(
        (n) => n.userId === user.id || n.userId === 'all' || (user.studentId && n.userId === user.studentId)
      );
      setNotifications(filtered);
    };
    update();
    const unsubscribe = subscribeToStorage(update);
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRoleSelect = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
  };

  const handleResetData = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'WARDEN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STUDENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'STAFF':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'WARDEN':
        return 'Hostel Warden';
      case 'STUDENT':
        return 'Hostel Resident';
      case 'STAFF':
        return 'Maintenance Staff';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-xs">
      {/* Brand & Institution */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
          <Building2 className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg tracking-tight">SMART HOSTEL</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
              v2.4 Pro
            </span>
          </div>
          <p className="hidden text-xs text-slate-500 sm:block">Campus Living Automation & Operations</p>
        </div>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            title="Switch demo view to test all 4 primary user roles"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className={`rounded-sm border px-1.5 py-0.5 font-semibold text-[11px] ${getRoleBadgeColor(currentUser.role)}`}>
              {getRoleLabel(currentUser.role)}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-xs">
              <div className="px-2 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Switch Active View
              </div>
              <button
                onClick={() => handleRoleSelect('SUPER_ADMIN')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left ${
                  currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium">Dr. Rajesh Sharma</div>
                  <div className="text-[11px] text-slate-500">Super Administrator</div>
                </div>
                {currentUser.role === 'SUPER_ADMIN' && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
              </button>
              <button
                onClick={() => handleRoleSelect('WARDEN')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left ${
                  currentUser.role === 'WARDEN' ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium">Prof. Anita Desai</div>
                  <div className="text-[11px] text-slate-500">Hostel Warden (Block A)</div>
                </div>
                {currentUser.role === 'WARDEN' && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
              </button>
              <button
                onClick={() => handleRoleSelect('STUDENT')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left ${
                  currentUser.role === 'STUDENT' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium">Rahul Verma (A-101)</div>
                  <div className="text-[11px] text-slate-500">Student Resident</div>
                </div>
                {currentUser.role === 'STUDENT' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </button>
              <button
                onClick={() => handleRoleSelect('STAFF')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left ${
                  currentUser.role === 'STAFF' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-medium">Ramesh Kumar</div>
                  <div className="text-[11px] text-slate-500">Maintenance & Electrical Staff</div>
                </div>
                {currentUser.role === 'STAFF' && <CheckCircle2 className="h-4 w-4 text-amber-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Emergency SOS & Rules Quick Buttons */}
        <button
          onClick={onOpenEmergency}
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
          title="Emergency Help & Contacts"
        >
          <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          <span>Emergency SOS</span>
        </button>

        <button
          onClick={onOpenRules}
          className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          title="Hostel Rules & Code of Conduct"
        >
          <FileText className="h-3.5 w-3.5 text-slate-500" />
          <span>Rules</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead(currentUser.id)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer ${
                        notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-slate-900">{notif.title}</div>
                        <span className="text-[10px] text-slate-400 shrink-0">{notif.createdAt}</span>
                      </div>
                      <p className="mt-1 text-slate-600">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Reset Tool */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Reset to fresh demo sample data"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Current User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.name}
            className="h-8 w-8 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</div>
            <div className="text-[11px] text-slate-500">{currentUser.email}</div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset Demo Data?</h3>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              This will restore the original demo records for students, rooms, attendance, complaints, mess menus, and payments. Any temporary edits made during this session will be refreshed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
