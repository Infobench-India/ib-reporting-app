// lib/kpiConfig.ts

export interface KPIThreshold {
  min: number;
  variant: 'success' | 'warning' | 'danger';
  label: string;  // ← Keep as string
}

export interface KPIConfig {
  thresholds: KPIThreshold[];
  default: {
    variant: 'success' | 'warning' | 'danger';
    label: string;  // ← Important: use string, not literal
  };
}

export const kpiConfigs: Record<string, KPIConfig> = {
  OEE: {
    thresholds: [
      { min: 90, variant: 'success', label: 'World Class' },
      { min: 85, variant: 'success', label: 'Excellent' },
      { min: 75, variant: 'warning', label: 'Good' },
      { min: 60, variant: 'warning', label: 'Average' },
    ],
    default: { variant: 'danger', label: 'Needs Improvement' },
  },
  Productivity: {
    thresholds: [
      { min: 95, variant: 'success', label: 'Outstanding' },
      { min: 90, variant: 'success', label: 'Excellent' },
      { min: 80, variant: 'warning', label: 'On Target' },
      { min: 70, variant: 'warning', label: 'Fair' },
    ],
    default: { variant: 'danger', label: 'Below Target' },
  },
  UPH: {
    thresholds: [
      { min: 95, variant: 'success', label: 'Exceeding' },
      { min: 90, variant: 'success', label: 'On Plan' },
      { min: 80, variant: 'warning', label: 'Slightly Low' },
      { min: 70, variant: 'warning', label: 'Low' },
    ],
    default: { variant: 'danger', label: 'Critical' },
  },
    Utilization: {
    thresholds: [
      { min: 95, variant: 'success', label: 'Excellent' },
      { min: 90, variant: 'success', label: 'Well Done' },
      { min: 80, variant: 'warning', label: 'Slightly Low' },
      { min: 70, variant: 'warning', label: 'Need Attention' },
    ],
    default: { variant: 'danger', label: 'Critical' },
  },
};

// Fallback config
export const defaultKPIConfig: KPIConfig = {
  thresholds: [
    { min: 90, variant: 'success', label: 'Excellent' },
    { min: 80, variant: 'success', label: 'Healthy' },
    { min: 70, variant: 'warning', label: 'Good' },
    { min: 60, variant: 'warning', label: 'Fair' },
  ],
  default: { variant: 'danger', label: 'Critical' },
};