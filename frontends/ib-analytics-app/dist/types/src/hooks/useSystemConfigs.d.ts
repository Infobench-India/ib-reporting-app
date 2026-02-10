export declare const useSystemConfigs: () => {
    ioStations: {
        value: string;
        label: string;
    }[];
    ioPinToNumberMap: Record<string, string>;
    pulses: {
        value: string;
        label: string;
    }[];
    stages: {
        value: string;
        label: string;
    }[];
    toolsOptions: {
        value: string;
        label: string;
    }[];
    IRDCToolAxelOptions: {
        value: string;
        label: string;
    }[];
    programOptions: {
        value: string;
        label: string;
    }[];
    convName: {
        value: string;
        label: string;
    }[];
    conveyorStageRanges: Record<string, {
        start: number;
        end: number;
    }>;
    connectionOptions: {
        value: string;
        label: string;
    }[];
    comPorts: {
        value: string;
        label: string;
    }[];
    models: {
        value: string;
        label: string;
    }[];
    type: {
        value: string;
        label: string;
    }[];
    rolePolicy: Record<string, any>;
    partName: {
        value: string;
        label: string;
    }[];
    machines: {
        id: string;
        name: string;
    }[];
    REPORT_PARAMETER_CONFIG: Record<string, any>;
    reportTypes: {
        id: string;
        name: string;
    }[];
    scheduleModeOptions: {
        id: string;
        name: string;
    }[];
};
