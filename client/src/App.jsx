import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLoginPage } from './features/auth/AdminLoginPage';
import { StaffLoginPage } from './features/auth/StaffLoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { AdminOverviewPage } from './features/admin/AdminOverviewPage';
import { DepartmentManagementPage } from './features/admin/DepartmentManagementPage';
import { StaffManagementPage } from './features/admin/StaffManagementPage';
import { AdminAttendancePage } from './features/admin/AdminAttendancePage';
import { AdminTaskPage } from './features/admin/AdminTaskPage';
import { AdminWorkReportsPage } from './features/admin/AdminWorkReportsPage';
import { AdminAnalyticsPage } from './features/admin/AdminAnalyticsPage';
import { AdminExcelExportsPage } from './features/admin/AdminExcelExportsPage';
import { AdminActivityLogsPage } from './features/admin/AdminActivityLogsPage';
import { AdminSettingsPage } from './features/admin/AdminSettingsPage';
import { StaffDashboardPage } from './features/staff/StaffDashboardPage';
import { MyAttendancePage } from './features/staff/MyAttendancePage';
import { MyTasksPage } from './features/staff/MyTasksPage';
import { DailyWorkLogPage } from './features/staff/DailyWorkLogPage';
import { StaffProfilePage } from './features/staff/StaffProfilePage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/staff-login" element={<StaffLoginPage />} />

            {/* Admin Portal Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminOverviewPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <StaffManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <DepartmentManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminAttendancePage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminTaskPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/work-reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminWorkReportsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminAnalyticsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminExcelExportsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activity-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminActivityLogsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminSettingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminOverviewPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Staff Portal Protected Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffLayout>
                    <StaffDashboardPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/attendance"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffLayout>
                    <MyAttendancePage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/tasks"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffLayout>
                    <MyTasksPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/work-logs"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffLayout>
                    <DailyWorkLogPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/profile"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffLayout>
                    <StaffProfilePage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffLayout>
                    <StaffDashboardPage />
                  </StaffLayout>
                </ProtectedRoute>
              }
            />

            {/* Default root fallback */}
            <Route path="/" element={<Navigate to="/staff-login" replace />} />
            <Route path="*" element={<Navigate to="/staff-login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
