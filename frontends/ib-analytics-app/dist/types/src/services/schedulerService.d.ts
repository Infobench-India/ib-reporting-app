export interface ReportSchedule {
    id?: number;
    reportId: number;
    name: string;
    startDateTime: string;
    endDateTime: string;
    scheduleTime: string;
    recipients: string;
    status: 'Active' | 'Inactive';
    reportName?: string;
    nextExecution?: string;
}
export interface ExecutionHistory {
    id: number;
    scheduleId: number;
    executionTime: string;
    status: 'Success' | 'Failure' | 'Running';
    fileName?: string;
    errorMessage?: string;
    scheduleName?: string;
}
declare const schedulerService: {
    getSchedules: () => Promise<any>;
    createSchedule: (data: ReportSchedule) => Promise<any>;
    updateSchedule: (id: number, data: ReportSchedule) => Promise<any>;
    deleteSchedule: (id: number) => Promise<any>;
    getHistory: (params: {
        scheduleId?: number;
        page?: number;
        limit?: number;
    }) => Promise<any>;
    downloadAttachment: (historyId: number, fileName: string) => Promise<void>;
    resendReport: (historyId: number) => Promise<any>;
};
export default schedulerService;
