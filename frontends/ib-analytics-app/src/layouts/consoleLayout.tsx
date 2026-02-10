import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
import TopNavBars from "../components/navBars/topNavBars";
import { navItems } from "../constants/commonConstants";
import { useAppDispatch } from "../store";
import { loadUser } from "../redux/auth/authSlice";

function ConsoleLayout() {
  const auth: any = useAuth();
  const { pathname } = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      if (auth?.isAuth) {
        const result = await auth.isAuth();
        setIsAuthenticated(result);
        if (auth?.isAuth()) { // to do revert to result
          const user = await auth.getSession(); // Get session info
          dispatch(loadUser(user));
        }
      }
    };
    checkAuth();
  }, [auth, dispatch]);
  if (auth && auth?.isAuth()) {
    return (
      <>
        <TopNavBars navItems={navItems}></TopNavBars>
        <div className="container-fluid">
          <div className="row">
            <main
              className={` ${
                isSidebarOpen ? "child-expanded" : "child-normal"
              }`}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </>
    );
  }

  return <Navigate to={`/auth/login`} replace />;
}

export default ConsoleLayout;
