import React from 'react';
import { MachineSummary } from '../../types';
interface Props {
    machine: MachineSummary;
    show: boolean;
    onHide: () => void;
}
declare const MachineDetailsModal: React.FC<Props>;
export default MachineDetailsModal;
