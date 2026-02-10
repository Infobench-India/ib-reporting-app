interface UseSocketProps {
    onMachineAdded?: (machine: any) => void;
    onMachineEvent?: (machineId: string, event: any) => void;
    listenAllMachines?: boolean;
    machineId?: string;
}
export declare const useSocket: ({ onMachineAdded, onMachineEvent, listenAllMachines, machineId, }: UseSocketProps) => void;
export {};
