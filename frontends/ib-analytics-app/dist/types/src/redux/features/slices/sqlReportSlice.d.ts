interface SQLReportState {
    configs: {
        category: string;
        name: string;
        charts?: {
            chartType: string;
            chartTitle: string;
            xAxisColumn: string;
            yAxisColumns: string;
            xAxisLabel: string;
            yAxisLabel: string;
        }[];
    }[];
    reportData: any[];
    charts: {
        chartType: string;
        chartTitle: string;
        xAxisColumn: string;
        yAxisColumns: string;
        xAxisLabel: string;
        yAxisLabel: string;
    }[] | null;
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    } | null;
    loading: boolean;
    error: string | null;
}
export declare const clearReportData: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"sqlReport/clearReportData">;
declare const _default: import("redux").Reducer<SQLReportState>;
export default _default;
