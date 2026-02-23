import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/publicAppRoutes";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector, type RootState } from "./store";
import { APP_NAME } from "./constants/commonConstants";
import SystemConfig from "./redux/features/apis/SystemConfigAPI";
import { ThemeProvider } from "./contexts/ThemeProvider";
import * as exportedObjects from "./constants/commonConstants";

const App = ({ baseUrl: propBaseUrl }: { baseUrl?: string }) => {
  const isStandalone = window.location.port === '5003';
  const dispatch = useAppDispatch();
  const readOnlySystemConfig = useAppSelector((state: RootState) => state?.systemConfigsReducer?.data?.docs);

  // When running in container, baseUrl should matched the container route
  const baseUrl = propBaseUrl || (isStandalone ? (import.meta.env.VITE_APP_NAME || "") : "/apps/analytics_web_app");

  useEffect(() => {
    console.log("readOnlySystemConfig started");
    try {
      dispatch(SystemConfig.getAll({}));
    } catch (error) {
      console.error("Error loading system config:", error);
    }
  }, [dispatch]);

  const content = <AppRoutes baseUrl={baseUrl} />;

  if (isStandalone && import.meta.env.VITE_NODE_ENV == 'development') {
    localStorage.setItem("selectedCompany", JSON.stringify({ "label": "cm1", "name": "cm1", "subdomain": "cm1", "userId": "7d1a74b8-25dc-48fc-ab75-343bf3b17952", "userEmail": "system@infobench.in", "roleId": "6829909a809efb6a40347cf1", "role": "Site_Owner", "updatedAt": "2025-05-18T07:47:38.159Z", "createdAt": "2025-05-18T07:47:38.159Z", "id": "6952b01d9f1968398e980f99" }));
  }

  const mainContent = (
    <ThemeProvider>
      {content}
    </ThemeProvider>
  );

  return (
    <Provider store={store}>
      {isStandalone ? (
        <BrowserRouter>
          {mainContent}
        </BrowserRouter>
      ) : mainContent}
    </Provider>
  );
};

export default App;
