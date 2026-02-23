import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { ShieldCheck, Lock, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3051/api/auth';

export default function ResetPassword({ onBackToLogin }: { onBackToLogin: () => void }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const t = urlParams.get('token');
        if (t) setToken(t);
        else setError('Invalid reset link. No token found.');
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (password !== confirmPassword) return setError('Passwords do not match');
        if (password.length < 6) return setError('Password must be at least 6 characters');

        setLoading(true);
        setError('');
        try {
            console.log('Sending reset password request:', { token, newPassword: password });
            await axios.post(`${API_URL}/reset-password`, { token, newPassword: password });
            setSuccess(true);
            toast.success('Password reset successfully!');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password. Link may be expired.');
            toast.error('Reset failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="shadow-lg border-0 text-center">
                            <Card.Body className="p-5">
                                <CheckCircle size={64} className="text-success mb-4" />
                                <h2 className="fw-bold mb-3">All Set!</h2>
                                <p className="text-muted mb-4">Your password has been successfully updated.</p>
                                <Button variant="primary" className="w-100 py-2 fw-bold" onClick={onBackToLogin}>
                                    Back to Sign In
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
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="fw-bold">New Password</h2>
                                <p className="text-muted small">Please enter your new password below</p>
                            </div>

                            {error && <Alert variant="danger" className="text-center">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold">New Password</Form.Label>
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

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-semibold">Confirm Password</Form.Label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Lock size={18} className="text-muted" />
                                        </span>
                                        <Form.Control
                                            type="password"
                                            placeholder="••••••••"
                                            className="border-start-0 ps-0"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mb-3" disabled={loading || !token}>
                                    {loading ? (
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            Updating...
                                        </div>
                                    ) : 'Reset Password'}
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
