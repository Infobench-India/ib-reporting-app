import SQL_API from '../util/sqlAxiosWrapper';

const API_BASE = '/sql-report-scheduler';

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

const schedulerService = {
    getSchedules: async () => {
        const res = await SQL_API.get(`${API_BASE}`);
        return res.data;
    },
    createSchedule: async (data: ReportSchedule) => {
        const res = await SQL_API.post(`${API_BASE}`, data);
        return res.data;
    },
    updateSchedule: async (id: number, data: ReportSchedule) => {
        const res = await SQL_API.put(`${API_BASE}/${id}`, data);
        return res.data;
    },
    deleteSchedule: async (id: number) => {
        const res = await SQL_API.delete(`${API_BASE}/${id}`);
        return res.data;
    },
    getHistory: async (params: { scheduleId?: number; page?: number; limit?: number }) => {
        const res = await SQL_API.get(`${API_BASE}/history/list`, { params });
        return res.data;
    },
    downloadAttachment: async (historyId: number, fileName: string) => {
        const res = await SQL_API.get(`${API_BASE}/history/${historyId}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    resendReport: async (historyId: number) => {
        const res = await SQL_API.post(`${API_BASE}/history/${historyId}/resend`);
        return res.data;
    },
    getExecutionHistoryFile: async (historyId: number) => {
        const res = await SQL_API.get(`${API_BASE}/history/${historyId}/download`, { responseType: 'blob' });
        return res.data;
    }
};

export default schedulerService;
