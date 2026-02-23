import React from 'react';
import { Alert } from 'react-bootstrap';


const ErrorMessage: React.FC<{ message?: string }> = ({ message }) => (
<Alert variant="danger">{message || 'Something went wrong'}</Alert>
);


export default ErrorMessage;