import React from 'react';
import './Loader.scss';

interface LoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  message = 'Loading...',
  size = 'md',
  overlay = false
}) => {
  return (
    <div className={`loader-container ${overlay ? 'loader-overlay' : 'loader-inline'}`}>
      <div>
        <div className={`loader-spinner loader-${size}`} role="status">
          <span className="visually-hidden">{message}</span>
        </div>
        {message && <p className="loader-text">{message}</p>}
      </div>
    </div>
  );
};

export default Loader;
