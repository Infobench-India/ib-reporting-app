import type { ReactNode } from 'react';
export type Component = React.FunctionComponent<any> | React.LazyExoticComponent<React.FunctionComponent<any>>;
export type RouteType = {
    path: string;
    key: string;
    Component: Component;
    name?: string;
    subRoutes?: RouteType[];
};
export interface SidebarItem {
    path?: string;
    title: string;
    icon: string;
    children?: SidebarItem[];
}
export interface ICompanyRole {
    id: string;
    role: string;
    companyId: string;
    subdomain: string;
    updatedAt: string;
    createdAt: string;
}
export interface BreakdownData {
    tool: string;
    stage: string;
    bypassdate: string;
    bypasstime: string;
    bypassuser: string;
    activedate: string | null;
    activetime: string | null;
    activeuser: string;
    breakdowntime: string;
    usercomment: string;
}
export interface IFetchCompaniesRolesParams {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: Record<string, string>;
}
export interface IPart {
    scanid: string;
    sku: string;
    stage: string;
    partname: string;
    partcode: string;
    status: string;
    iuser: string;
}
export interface IBreakdown {
    id: string;
    role: string;
    companyId: string;
    subdomain: string;
    updatedAt: string;
    createdAt: string;
}
export interface IBreakdowns {
    docs: IBreakdown[];
    "totalDocs": number;
    "limit": number;
    "totalPages": number;
    "page": number;
    "pagingCounter": number;
    "hasPrevPage": boolean;
    "hasNextPage": boolean;
    "prevPage": number | null;
    "nextPage": number | null;
}
export interface IBreakdownState {
    data: IBreakdowns | null;
    status: 'idle' | 'loading' | 'failed';
}
export interface DataGridProps {
    columns: any[];
    data: any[];
    onToggleRowSelection: (row: any) => void;
}
export interface PartScan {
    id: string;
    iostation: string;
    sku: string;
    stage: string;
    stageLabel: string;
    partname: string;
    partcode: string;
    vendorcode: string;
    selection: string;
    status: string;
    iuser: string;
    CheckQRCode: boolean;
}
export interface PartScansState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export interface IFetchParams {
    page?: number;
    limit?: number;
    companyId?: string;
    sort?: string;
    filter?: string | Record<string, string>;
    q?: string;
    dateFrom?: string;
    dateTo?: string;
}
export interface IDashboardParams {
    machineID: string;
    shift?: number;
    startDateTime?: string;
    endDateTime?: string;
    isLive?: boolean;
}
export interface I_GET_API_RESPONSE {
    docs: any[];
    pagination: {
        "totalItems": number;
        "totalPages": number;
        "currentPage": number;
        "itemsPerPage": number;
    };
}
export interface IRolePolicy {
    [action: string]: string[];
}
export interface IAuthorizationProps {
    action: string;
    policy: IRolePolicy;
    children: ReactNode;
    fallback?: ReactNode;
}
export interface User {
    id: string;
    name: string;
    role: string;
}
export interface ITool {
    id: string;
    iname: string;
    stage: string;
    side: string;
    itype: string;
    iostation: string;
    iinput: string;
    pulse: string;
    port: string;
    ipaddress: string;
    com: string;
    interface: string;
    status: string;
    iuser: string;
}
export interface ToolsState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export interface ConfigGridsState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export interface IConfigGrid {
    id: string;
    sku: string;
    attributes: object;
}
export interface StageConfigState {
    data: I_GET_API_RESPONSE | undefined;
    loading: boolean;
    error: string | null | undefined;
}
export interface ISystemConfig {
    id: string;
    value: any;
    createdAt?: string;
    updatedAt?: string;
}
export interface Schedule {
    id: string;
    name: string;
    reportType: string;
    scheduleMode: string;
    shiftTrigger: string;
    timezone: string;
}
export interface ScheduleState {
    data: Schedule[];
    loading: boolean;
    error: string | null;
}
export type ParameterValue = string | number | boolean | string[] | null;
export interface ScheduleParameters {
    [key: string]: ParameterValue;
}
export type ParameterType = "text" | "number" | "boolean" | "date" | "datetime" | "select" | "multi-select";
export interface ParameterConfig {
    key: string;
    label: string;
    type: ParameterType;
    required?: boolean;
    options?: {
        label: string;
        value: string;
    }[];
}
