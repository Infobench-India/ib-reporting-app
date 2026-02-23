import React, { ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NotFound from '../page/not-found';
import Redirect from './redirect';

interface ProtectedRoutesProps {
  isAuthenticated: boolean;
  role: string;
  children: ReactNode;
}

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ isAuthenticated, role, children }) => {
  const location = useLocation();
  let isFound = false;
  let hasPermissions = false;

  React.Children.forEach(children, (route) => {
    if (React.isValidElement(route)) {
      const routePath = route.props.path?.toLowerCase() || '';
      const routeMatcher = new RegExp(routePath.replace(/:[^\s/]+/g, '([\\w-]+)'));
      const url = location.pathname.toLowerCase();
      const match = url.match(routeMatcher);

      if (match && match.input === match[0]) {
        isFound = true;
        if (!route.props.userRoles) hasPermissions = true;
        else if (route.props.userRoles) {
          let roles = (route.props.userRoles || '').replace(/\s/g, '');
          roles = roles.split(',');
          if (roles.indexOf(role) > -1) hasPermissions = true;
        }
      }
    }
  });

  return isAuthenticated && hasPermissions && isFound ? (
    <div>
      <Outlet />
    </div>
  ) : !isFound ? (
    <NotFound />
  ) : (
    <Redirect to="/signin" />
  );
};

export default ProtectedRoutes;
