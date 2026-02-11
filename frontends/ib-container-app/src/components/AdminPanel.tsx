import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Row, Col, Tab, Tabs, Form, Modal } from 'react-bootstrap';
import { Users, Shield, UserPlus, RefreshCcw, Edit, ToggleRight, ToggleLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, rolesRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers }),
        axios.get(`${API_URL}/roles`, { headers })
      ]);

      setUsers(usersRes.data.users);
      setRoles(rolesRes.data.roles);
    } catch (err) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="admin-panel animate-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Administrative Operations</h2>
          <p className="text-muted small">Manage system users, roles, and security permissions</p>
        </div>
        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={fetchData} disabled={loading}>
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultActiveKey="users" id="admin-tabs" className="mb-4 custom-tabs">
        <Tab eventKey="users" title={<div className="d-flex align-items-center gap-2 px-2"><Users size={18} /> Users</div>}>
          <Card className="border-0 shadow-sm mt-3">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-uppercase small fw-bold">User</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold">Role</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold">Status</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold">Joined</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} className="align-middle">
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-2 small fw-bold">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div>
                            <div className="fw-semibold">{u.firstName} {u.lastName}</div>
                            <div className="text-muted small">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge bg="info" className="bg-opacity-10 text-info px-2 py-1">
                          {u.role || 'No Role'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge bg={u.isActive ? 'success' : 'danger'} className="bg-opacity-10 text-success px-2 py-1">
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted small">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button variant="link" className="p-0 text-primary me-2"><Edit size={18} /></Button>
                        <Button variant="link" className="p-0 text-secondary">
                          {u.isActive ? <ToggleRight size={22} className="text-success" /> : <ToggleLeft size={22} />}
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
          <Card className="border-0 shadow-sm mt-3">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-uppercase small fw-bold">Role Name</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold">Description</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold">Permissions</th>
                    <th className="px-4 py-3 text-uppercase small fw-bold text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r: any) => (
                    <tr key={r.id} className="align-middle">
                      <td className="px-4 py-3 fw-semibold">{r.name}</td>
                      <td className="px-4 py-3 text-muted small">{r.description}</td>
                      <td className="px-4 py-3">
                        <Badge bg="secondary" className="bg-opacity-10 text-secondary px-2 py-1">
                          {r.permissionCount || 0} Permissions
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <Button variant="link" className="p-0 text-primary me-2"><Edit size={18} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <style>{`
        .custom-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
          padding: 1rem 1.5rem;
          border-bottom: 2px solid transparent;
        }
        .custom-tabs .nav-link.active {
          color: #0d6efd;
          background: transparent;
          border-bottom-color: #0d6efd;
        }
        .animate-in {
          animation: fadeIn 0.5s ease-out;
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
      `}</style>
    </div>
  );
}
