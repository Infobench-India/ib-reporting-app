import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  useTable,
  useSortBy,
  useFilters,
  usePagination,
  useResizeColumns,
  useFlexLayout,
  useRowSelect,
} from "react-table";
import type { DataGridProps } from "../types/customTypes";



const DataGrid: React.FC<DataGridProps> = ({ columns, data, onToggleRowSelection }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useSortBy,
    usePagination,
    useResizeColumns,
    useFlexLayout,
    useRowSelect
  );

  useEffect(() => {
    console.log("getDataInModal", data);
  }, []);

  return (
    <table className="table-striped table-bordered" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup: any) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column: any) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render("Header")}

                <span>
                  {column?.isSorted ? (column?.isSortedDesc ? " 🔽" : " 🔼") : ""}
                </span>
                {column?.canResize && (
                  <div
                    {...column.getResizerProps()}
                    className={`resizer ${
                      column.isResizing ? "isResizing" : ""
                    }`}
                  />
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: any) => {
          prepareRow(row);
          return (
            <tr
              {...row.getRowProps({
                style: {
                  backgroundColor:
                    row.original.status === "Bypass"
                      ? "rgba(255, 99, 71, 0.4)"
                      : "",
                },
              })}
            >
              {row.cells.map((cell: any) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    onClick={() => {
                      if (cell.column.id === "selection") {
                        onToggleRowSelection(row.original);
                      }
                    }}
                  >
                    {cell.column.id === "selection"
                      ? row.original.selection
                        ? "✔️"
                        : "❌"
                      : cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default DataGrid;