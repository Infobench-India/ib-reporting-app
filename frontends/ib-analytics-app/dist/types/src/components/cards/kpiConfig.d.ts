export interface KPIThreshold {
    min: number;
    variant: 'success' | 'warning' | 'danger';
    label: string;
}
export interface KPIConfig {
    thresholds: KPIThreshold[];
    default: {
        variant: 'success' | 'warning' | 'danger';
        label: string;
    };
}
export declare const kpiConfigs: Record<string, KPIConfig>;
export declare const defaultKPIConfig: KPIConfig;
