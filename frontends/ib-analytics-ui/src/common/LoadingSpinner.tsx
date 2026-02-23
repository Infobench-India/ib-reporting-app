import React from 'react';
import { Spinner } from 'react-bootstrap';


export const LoadingSpinner: React.FC = () => (
<div className="d-flex justify-content-center align-items-center p-3">
<Spinner animation="border" role="status" />
</div>
);


export default LoadingSpinner;