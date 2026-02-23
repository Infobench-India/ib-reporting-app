import React, { useState } from 'react';
import { TableColumn } from './table';

interface FormModalProps {
  editRow: any;
  setEditRow: React.Dispatch<React.SetStateAction<any>>;
  handleSave: (row: any) => void;
  columns: TableColumn[];
  modelHeader?: string;
  modalWidth?: string;
  modalHeight?: string;
  modalMarginTop?: string;
  isDisabled?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({ 
  editRow, 
  setEditRow, 
  handleSave, 
  columns, 
  modelHeader,
  modalWidth,
  modalHeight,
  modalMarginTop,
  isDisabled 
}) => {
  // Helper function to filter out non-editable fields
  const filterNonEditableFields = (values: any, cols: TableColumn[]): any => {
    const filteredValues: any = {};
    
    cols.forEach(column => {
      if (column.isEditable && values[column.key] !== undefined) {
        if (column.dataType === 'nested' && column.isNestedTable && column.nestedColumns) {
          // Handle nested fields
          if (values[column.key]) {
            filteredValues[column.key] = values[column.key].map((nestedItem: any) => {
              return filterNonEditableFields(nestedItem, column.nestedColumns!);
            }).filter((item: any) => 
              Object.keys(item).length > 0 // Remove empty nested objects
            );
          }
        } else {
          // Handle regular fields
          filteredValues[column.key] = values[column.key];
        }
      }
    });
    
    return filteredValues;
  };

  // Initialize with deep copy and filter out non-editable fields
  const [formValues, setFormValues] = useState<{ [key: string]: any }>(() => {
    if (!editRow) return {};
    
    // Deep copy the editRow
    const initialValues = JSON.parse(JSON.stringify(editRow));
    
    // Only include editable fields in the initial form state
    return filterNonEditableFields(initialValues, columns);
  });

  const handleChange = (key: string, value: any, parentKey?: string, nestedIndex?: number) => {
    if (parentKey && nestedIndex !== undefined) {
      // Handle nested field changes - create deep copies
      setFormValues((prev: any) => {
        const newFormValues = { ...prev };
        
        // Ensure parent array exists and is copied
        newFormValues[parentKey] = [...(newFormValues[parentKey] || [])];
        
        // Ensure the specific nested object exists and is copied
        newFormValues[parentKey][nestedIndex] = {
          ...(newFormValues[parentKey][nestedIndex] || {}),
          [key]: value
        };
        
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
      
      // Create a new array for the nested data
      newFormValues[parentKey] = [...(newFormValues[parentKey] || [])];
      
      // Initialize a new nested row with default values from editable columns only
      const newNestedRow = nestedColumns.reduce((acc: any, col: TableColumn) => {
        if (col.isEditable) {
          switch (col.dataType) {
            case 'boolean':
              acc[col.key] = false;
              break;
            case 'number':
              acc[col.key] = col.defaultValue || 0;
              break;
            case 'date':
              // For date fields, set to current date/time or empty
              acc[col.key] = col.defaultValue || '';
              break;
            default:
              acc[col.key] = col.defaultValue || '';
          }
        }
        return acc;
      }, {});
      
      newFormValues[parentKey].push(newNestedRow);
      return newFormValues;
    });
  };

  // Helper function to parse your UI date format
  const parseUIDateFormat = (dateString: string): Date | null => {
    if (!dateString) return null;
    try {
      const match = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (\w+)/i);
      if (match) {
        const [, day, month, year, hours, minutes, seconds, meridiem] = match; 
        let hour = parseInt(hours, 10);
        if (meridiem.toLowerCase() === 'pm' && hour < 12) {
          hour += 12;
        } else if (meridiem.toLowerCase() === 'am' && hour === 12) {
          hour = 0;
        }
      
        // Create date in local timezone
        return new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          hour,
          parseInt(minutes, 10),
          parseInt(seconds, 10)
        );
      }
      const parsedDate = new Date(dateString);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  // Helper function to format for datetime-local input
  const formatDateTimeLocal = (dateString: string): string => {
    const date = parseUIDateFormat(dateString);
    if (!date || isNaN(date.getTime())) {
      try {
        const directDate = new Date(dateString);
        if (!isNaN(directDate.getTime())) {
          // Convert to local time for datetime-local input
          const year = directDate.getFullYear();
          const month = String(directDate.getMonth() + 1).padStart(2, '0');
          const day = String(directDate.getDate()).padStart(2, '0');
          const hours = String(directDate.getHours()).padStart(2, '0');
          const minutes = String(directDate.getMinutes()).padStart(2, '0');
        
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        }
      } catch (e) {
        console.warn('Failed to parse date:', dateString);
      }
      return '';
    }
  
    // Format for datetime-local (YYYY-MM-DDThh:mm)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleRemoveNestedRow = (parentKey: string, index: number) => {
    setFormValues((prev: any) => {
      const newFormValues = { ...prev };
      
      if (newFormValues[parentKey] && newFormValues[parentKey].length > 1) {
        // Create a new array without the removed item
        newFormValues[parentKey] = newFormValues[parentKey].filter((_: any, i: number) => i !== index);
      } else if (newFormValues[parentKey]) {
        // If only one item, clear it but keep the array structure
        newFormValues[parentKey] = [];
      }
      
      return newFormValues;
    });
  };

  const renderInputField = (column: TableColumn, parentKey?: string, nestedIndex?: number) => {
    // Don't render non-editable fields in the form
    if (!column.isEditable) return null;
    
    const value = parentKey && nestedIndex !== undefined 
      ? formValues[parentKey]?.[nestedIndex]?.[column.key]
      : formValues[column.key];
    
    const label = column.label ?? column.key;
    
    if (column.renderInModal) {
      return column.renderInModal(
        value,
        (newValue: any) => handleChange(column.key, newValue, parentKey, nestedIndex)
      );
    }

    switch (column.dataType) {
      case 'text':
        return (
          <input
            disabled={column.isDisabled || isDisabled}
            type="text"
            className="form-control"
            value={value || ''}
            onChange={(e) => handleChange(column.key, e.target.value, parentKey, nestedIndex)}
          />
        );
      case 'number':
        return (
          <input
            disabled={column.isDisabled || isDisabled}
            type="number"
            className="form-control"
            value={value || ''}
            onChange={(e) => handleChange(column.key, e.target.valueAsNumber, parentKey, nestedIndex)}
          />
        );
      case 'boolean':
        return (
          <div className="form-check">
            <input
              disabled={column.isDisabled || isDisabled}
              type="checkbox"
              className="form-check-input scale-200"
              checked={Boolean(value)}
              onChange={(e) => handleChange(column.key, e.target.checked, parentKey, nestedIndex)}
              id={`checkbox-${column.key}-${parentKey || ''}-${nestedIndex || ''}`}
            />
            <label className="form-check-label" htmlFor={`checkbox-${column.key}-${parentKey || ''}-${nestedIndex || ''}`}>
              {label}
            </label>
          </div>
        );
      case 'textarea':
        return (
          <textarea
            disabled={column.isDisabled || isDisabled}
            className="form-control"
            rows={3}
            value={value || ''}
            onChange={(e) => handleChange(column.key, e.target.value, parentKey, nestedIndex)}
          />
        );
      case 'select':
        return (
          <select
            disabled={column.isDisabled || isDisabled}
            className="form-select"
            value={value || ''}
            onChange={(e) => handleChange(column.key, e.target.value, parentKey, nestedIndex)}
          >
            <option value="">Select...</option>
            {column.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'date':
      return (
        <div>
          <input
            disabled={column.isDisabled || isDisabled}
            type="datetime-local"
            className="form-control"
            value={formatDateTimeLocal(value)}
            onChange={(e) => handleChange(column.key, e.target.value, parentKey, nestedIndex)}
          />
        </div>
      );
      case 'nested':
        if (column.isNestedTable && column.nestedColumns) {
          const nestedData = formValues[column.key] || [];
          return (
            <div className="nested-section mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label fw-bold">{label}</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleAddNestedRow(column.key, column.nestedColumns!)}
                  disabled={isDisabled}
                >
                  + Add {label}
                </button>
              </div>
              
              {nestedData.map((nestedRow: any, index: number) => (
                <div key={index} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="card-subtitle mb-2 text-muted">
                        {label} #{index + 1}
                      </h6>
                      {nestedData.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveNestedRow(column.key, index)}
                          disabled={isDisabled}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="row g-2">
                      {column.nestedColumns!.map((nestedCol) => {
                        // Only render editable nested columns
                        if (!nestedCol.isEditable) return null;
                        
                        return (
                          <div key={`${column.key}-${nestedCol.key}-${index}`} className="col-md-10">
                            <label className="form-label small mb-1">
                              {nestedCol.label}
                            </label>
                            {renderInputField(nestedCol, column.key, index)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {nestedData.length === 0 && (
                <div className="alert alert-info">
                  No {label.toLowerCase()} added yet. Click "Add {label}" to create one.
                </div>
              )}
            </div>
          );
        }
        return null;
      default:
        return (
          <input
            disabled={column.isDisabled || isDisabled}
            type="text"
            className="form-control"
            value={value || ''}
            onChange={(e) => handleChange(column.key, e.target.value, parentKey, nestedIndex)}
          />
        );
    }
  };

  const handleSaveClick = () => {
    // Filter out non-editable fields before saving
    const filteredValues = filterNonEditableFields(formValues, columns);
    handleSave(filteredValues);
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
    }} tabIndex={-1}>
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
            <h5 className="modal-title">{modelHeader ?? "Edit Row"}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setEditRow(null)}
              disabled={isDisabled}
            ></button>
          </div>
          <div className="modal-body" style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 130px)' }}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="row g-3">
                {columns.map((column) => {
                  // Skip non-editable columns
                  if (!column.isEditable) return null;
                  
                  return column.dataType === 'nested' && column.isNestedTable ? (
                    <div key={column.key} className="col-12">
                      {renderInputField(column)}
                    </div>
                  ) : column.dataType === 'boolean' ? (
                    <div key={column.key} className="col-12">
                      {renderInputField(column)}
                    </div>
                  ) : (
                    <div key={column.key} className="col-md-12">
                      <label className="form-label">{column.label}</label>
                      {renderInputField(column)}
                    </div>
                  );
                })}
              </div>
            </form>
          </div>
          <div className="modal-footer sticky-bottom bg-white" style={{ zIndex: 1 }}>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSaveClick}
              disabled={isDisabled}
            >
              Save changes
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setEditRow(null)}
              disabled={isDisabled}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormModal;