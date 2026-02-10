import React from "react";
interface SumItem {
    query: string;
    dataRow: number;
    dataColumn: number;
}
interface ChartItem {
    chartType: string;
    chartTitle: string;
    xAxisColumn: string;
    yAxisColumns: string;
    xAxisLabel: string;
    yAxisLabel: string;
}
interface ReportConfig {
    id?: string;
    category: string;
    name: string;
    tableName: string;
    templateName: string;
    columns: string;
    connectionString: string;
    query: string;
    maxRowPerPage: number;
    maxAvailableRowPerPage: number;
    sumStartColumnNumber: number;
    maxSumStartColumnNumber: number;
    reportHeaderBlankRowCount: number;
    reportHeaderStartRowNo: number;
    reportHeaderRowCount: number;
    tableHeaderStartRowNo: number;
    tableHeaderRowCount: number;
    reportDateRow: number;
    reportDateColumn: number;
    fromDateRow: number;
    fromDateColumn: number;
    toDateRow: number;
    toDateColumn: number;
    footerRowCount: number;
    isGraphSupported: boolean;
    isTabularSupported: boolean;
    sum: SumItem[];
    charts: ChartItem[];
}
interface Props {
    initialData: ReportConfig | null;
    onSave: (data: ReportConfig) => void;
    onCancel: () => void;
}
declare const ReportFormComponent: React.FC<Props>;
export default ReportFormComponent;
