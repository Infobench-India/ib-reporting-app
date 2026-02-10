import React from 'react';

export interface TableColumn {
  label: string;
  key: string;
  dataType: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'jsx' | 'nested' | 'string' | 'textarea';
  isEditable: boolean;
  isDisabled?: boolean;
  defaultValue?: any;
  options?: Array<{ value: any; label: string }>;
  render?: (row: any) => React.ReactNode;
  renderInModal?: (value: any, onChange: (value: any) => void) => React.ReactNode;
  
  // Nested table properties
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

const Table: React.FC<TableProps> = ({ data, requestSort, handleEdit, handleDelete, currentItems, columns,sortConfig }) => {
    const getSortIcon = (columnKey: string) => {
        if (sortConfig.key === columnKey) {
          return sortConfig.direction === 'asc' ? '▲' : '▼';
        }
        return null;
      };
    return (
    <table className="table table-striped table-bordered">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} onClick={() => requestSort(column.key)}>
              {column.label} {getSortIcon(column.key)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {currentItems.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.key !== 'actions' ? row[column.key] : column.render?.(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;