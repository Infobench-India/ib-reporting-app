export interface OeeBreakdown {
    availability: number;
    performance: number;
    quality: number;
}
export interface ProductivityDataPoint {
    time: string;
    planned: number;
    actual: number;
}
export interface DowntimeCause {
    name: string;
    minutes: number;
    color: string;
}
export interface Downtime {
    totalMinutes: number;
    causes: DowntimeCause[];
}
