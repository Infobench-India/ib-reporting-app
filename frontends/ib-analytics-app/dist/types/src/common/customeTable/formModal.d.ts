import React from 'react';
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
declare const FormModal: React.FC<FormModalProps>;
export default FormModal;
