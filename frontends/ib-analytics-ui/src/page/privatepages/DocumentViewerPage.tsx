import React from 'react';
import { useLocation } from 'react-router-dom';
import PdfViewer from '../../components/viewer/PdfViewer';
import { Card, Container } from 'react-bootstrap';

const DocumentViewerPage: React.FC = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const fileUrl = query.get('url');
    const type = query.get('type') || (fileUrl?.endsWith('.pdf') ? 'pdf' : 'excel');

    if (!fileUrl) {
        return (
            <Container className="mt-4">
                <Card>
                    <Card.Body>
                        <h4 className="text-danger">No file URL provided</h4>
                        <p>Please provide a URL in the query string, e.g., <code>?url=...&type=pdf</code></p>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-3">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Document Viewer - {type.toUpperCase()}</h5>
                </Card.Header>
                <Card.Body>
                    <PdfViewer fileUrl={fileUrl} />
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DocumentViewerPage;
