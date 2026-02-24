import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRBACAuth } from "../hooks/useRBACAuth";
import { useState } from "react";
import TopNavBars from "../components/navBars/topNavBars";
import { getNavItems } from "../constants/commonConstants";

function ConsoleLayout({ baseUrl }: { baseUrl: string }) {
  const { isAuthenticated, user, isLoading } = useRBACAuth();
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = getNavItems(baseUrl);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <>
        <TopNavBars navItems={navItems}></TopNavBars>
        <div className="container-fluid">
          <div className="row">
            <main
              className={` ${isSidebarOpen ? "child-expanded" : "child-normal"
                }`}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </>
    );
  }

  return <Navigate to={`/login`} replace />;
}

export default ConsoleLayout;
