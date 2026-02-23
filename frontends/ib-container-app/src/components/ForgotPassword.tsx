import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { KeyRound, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';

export default function ForgotPassword({ onBackToLogin }: { onBackToLogin: () => void }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_URL}/forgot-password`, { email });
            setSubmitted(true);
        } catch (err) {
            setError('Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="shadow-lg border-0 text-center">
                            <Card.Body className="p-5">
                                <CheckCircle size={64} className="text-success mb-4" />
                                <h2 className="fw-bold mb-3">Email Sent</h2>
                                <p className="text-muted mb-4">
                                    We've sent a password reset link to <strong>{email}</strong>.
                                    Please check your inbox.
                                </p>
                                <Button variant="primary" className="w-100 py-2 fw-bold" onClick={onBackToLogin}>
                                    Back to Login
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={6} lg={5} xl={4}>
                    <Card className="shadow-lg border-0">
                        <Card.Body className="p-4 p-md-5">
                            <div className="text-center mb-4">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 d-inline-block mb-3">
                                    <KeyRound size={32} />
                                </div>
                                <h2 className="fw-bold">Reset Password</h2>
                                <p className="text-muted small">Enter your email and we'll send you a link to reset your password</p>
                            </div>

                            {error && <Alert variant="danger" className="text-center">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
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

                                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3" disabled={loading}>
                                    {loading ? (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            Sending...
                                        </div>
                                    ) : 'Send Reset Link'}
                                </Button>

                                <div className="text-center">
                                    <Button variant="link" className="p-0 small text-decoration-none fw-bold d-flex align-items-center justify-content-center gap-2 mx-auto" onClick={onBackToLogin}>
                                        <ArrowLeft size={16} />
                                        Back to Sign In
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
