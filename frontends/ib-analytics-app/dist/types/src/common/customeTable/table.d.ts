import React from 'react';
export interface TableColumn {
    label: string;
    key: string;
    dataType: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'jsx' | 'nested' | 'string' | 'textarea';
    isEditable: boolean;
    isDisabled?: boolean;
    defaultValue?: any;
    options?: Array<{
        value: any;
        label: string;
    }>;
    render?: (row: any) => React.ReactNode;
    renderInModal?: (value: any, onChange: (value: any) => void) => React.ReactNode;
    isNestedTable?: boolean;
    getNestedData?: (row: any) => any[];
    nestedColumns?: TableColumn[];
}
interface TableProps {
    data: any[];
    requestSort: (key: string) => void;
    handleEdit: (row: any) => void;
    handleDelete: (id: string) => void;
    currentItems: any[];
    columns: TableColumn[];
    sortConfig: {
        key: string;
        direction: 'asc' | 'desc' | null;
    };
}
declare const Table: React.FC<TableProps>;
export default Table;
