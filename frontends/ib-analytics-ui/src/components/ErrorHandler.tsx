import React, { useState } from 'react';
import './ErrorHandler.scss';

interface Props {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorHandler({ error, resetErrorBoundary }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  const handleClickReset = () => {
    try {
      resetErrorBoundary();
    } catch (err) {
      console.error('Error resetting error boundary:', err);
    }
  };

  return (
    <div className="error-handler-container" data-testid="ErrorHandler">
      <div className="error-handler-card">
        <svg
          className="error-handler-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>

        <h2 className="error-handler-title">Oops! Something went wrong</h2>

        <p className="error-handler-message">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        <div className="error-handler-details">
          <div
            className="error-handler-details-title"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span>Error Details</span>
            <span>{showDetails ? '▼' : '▶'}</span>
          </div>
          {showDetails && (
            <div className="error-handler-details-content">
              {error.message}
              {error.stack && (
                <>
                  {'\n\n'}
                  {error.stack}
                </>
              )}
            </div>
          )}
        </div>

        <div className="error-handler-actions">
          <button className="btn btn-primary" onClick={handleClickReset}>
            Try Again
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
