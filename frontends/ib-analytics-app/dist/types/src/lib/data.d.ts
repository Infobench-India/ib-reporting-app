export interface OeeBreakdown {
    availability: number;
    performance: number;
    quality: number;
}
export interface ProductivityDataPoint {
    time: string;
    planned: number;
    hourlyPlannedQty: number;
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
export declare const dashboardData: {
    readonly oee: 99;
    readonly lastOee: 50.5;
    readonly productivity: 85;
    readonly lastProductivity: 75;
    readonly lastUph: 210;
    readonly utilization: 50;
    readonly lastUtilization: 71;
    readonly uph: 250;
    readonly targetUph: 300;
    readonly totalShiftTime: 420;
    readonly machines: readonly ["MC-01", "MC-02", "MC-03", "MC-04"];
    readonly oeeBreakdown: {
        availability: number;
        performance: number;
        quality: number;
    };
    readonly productivityData: {
        time: string;
        planned: number;
        hourlyPlannedQty: number;
        actual: number;
    }[];
    readonly downtime: {
        totalMinutes: number;
        causes: {
            name: string;
            minutes: number;
            color: string;
        }[];
    };
};
