import React from 'react';
interface MachineProps {
    name: string;
    status: string;
    output: number;
    efficiency: number;
    downtime: number;
}
declare const MachineStatusCard: React.FC<MachineProps>;
export default MachineStatusCard;
