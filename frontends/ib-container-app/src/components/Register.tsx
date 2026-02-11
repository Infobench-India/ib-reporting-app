import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';

export default function Register({ onToggleLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstName) {
      return setError('Please fill in all required fields');
    }

    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/register`, formData);
      toast.success('Registration successful! Please login.');
      onToggleLogin();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={7} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="bg-success bg-opacity-10 text-success rounded-circle p-3 d-inline-block mb-3">
                  <UserPlus size={32} />
                </div>
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted small">Join our reporting platform today</p>
              </div>

              {error && <Alert variant="danger" className="text-center">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="John"
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Doe"
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Mail size={18} className="text-muted" />
                    </span>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      className="border-start-0 ps-0"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold">Password</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Lock size={18} className="text-muted" />
                    </span>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      className="border-start-0 ps-0"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 py-2 fw-bold mb-3" disabled={loading}>
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Creating account...
                    </div>
                  ) : 'Register'}
                </Button>

                <div className="text-center small">
                  Already have an account? {' '}
                  <Button variant="link" className="p-0 small text-decoration-none fw-bold" onClick={onToggleLogin}>
                    Sign In
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
