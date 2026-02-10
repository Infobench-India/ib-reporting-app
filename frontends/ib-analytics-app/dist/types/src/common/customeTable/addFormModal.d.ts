import React from 'react';
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
declare const AddFormModal: React.FC<AddFormModalProps>;
export default AddFormModal;
