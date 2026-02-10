import React from 'react';
import { Modal, Button } from 'react-bootstrap';


interface Props {
show: boolean;
title?: string;
message: string;
onConfirm: () => void;
onCancel: () => void;
}


const ConfirmationDialog: React.FC<Props> = ({ show, title, message, onConfirm, onCancel }) => {
return (
<Modal show={show} onHide={onCancel} centered>
{title && <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>}
<Modal.Body>{message}</Modal.Body>
<Modal.Footer>
<Button variant="secondary" onClick={onCancel}>Cancel</Button>
<Button variant="danger" onClick={onConfirm}>Confirm</Button>
</Modal.Footer>
</Modal>
);
};


export default ConfirmationDialog;