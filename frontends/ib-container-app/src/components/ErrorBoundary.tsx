import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Container className="py-5 text-center">
                    <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-4 d-inline-block mb-4">
                        <AlertCircle size={48} />
                    </div>
                    <h2 className="fw-bold mb-3">Something went wrong</h2>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                        We encountered an unexpected error while rendering this part of the application.
                        The issue has been logged and we're looking into it.
                    </p>
                    {this.state.error && (
                        <Alert variant="danger" className="text-start mb-4 bg-white border shadow-sm small">
                            <pre className="mb-0 overflow-auto" style={{ maxHeight: '150px' }}>
                                {this.state.error.message}
                            </pre>
                        </Alert>
                    )}
                    <Button
                        variant="primary"
                        className="d-flex align-items-center gap-2 mx-auto px-4 py-2"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw size={18} />
                        Reload Application
                    </Button>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
