export declare const getMockMachineData: () => {
    id: number;
    name: string;
    status: string;
    output: number;
    efficiency: number;
    downtime: number;
}[];
export declare const getMockAnalyticsData: () => {
    labels: string[];
    output: number[];
    efficiency: number[];
};
interface MachineMetrics {
    machine: string;
    plannedProductionTime: number;
    operatingTime: number;
    actualOutput: number;
    theoreticalOutput: number;
    goodUnits: number;
    totalUnitsProduced: number;
}
export declare const mockOeeData: MachineMetrics[];
export declare const calculateOEE: (data: MachineMetrics[]) => {
    machine: string;
    availability: number;
    performance: number;
    quality: number;
    oee: number;
}[];
export {};
