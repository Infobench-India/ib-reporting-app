import React, { useState } from 'react';

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

  // Nested table support
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

const NestedTable: React.FC<TableProps> = ({
  data,
  columns,
  depth = 0,
  onEdit,
  onDelete,
  fontSize = '14px',
  rowKey = 'id',
}) => {
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({
    key: '',
    direction: null,
  });

  const toggleRow = (rowKey: string) => {
    setExpandedRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
  };

  const nestedTableWrapperStyle: React.CSSProperties = {
    overflowX: 'auto',
    maxWidth: '100%',
    margin: '10px 0',
    maxHeight: '400px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
  };

  const requestSort = (key: string) => {
    setSortConfig((prev) => {
      let newDirection: 'asc' | 'desc' = 'asc';
      if (prev.key === key) {
        newDirection = prev.direction === 'asc' ? 'desc' : 'asc';
      }
      return { key, direction: newDirection };
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return null;
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderCell = (row: any, column: TableColumn, rowIndex: number) => {
    const value = row[column.key];

    // If custom render is defined
    if (column.render) {
      return column.render(row);
    }

    // Nested table rendering
    if (column.isNestedTable && column.getNestedData && column.nestedColumns) {
      const nestedData = column.getNestedData(row);
      const nestedRowKey = `${row[rowKey]}-${column.key}-${depth}-${rowIndex}`;
      const isExpanded = expandedRows[nestedRowKey] || false;

      return (
        <>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => toggleRow(nestedRowKey)}
          >
            {isExpanded ? 'Hide' : 'Show'} Details
          </button>
          {isExpanded && (
            <div style={nestedTableWrapperStyle}>
              <NestedTable
                data={nestedData}
                columns={column.nestedColumns}
                depth={depth + 1}
                rowKey={rowKey}
              />
            </div>
          )}
        </>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return value;
  };

  return (
    <table className="table custom-table table-bordered" style={{ fontSize,minWidth: depth > 0 ? '400px' : '100%', width: '100%', }}>
      <thead>
        <tr>
          {columns.map((column) =>
            column.isHide ? null : (
              <th
                className="text-center"
                key={column.key}
                onClick={() => (column.isNotSortable ? undefined : requestSort(column.key))}
                style={{ cursor: column.isNotSortable ? 'default' : 'pointer' }}
              >
                {column.label} {getSortIcon(column.key)}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, rowIndex) => (
          <tr key={row[rowKey]}>
            {columns.map((column) =>
              column.isHide ? null : (         
                <td key={column.key} 
                style={{ 
                    whiteSpace: 'normal', 
                    wordBreak: 'break-word', 
                  }}
                >{renderCell(row, column, rowIndex)}</td>
              )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default NestedTable;