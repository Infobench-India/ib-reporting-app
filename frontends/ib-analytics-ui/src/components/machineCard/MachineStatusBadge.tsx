import React from 'react';
import { Badge } from 'react-bootstrap';
import { MachineStatus } from '../../types';


const MachineStatusBadge: React.FC<{ status: MachineStatus }> = ({ status }) => {
    const variant = status === 'online' ? 'success' : status === 'warning' ? 'warning' : status === 'error' ? 'danger' : status === 'offline' ? 'secondary' : 'dark';
    return <Badge bg={variant}>{status?.toUpperCase()}</Badge>;
};


export default MachineStatusBadge;