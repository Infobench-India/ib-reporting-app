import React from "react";
interface ConfirmationModalProps {
    isOpen: boolean;
    toggle: () => void;
    onConfirm: () => void;
    message?: string;
    errors?: string[];
}
declare const ConfirmationModal: React.FC<ConfirmationModalProps>;
export default ConfirmationModal;
