// components/Authorization.tsx
import React, { ReactNode, FC } from 'react';
import type { IAuthorizationProps } from '../types/customTypes';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { setError } from '../redux/errorSlice';
const Authorization: FC<IAuthorizationProps> = ({ action, policy, children, fallback = null }) => {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state: RootState) => state.authReducer.user?.role);
  const allowedRoles = policy[action] || [];
   if (!role) {
    return <>{fallback}</>;
  }
  if (!allowedRoles.includes(role)) {
    // dispatch(setError('Permission denied'));
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

export default Authorization;
