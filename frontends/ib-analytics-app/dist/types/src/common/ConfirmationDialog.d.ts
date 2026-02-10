import React from 'react';
interface Props {
    show: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}
declare const ConfirmationDialog: React.FC<Props>;
export default ConfirmationDialog;
