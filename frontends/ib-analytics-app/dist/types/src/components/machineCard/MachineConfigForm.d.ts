import React from 'react';
import './MachineConfigForm.scss';
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
}
interface MachineConfigFormProps {
    onSave: (config: MachineConfig) => void;
    initialConfig?: MachineConfig;
    onCancel?: () => void;
}
declare const MachineConfigForm: React.FC<MachineConfigFormProps>;
export default MachineConfigForm;
