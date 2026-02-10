// ToastNotifications.tsx
import React, { useEffect } from 'react';
import { selectErrorMessage, selectErrorType, clearError } from '../redux/errorSlice';
import { useAppDispatch, useAppSelector } from '../store';
import './ToastNotifications.scss';

const ToastNotifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const errorMessage = useAppSelector(selectErrorMessage);
  const errorType = useAppSelector(selectErrorType);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, dispatch]);

  const handleClose = () => {
    dispatch(clearError());
  };

  const getIcon = () => {
    switch (errorType) {
      case 'success':
        return (
          <svg className="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg className="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return (
          <svg className="toast-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  if (!errorMessage) return null;

  return (
    <div className="toast-notifications-container">
      <div className={`toast-notification toast-${errorType || 'info'}`}>
        {getIcon()}
        <div className="toast-content">
          <p className="toast-message">{errorMessage}</p>
        </div>
        <button className="toast-close" onClick={handleClose} aria-label="Close notification">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="toast-progress" />
      </div>
    </div>
  );
};

export default ToastNotifications;
