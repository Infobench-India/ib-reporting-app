import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from "reactstrap";

interface ConfirmationModalProps {
  isOpen: boolean;
  toggle: () => void;
  onConfirm: () => void;
  message?: string;
  errors?: string[];
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  toggle,
  onConfirm,
  message = "Do you really want to delete?",
  errors = [],
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Confirmation</ModalHeader>
      <ModalBody>
        {errors.length > 0 ? (
          <div>
            {errors.map((error, index) => (
              <Alert color="danger" key={index}>
                {error}
              </Alert>
            ))}
          </div>
        ) : (
          message
        )}
      </ModalBody>
      <ModalFooter>
        {errors.length === 0 && (
          <Button color="danger" onClick={onConfirm}>
            Yes, Delete
          </Button>
        )}
        <Button color="secondary" onClick={toggle}>
          {errors.length > 0 ? "Close" : "Cancel"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;