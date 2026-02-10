export type MachineStatus = 'online' | 'warning' | 'error' | 'offline' | 'unconfigured';
export interface MachineEventPayload {
    [key: string]: any;
}
export interface MachineConfig {
    id: string;
    machineId: string;
    machineName: string;
    siteId?: string;
    mqttTopic?: string;
    primaryField?: string;
    thresholds?: {
        warning?: number;
        danger?: number;
    };
    eventTypes?: string[];
}
export interface MachineSummary {
    id: string;
    machineId: string;
    name: string;
    status: MachineStatus;
    value?: string | number;
    lastUpdated?: string;
    config?: MachineConfig | null;
}
