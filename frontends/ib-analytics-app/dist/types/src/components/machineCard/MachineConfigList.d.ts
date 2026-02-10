import React from 'react';
import './MachineConfigList.scss';
interface Field {
    name: string;
    key: string;
    'db-columName': string;
    'ui-displayOnCardAt': number;
    unit: string;
}
interface Event {
    id: string;
    type: 'alarm' | 'statusChange' | 'metricUpdate';
    description: string;
    tableName: string;
    live: boolean;
    fields: Field[];
}
interface MachineConfig {
    _id?: string;
    id: string;
    name: string;
    type: 'machine' | 'line' | 'plant';
    description: string;
    events: Event[];
    createdAt?: string;
    updatedAt?: string;
}
interface MachineConfigListProps {
    onEdit?: (c: MachineConfig) => void;
}
declare const MachineConfigList: React.FC<MachineConfigListProps>;
export default MachineConfigList;
