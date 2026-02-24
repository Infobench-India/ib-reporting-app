import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ConsoleLayout from '../layouts/consoleLayout';
import { AuthProvider } from '../hooks/RBACAuthProvider';
import { ProtectedRoute, PublicRoute } from './ProtectedRoutes';
import { LoginForm } from '../common/LoginForm';

// Private pages
import Home from '../page/publicpages/home';
import ReportView from '../page/publicpages/reportview';
import MachineConfigPage from '../page/publicpages/MachineConfigPage';
import SchedulePage from '../page/privatepages/SchedulePage';
import ShiftList from '../page/privatepages/ShiftList';
import Dashboard from '../page/privatepages/Dashboard';
import EventsList from '../page/privatepages/EventsList';
import ReportHistoryPage from '../page/privatepages/ReportHistoryPage';
import DocumentViewerPage from '../page/privatepages/DocumentViewerPage';
import ReportConfigPage from '../page/privatepages/ReportConfigPage';
import SQLReportViewPage from '../page/privatepages/SQLReportViewPage';
import SQLSchedulePage from '../page/privatepages/SQLSchedulePage';
import SQLHistoryPage from '../page/privatepages/SQLHistoryPage';
import SQLReportDashboard from '../page/privatepages/SQLReportDashboard';
// import ErrorPage from '../page/error';

interface RBACRoutesProps {
  baseUrl: string;
}

const RBACRoutes: React.FC<RBACRoutesProps> = ({ baseUrl }) => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <ConsoleLayout baseUrl={baseUrl} />
            </ProtectedRoute>
          }
        >
          {/* General Access (all authenticated users) */}
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Report Management - Requires read_report permission */}
          <Route
            path="sqlreportview"
            element={
              <ProtectedRoute requiredPermissions={['read_report']}>
                <SQLReportViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="reporthistory"
            element={
              <ProtectedRoute requiredPermissions={['read_report']}>
                <ReportHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="sqlreporthistory"
            element={
              <ProtectedRoute requiredPermissions={['read_report']}>
                <SQLHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="sqlreportdashboard"
            element={
              <ProtectedRoute requiredPermissions={['read_report']}>
                <SQLReportDashboard />
              </ProtectedRoute>
            }
          />

          {/* Schedule Management - Requires create_report permission */}
          <Route
            path="scheduleconfigs"
            element={
              <ProtectedRoute requiredPermissions={['create_report']}>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="sqlreportschedule"
            element={
              <ProtectedRoute requiredPermissions={['create_report']}>
                <SQLSchedulePage />
              </ProtectedRoute>
            }
          />

          {/* Report Configuration - Admin only */}
          <Route
            path="reportconfigs"
            element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <ReportConfigPage />
              </ProtectedRoute>
            }
          />

          {/* Machine Configuration - Admin/Manager only */}
          <Route
            path="machineconfigs"
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Manager']}>
                <MachineConfigPage />
              </ProtectedRoute>
            }
          />

          {/* Shift Configuration - Admin only */}
          <Route
            path="shiftconfigs"
            element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <ShiftList />
              </ProtectedRoute>
            }
          />

          {/* Event Logs - Admin only */}
          <Route
            path="eventlogs"
            element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <EventsList />
              </ProtectedRoute>
            }
          />

          {/* Document Viewer - Read only access */}
          <Route
            path="docviewer"
            element={
              <ProtectedRoute requiredPermissions={['read_report']}>
                <DocumentViewerPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Error Routes */}
        {/* <Route path="error" element={<ErrorPage />} /> */}
        <Route path="*" element={<Navigate to="/error" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default RBACRoutes;
