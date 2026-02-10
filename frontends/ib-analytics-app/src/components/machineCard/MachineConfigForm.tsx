import React, { useState } from 'react';
import { Form, Button, Card, Table, Modal, Alert } from 'react-bootstrap';
import './MachineConfigForm.scss';

interface Field {
  name: string;
  key: string;
  'db-columName': string;
  'ui-displayOnCardAt': number;
  unit: string;
}

interface Event {
  id: string;
  type: 'alarm' | 'statusChange' | 'metricUpdate';
  description: string;
  tableName: string;
  live: boolean;
  fields: Field[];
}

interface MachineConfig {
  _id?: string;
  id: string;
  name: string;
  type: 'machine' | 'line' | 'plant';
  description: string;
  events: Event[];
}

interface MachineConfigFormProps {
  onSave: (config: MachineConfig) => void;
  initialConfig?: MachineConfig;
  onCancel?: () => void;
}

const MachineConfigForm: React.FC<MachineConfigFormProps> = ({ onSave, initialConfig, onCancel }) => {
  const [config, setConfig] = useState<MachineConfig>(
    initialConfig || {
      _id: '',
      id: '',
      name: '',
      type: 'machine',
      description: '',
      events: [],
    }
  );

  const [showEventModal, setShowEventModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null);
  const [currentField, setCurrentField] = useState<Partial<Field> | null>(null);
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [fieldModalEventIndex, setFieldModalEventIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Handle basic config changes
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Event Modal Handlers
  const openEventModal = (index?: number) => {
    if (index !== undefined) {
      setCurrentEvent({ ...config.events[index] });
      setEditingEventIndex(index);
    } else {
      setCurrentEvent({
        id: `event${config.events.length + 1}`,
        type: 'alarm',
        description: '',
        tableName: '',
        live: true,
        fields: [],
      });
      setEditingEventIndex(null);
    }
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setCurrentEvent(null);
    setEditingEventIndex(null);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setCurrentEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const saveEvent = () => {
    if (!currentEvent?.id || !currentEvent?.tableName) {
      setError('Event ID and Table Name are required');
      return;
    }

    if (editingEventIndex !== null) {
      const updatedEvents = [...config.events];
      updatedEvents[editingEventIndex] = currentEvent as Event;
      setConfig(prev => ({ ...prev, events: updatedEvents }));
    } else {
      setConfig(prev => ({
        ...prev,
        events: [...prev.events, currentEvent as Event],
      }));
    }
    setError('');
    closeEventModal();
  };

  const deleteEvent = (index: number) => {
    setConfig(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
  };

  // Field Modal Handlers
  const openFieldModal = (eventIndex?: number, fieldIndex?: number) => {
    // If eventIndex is provided and valid, operate on the saved event in `config`.
    // Otherwise operate on the `currentEvent` (unsaved event being edited in the Event modal).
    let eventForModal: Partial<Event> | null = null;
    if (eventIndex !== undefined && eventIndex >= 0 && config.events[eventIndex]) {
      eventForModal = { ...config.events[eventIndex] };
      setFieldModalEventIndex(eventIndex);
    } else {
      eventForModal = currentEvent ?? null;
      setFieldModalEventIndex(null);
    }

    if (fieldIndex !== undefined && eventForModal && eventForModal.fields) {
      setCurrentField({ ...eventForModal.fields[fieldIndex] });
      setEditingFieldIndex(fieldIndex);
    } else {
      setCurrentField({
        name: '',
        key: '',
        'db-columName': '',
        'ui-displayOnCardAt': 1,
        unit: '',
      });
      setEditingFieldIndex(null);
    }

    setCurrentEvent(eventForModal);
    setShowFieldModal(true);
  };

  const closeFieldModal = () => {
    setShowFieldModal(false);
    setCurrentField(null);
    setEditingFieldIndex(null);
    setFieldModalEventIndex(null);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentField(prev => ({
      ...prev,
      [name]: name === 'ui-displayOnCardAt' ? parseInt(value) : value,
    }));
  };

  const saveField = () => {
    if (!currentField?.name || !currentField?.key || !currentField?.['db-columName']) {
      setError('Name, Key, and DB Column Name are required');
      return;
    }

    // If fieldModalEventIndex points to a saved event in config, update it there.
    if (fieldModalEventIndex !== null && fieldModalEventIndex >= 0) {
      const updatedEvents = [...config.events];
      const targetFields = updatedEvents[fieldModalEventIndex].fields
        ? [...updatedEvents[fieldModalEventIndex].fields]
        : [];
      if (editingFieldIndex !== null && editingFieldIndex >= 0) {
        targetFields[editingFieldIndex] = currentField as Field;
      } else {
        targetFields.push(currentField as Field);
      }
      updatedEvents[fieldModalEventIndex] = {
        ...updatedEvents[fieldModalEventIndex],
        fields: targetFields,
      };
      setConfig(prev => ({ ...prev, events: updatedEvents }));

      // Otherwise we're modifying an unsaved event currently stored in `currentEvent`.
    } else if (currentEvent) {
      const updatedEvent: Partial<Event> = { ...currentEvent };
      const targetFields = updatedEvent.fields ? [...updatedEvent.fields] : [];
      if (editingFieldIndex !== null && editingFieldIndex >= 0) {
        targetFields[editingFieldIndex] = currentField as Field;
      } else {
        targetFields.push(currentField as Field);
      }
      updatedEvent.fields = targetFields;
      setCurrentEvent(updatedEvent);
    }

    setError('');
    closeFieldModal();
  };

  const deleteField = (eventIndex?: number, fieldIndex?: number) => {
    if (fieldIndex === undefined) return;

    // Delete from saved event in config
    if (eventIndex !== undefined && eventIndex >= 0) {
      setConfig(prev => ({
        ...prev,
        events: prev.events.map((event, eIdx) =>
          eIdx === eventIndex
            ? { ...event, fields: event.fields.filter((_, fIdx) => fIdx !== fieldIndex) }
            : event
        ),
      }));

      // Otherwise delete from the unsaved currentEvent
    } else if (currentEvent) {
      const updatedFields = (currentEvent.fields || []).filter((_, fIdx) => fIdx !== fieldIndex);
      setCurrentEvent({ ...currentEvent, fields: updatedFields });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.id || !config.type) {
      setError('Machine ID and Type are required');
      return;
    }
    onSave(config);
  };

  return (
    <div className="machine-config-form">
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Basic Config */}
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Machine Configuration</h5>
          </Card.Header>
          <Card.Body>
            <Form.Group className="mb-3">
              <Form.Label>Machine ID *</Form.Label>
              <Form.Control
                type="text"
                name="id"
                value={config.id}
                onChange={handleConfigChange}
                placeholder="e.g., machine1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Machine Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={config.name}
                onChange={handleConfigChange}
                placeholder="e.g., machine1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Type *</Form.Label>
              <Form.Select name="type" value={config.type} onChange={handleConfigChange}>
                <option value="machine">Machine</option>
                <option value="line">Line</option>
                <option value="plant">Plant</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={config.description}
                onChange={handleConfigChange}
                placeholder="Enter description"
                rows={2}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Events Section */}
        <Card className="mb-4">
          <Card.Header className="bg-secondary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Events ({config.events.length})</h5>
            <Button size="sm" variant="light" onClick={() => openEventModal()}>
              + Add Event
            </Button>
          </Card.Header>
          <Card.Body>
            {config.events.length === 0 ? (
              <p className="text-muted">No events added yet. Click "Add Event" to create one.</p>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Table Name</th>
                    <th>Live</th>
                    <th>Fields</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {config.events.map((event, eIdx) => (
                    <tr key={eIdx}>
                      <td>{event.id}</td>
                      <td>
                        <span className="badge bg-info">{event.type}</span>
                      </td>
                      <td>{event.tableName}</td>
                      <td>
                        <span className={`badge ${event.live ? 'bg-success' : 'bg-warning'}`}>
                          {event.live ? 'Live' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <small>
                          {event.fields.length} field{event.fields.length !== 1 ? 's' : ''}
                        </small>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="info"
                          onClick={() => openFieldModal(eIdx)}
                          className="me-2"
                        >
                          Fields
                        </Button>
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => openEventModal(eIdx)}
                          className="me-2"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteEvent(eIdx)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Form Actions */}
        <div className="d-flex gap-2">
          <Button variant="success" type="submit" size="lg">
            Save Configuration
          </Button>
          {onCancel && (
            <Button variant="secondary" type="button" size="lg" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </Form>

      {/* Event Modal */}
      <Modal show={showEventModal} onHide={closeEventModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingEventIndex !== null ? 'Edit Event' : 'Add New Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Event ID *</Form.Label>
              <Form.Control
                type="text"
                name="id"
                value={currentEvent?.id || ''}
                onChange={handleEventChange}
                placeholder="e.g., event1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type *</Form.Label>
              <Form.Select
                name="type"
                value={currentEvent?.type || 'alarm'}
                onChange={handleEventChange}
              >
                <option value="alarm">Alarm</option>
                <option value="statusChange">Status Change</option>
                <option value="metricUpdate">Metric Update</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Table Name *</Form.Label>
              <Form.Control
                type="text"
                name="tableName"
                value={currentEvent?.tableName || ''}
                onChange={handleEventChange}
                placeholder="e.g., machine-alarm"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={currentEvent?.description || ''}
                onChange={handleEventChange}
                rows={2}
                placeholder="Enter event description"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="live"
                label="Live Event"
                checked={currentEvent?.live || false}
                onChange={handleEventChange}
              />
            </Form.Group>
          </Form>

          {/* Fields for this Event */}
          <Card className="mt-3">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Event Fields ({currentEvent?.fields?.length || 0})</h6>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => openFieldModal(editingEventIndex !== null ? editingEventIndex : undefined)}
                >
                  + Add Field
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {!currentEvent?.fields || currentEvent.fields.length === 0 ? (
                <p className="text-muted">No fields added yet.</p>
              ) : (
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Key</th>
                      <th>DB Column</th>
                      <th>Display At</th>
                      <th>Unit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEvent.fields.map((field, fIdx) => (
                      <tr key={fIdx}>
                        <td>{field.name}</td>
                        <td>{field.key}</td>
                        <td>{field['db-columName']}</td>
                        <td>{field['ui-displayOnCardAt']}</td>
                        <td>{field.unit}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() =>
                              openFieldModal(editingEventIndex !== null ? editingEventIndex : undefined, fIdx)
                            }
                            className="me-2"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              deleteField(editingEventIndex !== null ? editingEventIndex : undefined, fIdx)
                            }
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEventModal}>
            Close
          </Button>
          <Button variant="primary" onClick={saveEvent}>
            Save Event
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Field Modal */}
      <Modal show={showFieldModal} onHide={closeFieldModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingFieldIndex !== null ? 'Edit Field' : 'Add New Field'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Field Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentField?.name || ''}
                onChange={handleFieldChange}
                placeholder="e.g., primaryValue"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Key *</Form.Label>
              <Form.Control
                type="text"
                name="key"
                value={currentField?.key || ''}
                onChange={handleFieldChange}
                placeholder="e.g., value"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>DB Column Name *</Form.Label>
              <Form.Control
                type="text"
                name="db-columName"
                value={currentField?.['db-columName'] || ''}
                onChange={handleFieldChange}
                placeholder="e.g., value"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>UI Display Order</Form.Label>
              <Form.Control
                type="number"
                name="ui-displayOnCardAt"
                value={currentField?.['ui-displayOnCardAt'] || 1}
                onChange={handleFieldChange}
                min="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unit</Form.Label>
              <Form.Control
                type="text"
                name="unit"
                value={currentField?.unit || ''}
                onChange={handleFieldChange}
                placeholder="e.g., C, units, string"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeFieldModal}>
            Close
          </Button>
          <Button variant="primary" onClick={saveField}>
            Save Field
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MachineConfigForm;