import React from 'react';
export type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox';
export interface FormField {
    id: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    options?: string[];
}
export interface FormData {
    fields: FormField[];
    onSubmit: (data: Record<string, any>) => void;
}
export interface DynamicFormProps {
    data: FormData;
    showModal: boolean;
    onClose: () => void;
    useModal?: boolean;
}
export declare const DynamicForm: React.FC<DynamicFormProps>;
export default DynamicForm;
