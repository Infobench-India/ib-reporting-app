import { useContext, useCallback } from "react";
import { AuthContext } from "./AuthProvider";
import { useAppSelector } from "../store";

function useAuth() {
  const context = useContext(AuthContext);
  const authState = useAppSelector((state: any) => state.auth); // Reading from host's auth slice
  const isStandalone = window.location.port === '5003';

  const getSession = useCallback(async () => {
    if (!isStandalone && authState?.user) {
      // Return user in the format analytics app expects
      const user = authState.user;
      return {
        id: user.id,
        username: user.email?.split('@')[0] || '',
        email: user.email,
        firstname: user.firstName,
        lastname: user.lastName,
        role: user.role,
      };
    }
    return context?.getSession();
  }, [isStandalone, authState, context]);

  const isAuth = useCallback(async () => {
    if (!isStandalone) {
      return !!authState?.isAuthenticated;
    }
    return context?.isAuth();
  }, [isStandalone, authState, context]);

  if (!isStandalone) {
    return {
      ...context,
      getSession,
      isAuth,
      user: authState?.user,
      isAuthenticated: !!authState?.isAuthenticated,
    };
  }

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;
