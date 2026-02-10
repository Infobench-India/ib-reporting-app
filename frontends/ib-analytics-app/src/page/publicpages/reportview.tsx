import React, { useEffect, useRef } from 'react';
import AnalyticsChart from '../../components/machineCard/AnalyticsChart';
import MachineStatusCard from '../../components/machineCard/MachineStatusCard';
import { getMockAnalyticsData, getMockMachineData,  mockOeeData,calculateOEE } from '../../mock/mockData';
// import PdfReport from '../../components/PdfReportAdvanced';
import Dashboard from '../privatepages/Dashboard';


const ReportView: React.FC = () => {
  const machineData = getMockMachineData();
  const analyticsData = getMockAnalyticsData();
 const oeeResults = calculateOEE(mockOeeData);
 useEffect(() => {
  const waitForRender = async () => {
    // wait a little to ensure charts render
    await new Promise(res => setTimeout(res, 500));

    (window as any).__REPORT_READY__ = true;
  };

  waitForRender();
}, []);
  return (
          <Dashboard></Dashboard>
  );
};

export default ReportView;