import React from 'react';
import './Loader.scss';
interface LoaderProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    overlay?: boolean;
}
declare const Loader: React.FC<LoaderProps>;
export default Loader;
