import React from "react";
import { Routes, Route } from "react-router-dom";
import ConsoleLayout from "../layouts/consoleLayout";
import AuthProvider from "../hooks/AuthProvider";

import Home from "../page/publicpages/home";
import ReportView from "../page/publicpages/reportview";
import MachineConfigPage from "../page/publicpages/MachineConfigPage";
import SchedulePage from "../page/privatepages/SchedulePage";
import ShiftList from "../page/privatepages/ShiftList";
import Dashboard from "../page/privatepages/Dashboard";
import EventsList from "../page/privatepages/EventsList";
import ReportHistoryPage from "../page/privatepages/ReportHistoryPage";
import DocumentViewerPage from "../page/privatepages/DocumentViewerPage";
import ReportConfigPage from "../page/privatepages/ReportConfigPage";
import SQLReportViewPage from "../page/privatepages/SQLReportViewPage";
import SQLSchedulePage from "../page/privatepages/SQLSchedulePage";
import SQLHistoryPage from "../page/privatepages/SQLHistoryPage";

interface PrivateRoutesProps {
  baseUrl: string;
}

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({ baseUrl }) => {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<ConsoleLayout />}>
          <Route path="home" element={<Home />} />
          {/* <Route path="reportview" element={<ReportView />} /> */}
          <Route path="machineconfigs" element={<MachineConfigPage />} />
          <Route path="scheduleconfigs" element={<SchedulePage />} />
          <Route path="shiftconfigs" element={<ShiftList />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="eventlogs" element={<EventsList />} />
          <Route path="reporthistory" element={<ReportHistoryPage />} />
          <Route path="docviewer" element={<DocumentViewerPage />} />
          <Route path="reportconfigs" element={<ReportConfigPage />} />
          <Route path="sqlreportview" element={<SQLReportViewPage />} />
          <Route path="sqlreportschedule" element={<SQLSchedulePage />} />
          <Route path="sqlreporthistory" element={<SQLHistoryPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default PrivateRoutes;
