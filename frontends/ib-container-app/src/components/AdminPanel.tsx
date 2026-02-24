import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Tab, Tabs, Form, Modal, Col, Row } from 'react-bootstrap';
import { Users, Shield, RefreshCcw, Edit, ToggleRight, ToggleLeft, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchAdminData,
  updateUser,
  updateRole,
  createRole,
  createPermission,
  assignPermissionToRole,
  removePermissionFromRole
} from '../store/slices/adminSlice';
import axios from 'axios';
const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';

export default function AdminPanel() {
  const dispatch = useAppDispatch();
  const { users, roles, permissions, loading } = useAppSelector((state) => state.admin);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminData());
  }, [dispatch]);

  const handleStatusToggle = async (user: any) => {
    try {
      await dispatch(updateUser({ id: user.id, updates: { isActive: !user.isActive } })).unwrap();
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (err: any) {
      toast.error(err || 'Failed to update user status');
    }
  };

  const onUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updates = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        roleId: formData.get('roleId'),
        isActive: formData.get('isActive') === 'on'
      };
      await dispatch(updateUser({ id: selectedUser.id, updates })).unwrap();
      toast.success('User updated successfully');
      setShowUserModal(false);
    } catch (err: any) {
      toast.error(err || 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const onRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updates = {
        name: formData.get('name'),
        description: formData.get('description'),
        isActive: formData.get('isActive') === 'on'
      };
      await dispatch(updateRole({ id: selectedRole.id, updates })).unwrap();
      toast.success('Role updated successfully');
      setShowRoleModal(false);
    } catch (err: any) {
      toast.error(err || 'Failed to update role');
    } finally {
      setEditLoading(false);
    }
  };

  const handleManagePermissions = async (role: any) => {
    setSelectedRole(role);
    setEditLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // Note: ib-auth-service routes are under /api/auth, but RoleController is at /roles
      const res = await axios.get(`${API_URL}/roles/${role.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRolePermissions(res.data.permissions || []);
      setShowMappingModal(true);
    } catch (err: any) {
      toast.error('Failed to fetch role permissions');
    } finally {
      setEditLoading(false);
    }
  };

  const togglePermission = async (pId: string, isAssigned: boolean) => {
    try {
      if (isAssigned) {
        await dispatch(removePermissionFromRole({ roleId: selectedRole.id, permissionId: pId })).unwrap();
      } else {
        await dispatch(assignPermissionToRole({ roleId: selectedRole.id, permissionId: pId })).unwrap();
      }

      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_URL}/roles/${selectedRole.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRolePermissions(res.data.permissions || []);
      toast.success('Permission updated');
    } catch (err: any) {
      toast.error('Failed to update permission');
    }
  };

  return (
    <div className="admin-panel animate-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-primary">Administrative Operations</h2>
          <p className="text-muted small">Manage system users, roles, and security permissions</p>
        </div>
        <Button
          variant="outline-primary"
          className="d-flex align-items-center gap-2 rounded-pill px-4"
          onClick={() => dispatch(fetchAdminData())}
          disabled={loading}
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultActiveKey="users" id="admin-tabs" className="mb-4 custom-tabs">
        <Tab eventKey="users" title={<div className="d-flex align-items-center gap-2 px-2"><Users size={18} /> Users</div>}>
          <Card className="border-0 shadow-sm mt-3 overflow-hidden rounded-4">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">User</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Role</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Status</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Joined</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 small fw-bold d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <div className="fw-bold">{u.firstName} {u.lastName}</div>
                            <div className="text-muted small">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge bg="info" className="bg-opacity-10 text-info px-3 py-2 rounded-pill fw-medium">
                          {u.role || 'No Role'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge bg={u.isActive ? 'success' : 'danger'} className={`bg-opacity-10 text-${u.isActive ? 'success' : 'danger'} px-3 py-2 rounded-pill fw-medium`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted small">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          variant="link"
                          className="p-2 text-primary hover-bg-light rounded-circle"
                          onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="link"
                          className={`p-2 hover-bg-light rounded-circle ${u.isActive ? 'text-success' : 'text-secondary'}`}
                          onClick={() => handleStatusToggle(u)}
                        >
                          {u.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="roles" title={<div className="d-flex align-items-center gap-2 px-2"><Shield size={18} /> Roles</div>}>
          <Card className="border-0 shadow-sm mt-3 overflow-hidden rounded-4">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Role Name</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Description</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Status</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r: any) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 fw-bold">{r.name}</td>
                      <td className="px-4 py-3 text-muted small">{r.description}</td>
                      <td className="px-4 py-3">
                        <Badge bg={r.isActive ? 'success' : 'danger'} className={`bg-opacity-10 text-${r.isActive ? 'success' : 'danger'} px-3 py-2 rounded-pill fw-medium`}>
                          {r.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-2 rounded-pill px-3"
                          onClick={() => handleManagePermissions(r)}
                        >
                          Permissions
                        </Button>
                        <Button
                          variant="link"
                          className="p-2 text-primary hover-bg-light rounded-circle"
                          onClick={() => { setSelectedRole(r); setShowRoleModal(true); }}
                        >
                          <Edit size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="p-3 bg-light border-top d-flex justify-content-end">
                <Button variant="primary" size="sm" className="rounded-pill px-4" onClick={() => setShowCreateRoleModal(true)}>
                  Create New Role
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="permissions" title={<div className="d-flex align-items-center gap-2 px-2"><Shield size={18} /> Permissions</div>}>
          <Card className="border-0 shadow-sm mt-3 overflow-hidden rounded-4">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Permission</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Action</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Resource</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 fw-bold">{p.name}</td>
                      <td className="px-4 py-3"><Badge bg="secondary" className="px-2 py-1">{p.action}</Badge></td>
                      <td className="px-4 py-3 text-muted small">{p.resource}</td>
                      <td className="px-4 py-3 text-muted small">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="p-3 bg-light border-top d-flex justify-content-end">
                <Button variant="primary" size="sm" className="rounded-pill px-4" onClick={() => setShowPermissionModal(true)}>
                  Add Permission
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* User Edit Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} centered className="rounded-4">
        <Form onSubmit={onUserSubmit}>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">Edit User Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">First Name</Form.Label>
              <Form.Control name="firstName" defaultValue={selectedUser?.firstName} required className="rounded-3" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Last Name</Form.Label>
              <Form.Control name="lastName" defaultValue={selectedUser?.lastName} required className="rounded-3" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Email Address</Form.Label>
              <Form.Control name="email" type="email" defaultValue={selectedUser?.email} required className="rounded-3" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">System Role</Form.Label>
              <Form.Select name="roleId" defaultValue={selectedUser?.roleId} className="rounded-3">
                {roles.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Check
              type="switch"
              id="user-active-switch"
              name="isActive"
              label="Account Active Status"
              defaultChecked={selectedUser?.isActive}
              className="mt-3 fw-medium"
            />
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4 pt-0">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowUserModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 d-flex align-items-center gap-2" disabled={editLoading}>
              {editLoading ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Role Edit Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered className="rounded-4">
        <Form onSubmit={onRoleSubmit}>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">Edit Role</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Role Name</Form.Label>
              <Form.Control name="name" defaultValue={selectedRole?.name} required className="rounded-3" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" defaultValue={selectedRole?.description} className="rounded-3" />
            </Form.Group>
            <Form.Check
              type="switch"
              id="role-active-switch"
              name="isActive"
              label="Role Active Status"
              defaultChecked={selectedRole?.isActive}
              className="mt-3 fw-medium"
            />
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4 pt-0">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4 d-flex align-items-center gap-2" disabled={editLoading}>
              {editLoading ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Role Create Modal */}
      <Modal show={showCreateRoleModal} onHide={() => setShowCreateRoleModal(false)} centered className="rounded-4">
        <Form onSubmit={async (e) => {
          e.preventDefault();
          setEditLoading(true);
          try {
            const formData = new FormData(e.target as HTMLFormElement);
            await dispatch(createRole({
              name: formData.get('name') as string,
              description: formData.get('description') as string
            })).unwrap();
            toast.success('Role created successfully');
            setShowCreateRoleModal(false);
          } catch (err: any) { toast.error(err || 'Failed to create role'); }
          finally { setEditLoading(false); }
        }}>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">Create New Role</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Role Name</Form.Label>
              <Form.Control name="name" placeholder="e.g. Editor" required className="rounded-3" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" placeholder="A brief description of this role" className="rounded-3" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4 pt-0">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowCreateRoleModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4" disabled={editLoading}>
              {editLoading ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />} Create Role
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Permission Create Modal */}
      <Modal show={showPermissionModal} onHide={() => setShowPermissionModal(false)} centered className="rounded-4">
        <Form onSubmit={async (e) => {
          e.preventDefault();
          setEditLoading(true);
          try {
            const formData = new FormData(e.target as HTMLFormElement);
            await dispatch(createPermission({
              name: formData.get('name') as string,
              action: formData.get('action') as string,
              resource: formData.get('resource') as string,
              description: formData.get('description') as string
            })).unwrap();
            toast.success('Permission created successfully');
            setShowPermissionModal(false);
          } catch (err: any) { toast.error(err || 'Failed to create permission'); }
          finally { setEditLoading(false); }
        }}>
          <Modal.Header closeButton className="border-0 px-4 pt-4">
            <Modal.Title className="fw-bold">Create New Permission</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 pb-4">
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Permission Name</Form.Label>
              <Form.Control name="name" placeholder="e.g. view_dashboard" required className="rounded-3" />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Action</Form.Label>
                  <Form.Control name="action" placeholder="e.g. read" required className="rounded-3" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Resource</Form.Label>
                  <Form.Control name="resource" placeholder="e.g. reports" required className="rounded-3" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" className="rounded-3" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4 pt-0">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowPermissionModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" className="rounded-pill px-4" disabled={editLoading}>Save Permission</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Role-Permission Mapping Modal */}
      <Modal show={showMappingModal} onHide={() => setShowMappingModal(false)} size="lg" centered className="rounded-4">
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold">Manage Permissions for <span className="text-primary">{selectedRole?.name}</span></Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="text-muted small mb-4">Select the permissions that should be assigned to this role. Changes are applied immediately.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {permissions.map((p: any) => {
              const isAssigned = rolePermissions.some(rp => rp.id === p.id);
              return (
                <div key={p.id} className="p-3 border rounded-4 d-flex align-items-center gap-3 bg-light hover-bg-white transition-all">
                  <Form.Check
                    type="switch"
                    id={`p-${p.id}`}
                    checked={isAssigned}
                    onChange={() => togglePermission(p.id, isAssigned)}
                    label={<div className="fw-bold small">{p.name}</div>}
                  />
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4 pt-0">
          <Button variant="primary" className="rounded-pill px-4" onClick={() => setShowMappingModal(false)}>Done</Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .custom-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
          padding: 1rem 1.5rem;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .custom-tabs .nav-link:hover {
          color: #0d6efd;
          background: rgba(13, 110, 253, 0.05);
        }
        .custom-tabs .nav-link.active {
          color: #0d6efd;
          background: transparent;
          border-bottom: 3px solid #0d6efd;
        }
        .animate-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
