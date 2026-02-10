import React from 'react';
import { MachineSummary } from '../../types';
interface Props {
    machine: MachineSummary;
    onClick: (m: MachineSummary) => void;
}
declare const MachineCard: React.FC<Props>;
export default MachineCard;
