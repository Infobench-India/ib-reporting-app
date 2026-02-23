import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import MachineConfigForm from './MachineConfigForm';
import MachineConfigService from '../../redux/features/apis/MachineConfigAPI';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import './MachineConfigList.scss';

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
  createdAt?: string;
  updatedAt?: string;
}

interface MachineConfigListProps {
  onEdit?: (c: MachineConfig) => void;
}

const MachineConfigList: React.FC<MachineConfigListProps> = ({ onEdit }) => {
  const dispatch = useAppDispatch();
  const machineData = useAppSelector((state: RootState) => state.machineConfigReducer.data);
  const loading = useAppSelector((state: RootState) => state.machineConfigReducer.loading);
  const sliceError = useAppSelector((state: RootState) => state.machineConfigReducer.error);

  const [configs, setConfigs] = useState<MachineConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<MachineConfig | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedConfigs, setExpandedConfigs] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Sync Redux state to local state
  useEffect(() => {
    if (machineData?.docs) {
      const docs = Array.isArray(machineData.docs) ? machineData.docs.map(normalizeConfig) : [];
      setConfigs(docs);
      if (machineData.pagination) {
        setTotalPages(machineData.pagination.totalPages || 1);
      }
    }
    if (sliceError) {
      setError(sliceError);
    }
  }, [machineData, sliceError]);

  // Normalize API response shape to UI-friendly `MachineConfig`
  const normalizeConfig = (doc: any): MachineConfig => ({
    _id: doc._id || (doc._id ? String(doc._id) : ''),
    id: doc.id,
    name: doc.name || '',
    type: doc.type,
    description: doc.description || '',
    events: doc.events || [],
    createdAt: doc.createdAt || doc.created_at || undefined,
    updatedAt: doc.updatedAt || doc.updated_at || undefined,
  });

  // Load configurations on component mount or page/search change
  useEffect(() => {
    setError(null);
    if (searchQuery) {
      dispatch(MachineConfigService.searchConfigs({ q: searchQuery, page, limit: 10 }));
    } else {
      dispatch(MachineConfigService.listConfigs({ page, limit: 10 }));
    }
  }, [page, searchQuery, dispatch]);

  const handleNewConfig = () => {
    setEditingConfig(undefined);
    setShowForm(true);
  };

  const handleEditConfig = (config: MachineConfig) => {
    setEditingConfig(config);
    setShowForm(true);
    onEdit?.(config);
  };

  const handleSaveConfig = async (config: MachineConfig) => {
    setError(null);
    try {
      if (editingConfig) {
        // Update existing config
        await dispatch(MachineConfigService.updateConfig({ _id: config._id, data: config })).unwrap();
        setSuccess('Configuration updated successfully!');
      } else {
        delete config._id;
        // Create new config
        await dispatch(MachineConfigService.createConfig(config)).unwrap();
        setSuccess('Configuration created successfully!');
      }
      setShowForm(false);
      setEditingConfig(undefined);

      // Reload list
      if (searchQuery) {
        dispatch(MachineConfigService.searchConfigs({ q: searchQuery, page, limit: 10 }));
      } else {
        dispatch(MachineConfigService.listConfigs({ page, limit: 10 }));
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      setError(null);
      try {
        await dispatch(MachineConfigService.deleteConfig(id)).unwrap();
        setSuccess('Configuration deleted successfully!');

        // Reload list
        if (searchQuery) {
          dispatch(MachineConfigService.searchConfigs({ q: searchQuery, page, limit: 10 }));
        } else {
          dispatch(MachineConfigService.listConfigs({ page, limit: 10 }));
        }

        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete configuration');
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingConfig(undefined);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const toggleConfigExpand = (configId: string) => {
    setExpandedConfigs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(configId)) {
        newSet.delete(configId);
      } else {
        newSet.add(configId);
      }
      return newSet;
    });
  };

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  return (
    <>
      <div className="machine-config-list">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Machine Configurations</h5>
          <Button variant="primary" onClick={handleNewConfig} disabled={loading}>
            + New Config
          </Button>
        </div>

        {/* Search and filters */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by ID, type, or description..."
            value={searchQuery}
            onChange={handleSearch}
            disabled={loading}
          />
        </div>

        {/* Success message */}
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {configs.length === 0 ? (
              <div className="alert alert-info">
                {searchQuery
                  ? 'No configurations found matching your search.'
                  : 'No configurations yet. Click "New Config" to create one.'}
              </div>
            ) : (
              <Table hover responsive>
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}></th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Events</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map(config => (
                    <React.Fragment key={config.id}>
                      <tr>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => toggleConfigExpand(config.id)}
                            style={{ padding: '2px 6px' }}
                          >
                            {expandedConfigs.has(config.id) ? '▼' : '▶'}
                          </button>
                        </td>
                        <td className="fw-bold">{config.id}</td>
                        <td>
                          <span className="badge bg-secondary">{config.name}</span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{config.type}</span>
                        </td>
                        <td>
                          <small>{config.description || '-'}</small>
                        </td>
                        <td>
                          <span className="badge bg-info">{config.events?.length || 0}</span>
                        </td>
                        <td>
                          <small>
                            {config.createdAt
                              ? new Date(config.createdAt).toLocaleDateString()
                              : '-'}
                          </small>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleEditConfig(config)}
                            className="me-2"
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteConfig(config.id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>

                      {/* Nested Events Table */}
                      {expandedConfigs.has(config.id) && config.events && config.events.length > 0 && (
                        <tr>
                          <td colSpan={7}>
                            <Table hover responsive size="sm" className="mb-0 mt-2">
                              <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                  <th style={{ width: '30px' }}></th>
                                  <th>Event ID</th>
                                  <th>Type</th>
                                  <th>Description</th>
                                  <th>Table Name</th>
                                  <th>Live</th>
                                  <th>Fields</th>
                                </tr>
                              </thead>
                              <tbody>
                                {config.events.map(event => (
                                  <React.Fragment key={event.id}>
                                    <tr style={{ backgroundColor: '#fafbfc' }}>
                                      <td>
                                        <button
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => toggleEventExpand(event.id)}
                                          style={{ padding: '2px 6px' }}
                                        >
                                          {expandedEvents.has(event.id) ? '▼' : '▶'}
                                        </button>
                                      </td>
                                      <td className="fw-bold">{event.id}</td>
                                      <td>
                                        <span className="badge bg-primary">{event.type}</span>
                                      </td>
                                      <td>
                                        <small>{event.description || '-'}</small>
                                      </td>
                                      <td>
                                        <small>{event.tableName || '-'}</small>
                                      </td>
                                      <td>
                                        <span className={`badge ${event.live ? 'bg-success' : 'bg-secondary'}`}>
                                          {event.live ? 'Yes' : 'No'}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="badge bg-warning">{event.fields?.length || 0}</span>
                                      </td>
                                    </tr>

                                    {/* Nested Fields Table */}
                                    {expandedEvents.has(event.id) && event.fields && event.fields.length > 0 && (
                                      <tr>
                                        <td colSpan={7}>
                                          <Table hover responsive size="sm" className="mb-0 mt-2">
                                            <thead>
                                              <tr style={{ backgroundColor: '#fff3cd' }}>
                                                <th>Field Name</th>
                                                <th>Key</th>
                                                <th>DB Column Name</th>
                                                <th>UI Display Order</th>
                                                <th>Unit</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {event.fields.map((field, idx) => (
                                                <tr key={idx}>
                                                  <td className="fw-bold">{field.name}</td>
                                                  <td>{field.key}</td>
                                                  <td>
                                                    <small>{field['db-columName'] || '-'}</small>
                                                  </td>
                                                  <td>{field['ui-displayOnCardAt']}</td>
                                                  <td>{field.unit || '-'}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </Table>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                ))}
                              </tbody>
                            </Table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
            )}

            {/* Pagination */}
            {!searchQuery && totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button
                  variant="outline-secondary"
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1 || loading}
                >
                  ← Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline-secondary"
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages || loading}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <Modal show={showForm} onHide={handleCloseForm} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingConfig ? 'Edit Machine Configuration' : 'Create New Machine Configuration'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MachineConfigForm
            initialConfig={editingConfig}
            onSave={handleSaveConfig}
            onCancel={handleCloseForm}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default MachineConfigList;