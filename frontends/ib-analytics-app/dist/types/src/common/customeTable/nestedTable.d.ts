import React from 'react';
export interface TableColumn {
    label: string;
    key: string;
    dataType: string;
    options?: any;
    isEditable: boolean;
    isDisabled?: boolean;
    defaultValue?: any;
    isHide?: boolean;
    isNotSortable?: boolean;
    render?: (row: any) => React.ReactNode;
    renderInModal?: (value: any, onChange: (newValue: any) => void) => React.ReactNode;
    isNestedTable?: boolean;
    getNestedData?: (row: any) => any[];
    nestedColumns?: TableColumn[];
}
interface TableProps {
    data: any[];
    columns: TableColumn[];
    depth?: number;
    rowKey?: string;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    fontSize?: string;
}
declare const NestedTable: React.FC<TableProps>;
export default NestedTable;
