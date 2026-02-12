import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Tab, Tabs, Form, Modal } from 'react-bootstrap';
import { Users, Shield, RefreshCcw, Edit, ToggleRight, ToggleLeft, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAdminData, updateUser, updateRole } from '../store/slices/adminSlice';

export default function AdminPanel() {
  const dispatch = useAppDispatch();
  const { users, roles, loading } = useAppSelector((state) => state.admin);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
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
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted">Permissions</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-muted text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r: any) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 fw-bold">{r.name}</td>
                      <td className="px-4 py-3 text-muted small">{r.description}</td>
                      <td className="px-4 py-3">
                        <Badge bg="secondary" className="bg-opacity-10 text-secondary px-3 py-2 rounded-pill fw-medium">
                          {r.permissionCount || 0} Permissions
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
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
