import React from "react";
import { Routes, Route } from "react-router-dom";
import ConsoleLayout from "../layouts/consoleLayout";
import { AuthProvider } from "../hooks/RBACAuthProvider";

import DocumentViewerPage from "../page/privatepages/DocumentViewerPage";
import ReportConfigPage from "../page/privatepages/ReportConfigPage";
import SQLReportViewPage from "../page/privatepages/SQLReportViewPage";
import SQLSchedulePage from "../page/privatepages/SQLSchedulePage";
import SQLHistoryPage from "../page/privatepages/SQLHistoryPage";
import SQLReportDashboard from "../page/privatepages/SQLReportDashboard";

interface PrivateRoutesProps {
  baseUrl: string;
}

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({ baseUrl }) => {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<ConsoleLayout baseUrl={baseUrl} />}>
          {/* <Route path="home" element={<Home />} />
          {/* <Route path="reportview" element={<ReportView />} /> */}
          {/* <Route path="machineconfigs" element={<MachineConfigPage />} />
          <Route path="scheduleconfigs" element={<SchedulePage />} />
          <Route path="shiftconfigs" element={<ShiftList />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="eventlogs" element={<EventsList />} />
          <Route path="reporthistory" element={<ReportHistoryPage />} /> */}
          <Route path="docviewer" element={<DocumentViewerPage />} />
          <Route path="sqlreportconfigs" element={<ReportConfigPage />} />
          <Route path="/" element={<SQLReportDashboard />} />
          <Route path="sqlreportschedule" element={<SQLSchedulePage />} />
          <Route path="sqlreporthistory" element={<SQLHistoryPage />} />
          <Route path="sqlreportdashboard" element={<SQLReportViewPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default PrivateRoutes;
