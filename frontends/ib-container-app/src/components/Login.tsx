import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

export default function Login({ onToggleRegister, onToggleForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Please fill in all fields');

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5} xl={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 d-inline-block mb-3">
                  <Lock size={32} />
                </div>
                <h2 className="fw-bold">Welcome Back</h2>
                <p className="text-muted small">Please enter your details to sign in</p>
              </div>

              {error && <Alert variant="danger" className="text-center">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label className="small fw-semibold">Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Mail size={18} className="text-muted" />
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="name@example.com"
                      className="border-start-0 ps-0"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <div className="d-flex justify-content-between">
                    <Form.Label className="small fw-semibold">Password</Form.Label>
                    <Button variant="link" className="p-0 small text-decoration-none" onClick={onToggleForgot}>
                      Forgot Password?
                    </Button>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <Lock size={18} className="text-muted" />
                    </span>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      className="border-start-0 ps-0"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3" disabled={loading}>
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      Signing in...
                    </div>
                  ) : 'Sign In'}
                </Button>

                <div className="text-center small">
                  Don't have an account? {' '}
                  <Button variant="link" className="p-0 small text-decoration-none fw-bold" onClick={onToggleRegister}>
                    Register now
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
