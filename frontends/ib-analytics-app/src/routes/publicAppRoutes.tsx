import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch } from "../store";
import SystemConfig from "../redux/features/apis/SystemConfigAPI";

import PrivateRoutes from "../routes/privateRoutes";
import Dashboard1 from "../page/publicpages/Dashboard1";
import Dashboard2 from "../page/publicpages/Dashboard2";
interface AppRoutesProps {
  baseUrl: string;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ baseUrl }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("readOnlySystemConfig started");
    dispatch(SystemConfig.getAll({}));
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="remote/dashboard1" element={<Dashboard1 />} />
      <Route path="remote/dashboard2" element={<Dashboard2 />} />

      {/* Private Routes - matches anything else */}
      <Route path="*" element={<PrivateRoutes baseUrl={baseUrl} />} />
    </Routes>
  );
};

export default AppRoutes;
