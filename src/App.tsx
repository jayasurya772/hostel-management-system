/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { EmergencyModal, RulesModal } from './components/common/HelpModals';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { HostelManagement } from './components/admin/HostelManagement';
import { RoomAllocation } from './components/admin/RoomAllocation';
import { StaffManagement } from './components/admin/StaffManagement';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { LeaveModule } from './components/leave/LeaveModule';
import { VisitorModule } from './components/visitors/VisitorModule';
import { ComplaintModule } from './components/complaints/ComplaintModule';
import { MessModule } from './components/mess/MessModule';
import { FeeModule } from './components/fees/FeeModule';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { AnnouncementModule } from './components/announcements/AnnouncementModule';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { SettingsAuditModule } from './components/settings/SettingsAuditModule';
import {
  initializeStorage,
  getCurrentUser,
  subscribeToStorage,
} from './services/storage';
import { UserRole } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    initializeStorage();
    return getCurrentUser();
  });

  const getDefaultTabForRole = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'WARDEN':
        return 'dashboard';
      case 'STUDENT':
        return 'student_dashboard';
      case 'STAFF':
        return 'staff_dashboard';
    }
  };

  const [activeTab, setActiveTab] = useState<string>(() =>
    getDefaultTabForRole(currentUser.role)
  );

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  useEffect(() => {
    const handleStorageUpdate = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
    };
    const unsubscribe = subscribeToStorage(handleStorageUpdate);
    return () => unsubscribe();
  }, []);

  // When role changes, ensure active tab matches role context
  useEffect(() => {
    const validTabsForRole = {
      SUPER_ADMIN: [
        'dashboard',
        'students',
        'hostels',
        'rooms',
        'staff',
        'attendance',
        'leave',
        'visitors',
        'complaints',
        'mess',
        'fees',
        'reports',
        'announcements',
        'settings',
      ],
      WARDEN: [
        'dashboard',
        'students',
        'rooms',
        'attendance',
        'leave',
        'visitors',
        'complaints',
        'mess',
        'announcements',
        'reports',
      ],
      STUDENT: [
        'student_dashboard',
        'student_profile',
        'student_room',
        'student_attendance',
        'student_leave',
        'student_visitors',
        'student_complaints',
        'student_mess',
        'student_fees',
        'student_announcements',
      ],
      STAFF: [
        'staff_dashboard',
        'staff_tasks',
        'staff_inventory',
        'staff_history',
        'staff_profile',
      ],
    };

    const validTabs = validTabsForRole[currentUser.role];
    if (!validTabs.includes(activeTab)) {
      setActiveTab(getDefaultTabForRole(currentUser.role));
    }
  }, [currentUser.role]);

  const renderActiveModule = () => {
    // Student-specific mapping
    if (currentUser.role === 'STUDENT') {
      switch (activeTab) {
        case 'student_dashboard':
        case 'student_profile':
        case 'student_room':
          return (
            <StudentDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenSOS={() => setIsSOSOpen(true)}
              onOpenRules={() => setIsRulesOpen(true)}
            />
          );
        case 'student_attendance':
          return <AttendanceModule />;
        case 'student_leave':
          return <LeaveModule />;
        case 'student_visitors':
          return <VisitorModule />;
        case 'student_complaints':
          return <ComplaintModule />;
        case 'student_mess':
          return <MessModule />;
        case 'student_fees':
          return <FeeModule />;
        case 'student_announcements':
          return <AnnouncementModule />;
        default:
          return (
            <StudentDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenSOS={() => setIsSOSOpen(true)}
              onOpenRules={() => setIsRulesOpen(true)}
            />
          );
      }
    }

    // Staff-specific mapping
    if (currentUser.role === 'STAFF') {
      switch (activeTab) {
        case 'staff_dashboard':
        case 'staff_tasks':
        case 'staff_inventory':
        case 'staff_history':
          return <StaffDashboard />;
        case 'staff_profile':
          return <StaffManagement />;
        default:
          return <StaffDashboard />;
      }
    }

    // Super Admin & Warden mappings
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'students':
        return <StudentManagement />;
      case 'hostels':
        return <HostelManagement />;
      case 'rooms':
        return <RoomAllocation />;
      case 'staff':
        return <StaffManagement />;
      case 'attendance':
        return <AttendanceModule />;
      case 'leave':
        return <LeaveModule />;
      case 'visitors':
        return <VisitorModule />;
      case 'complaints':
        return <ComplaintModule />;
      case 'mess':
        return <MessModule />;
      case 'fees':
        return <FeeModule />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'announcements':
        return <AnnouncementModule />;
      case 'settings':
        return <SettingsAuditModule />;
      default:
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        onOpenEmergency={() => setIsSOSOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Main Workspace: Sidebar + Scrollable Viewport */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentRole={currentUser.role}
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderActiveModule()}
        </main>
      </div>

      {/* Global Modals */}
      <EmergencyModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
