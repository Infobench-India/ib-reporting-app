import React, { useState } from 'react';
import { TableColumn } from './table';

interface AddFormModalProps {
  setIsColseModal: React.Dispatch<React.SetStateAction<any>>;
  handleAdd: (row: any) => void;
  columns: TableColumn[];
  modelHeader: string;
  modalWidth?: string;
  modalHeight?: string;
  modalMarginTop?: string;
}

const AddFormModal: React.FC<AddFormModalProps> = ({ setIsColseModal, handleAdd, columns, modelHeader, modalWidth, modalHeight, modalMarginTop }) => {
  // Recursive function to initialize form values for nested data
  const initializeFormValues = (cols: TableColumn[]): any => {
    return cols.reduce((acc, column) => {
      if (column.isNestedTable && column.nestedColumns && column.getNestedData) {
        // Initialize nested array with one empty object
        acc[column.key] = [initializeFormValues(column.nestedColumns)];
      } else if (column.isEditable) {
        // Set default values for regular fields
        switch (column.dataType) {
          case 'boolean':
            acc[column.key] = false;
            break;
          case 'number':
            acc[column.key] = column.defaultValue || 0;
            break;
          case 'date':
            acc[column.key] = column.defaultValue || '';
            break;
          case 'select':
            acc[column.key] = column.defaultValue || (column.options?.[0]?.value || '');
            break;
          default:
            acc[column.key] = column.defaultValue || '';
        }
      }
      return acc;
    }, {} as { [key: string]: any });
  };

  const [formValues, setFormValues] = useState(() => initializeFormValues(columns));

  const handleChange = (key: string, value: any, parentKey?: string, nestedIndex?: number) => {
    if (parentKey && nestedIndex !== undefined) {
      // Handle nested field changes
      setFormValues((prev: any) => {
        const newFormValues = { ...prev };
        if (newFormValues[parentKey] && newFormValues[parentKey][nestedIndex]) {
          newFormValues[parentKey][nestedIndex][key] = value;
        }
        return newFormValues;
      });
    } else {
      // Handle top-level field changes
      setFormValues((prev: any) => ({ ...prev, [key]: value }));
    }
  };

  const handleAddNestedRow = (parentKey: string, nestedColumns: TableColumn[]) => {
    setFormValues((prev: any) => {
      const newFormValues = { ...prev };
      if (!newFormValues[parentKey]) {
        newFormValues[parentKey] = [];
      }
      newFormValues[parentKey].push(initializeFormValues(nestedColumns));
      return newFormValues;
    });
  };

  const handleRemoveNestedRow = (parentKey: string, index: number) => {
    setFormValues((prev: any) => {
      const newFormValues = { ...prev };
      if (newFormValues[parentKey] && newFormValues[parentKey].length > 1) {
        newFormValues[parentKey] = newFormValues[parentKey].filter((_: any, i: number) => i !== index);
      }
      return newFormValues;
    });
  };

  const renderInputField = (column: TableColumn, parentKey?: string, nestedIndex?: number) => {
    if (column.renderInModal) {
      return column.renderInModal(
        parentKey && nestedIndex !== undefined 
          ? formValues[parentKey]?.[nestedIndex]?.[column.key]
          : formValues[column.key],
        (value: any) => handleChange(column.key, value, parentKey, nestedIndex)
      );
    }

    const value = parentKey && nestedIndex !== undefined 
      ? formValues[parentKey]?.[nestedIndex]?.[column.key]
      : formValues[column.key];

    switch (column.dataType) {
      case 'text':
        return (
          <input
            type="text"
            className="form-control"
            value={value || ''}
            onChange={(e) => handleChange(column.key, e.target.value, parentKey, nestedIndex)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="form-control"
            value={value || 0}
            onChange={(e) => handleChange(column.key, e.target.valueAsNumber, parentKey, nestedIndex)}
          />
        );
      case 'select':
        return (
          <select
            className="form-control"
            value={value || ''}
            onChange={(e) => handleChange(column.key, e.target.value, parentKey, nestedIndex)}
          >
            <option value="">Select...</option>
            {column.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={value || false}
              onChange={(e) => handleChange(column.key, e.target.checked, parentKey, nestedIndex)}
              id={`checkbox-${column.key}-${parentKey || ''}-${nestedIndex || ''}`}
            />
          </div>
        );
      case 'date':
        return (
          <input
            type="datetime-local"
            className="form-control"
            value={value || ''}
            onChange={(e) => handleChange(column.key, e.target.value, parentKey, nestedIndex)}
          />
        );
      case 'nested':
        if (column.isNestedTable && column.nestedColumns) {
          const nestedData = formValues[column.key] || [];
          return (
            <div className="nested-section">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold">{column.label}</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleAddNestedRow(column.key, column.nestedColumns!)}
                >
                  + Add {column.label}
                </button>
              </div>
              
              {nestedData.map((nestedRow: any, index: number) => (
                <div key={index} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="card-subtitle mb-2 text-muted">
                        {column.label} #{index + 1}
                      </h6>
                      {nestedData.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveNestedRow(column.key, index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="row g-2">
                      {column.nestedColumns!.map((nestedCol) => (
                        nestedCol.isEditable && (
                          <div key={`${column.key}-${nestedCol.key}-${index}`} className="col-md-10">
                            <label className="form-label small mb-1">
                              {nestedCol.label}
                            </label>
                            {renderInputField(nestedCol, column.key, index)}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="modal fade show" style={{ 
      display: 'block',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1050 
    }}>
      <div className="modal-dialog modal-lg"
        style={{ 
          maxWidth: modalWidth || '800px', 
          maxHeight: modalHeight || '90vh', 
          marginTop: modalMarginTop || '50px'
        }}>
        <div className="modal-content" 
          style={{
            border: '4px solid #007bff',
            borderRadius: '12px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            padding: '10px',
            backgroundColor: '#fff',
            maxHeight: '85vh',
            overflow: 'hidden',
          }}
        >
          <div className="modal-header sticky-top bg-white" style={{ zIndex: 1 }}>
            <h5 className="modal-title">{modelHeader}</h5>
            <button type="button" className="btn-close" onClick={() => setIsColseModal(null)}></button>
          </div>
          <div className="modal-body" style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 130px)' }}>
            <form>
              <div className="row g-3">
                {columns.map((column) =>
                  column.isEditable ? (
                    column.dataType === 'nested' && column.isNestedTable ? (
                      <div key={column.key} className="col-12">
                        {renderInputField(column)}
                      </div>
                    ) : (
                      <div key={column.key} className="col-md-12">
                        <label className="form-label">{column.label}</label>
                        {renderInputField(column)}
                      </div>
                    )
                  ) : null
                )}
              </div>
            </form>
          </div>
          <div className="modal-footer sticky-bottom bg-white" style={{ zIndex: 1 }}>
            <button type="button" className="btn btn-primary" onClick={() => handleAdd(formValues)}>
              Add
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsColseModal(null)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFormModal;