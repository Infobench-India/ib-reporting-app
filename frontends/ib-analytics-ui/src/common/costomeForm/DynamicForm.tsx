import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';

export type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[]; // For select fields
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

export const DynamicForm: React.FC<DynamicFormProps> = ({ data, showModal, onClose, useModal }) => {
    const [formValues, setFormValues] = React.useState<Record<string, any>>({});
  
    const handleChange = (id: string, value: any) => {
      setFormValues((prevValues) => ({
        ...prevValues,
        [id]: value,
      }));
    };
  
    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      data.onSubmit(formValues);
      if (useModal) onClose();
    };
  
    const formContent = (
      <Form onSubmit={handleSubmit}>
        {data.fields.map((field) => (
          <Form.Group key={field.id} controlId={field.id}>
            <Form.Label>{field.label}</Form.Label>
            {field.type === 'select' ? (
              <Form.Control
                as="select"
                onChange={(e) => handleChange(field.id, e.target.value)}
              >
                {field.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Control>
            ) : field.type === 'checkbox' ? (
              <Form.Check
                type="checkbox"
                label={field.label}
                onChange={(e) => handleChange(field.id, e.target.checked)}
              />
            ) : (
              <Form.Control
                type={field.type}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(field.id, e.target.value)}
              />
            )}
          </Form.Group>
        ))}
        {!useModal &&
        <Button variant="primary" type="submit">
          Submit
        </Button>}
      </Form>
    );
  
    return useModal ? (
      <Modal show={showModal} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Dynamic Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>{formContent}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    ) : (
      formContent
    );
  };
  
  export default DynamicForm;


