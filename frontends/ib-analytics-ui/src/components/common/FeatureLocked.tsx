import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Lock, Rocket, MessageCircle } from 'lucide-react';

interface FeatureLockedProps {
    featureName: string;
    description?: string;
}

const FeatureLocked: React.FC<FeatureLockedProps> = ({
    featureName,
    description = "This feature provides advanced capabilities for enterprise reporting and automation."
}) => {
    return (
        <div className="d-flex align-items-center justify-content-center py-5 px-3">
            <Card className="text-center shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '500px' }}>
                <div className="p-5 bg-primary bg-opacity-10 position-relative text-primary">
                    <div className="position-absolute top-50 start-50 translate-middle opacity-25">
                        <Rocket size={120} />
                    </div>
                    <div className="bg-white rounded-circle p-4 d-inline-block shadow-sm mb-3">
                        <Lock size={48} />
                    </div>
                    <h3 className="fw-bold mb-0">Premium Feature</h3>
                </div>
                <Card.Body className="p-5">
                    <h4 className="mb-3 text-dark fw-bold">{featureName}</h4>
                    <p className="text-muted mb-4 fs-6">
                        {description}
                    </p>
                    <div className="bg-light p-3 rounded-3 mb-4 text-start">
                        <small className="text-uppercase fw-bold text-primary mb-2 d-block">Why unlock this?</small>
                        <ul className="list-unstyled mb-0 small text-muted">
                            <li className="mb-1">✓ Improved efficiency and automation</li>
                            <li className="mb-1">✓ Detailed enterprise analytical depth</li>
                            <li>✓ Priority support and updates</li>
                        </ul>
                    </div>
                    <div className="d-grid gap-2">
                        <Button
                            variant="primary"
                            size="lg"
                            className="py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                            onClick={() => window.location.href = 'mailto:contact@infobenchsolutions.com?subject=License Upgrade Request'}
                        >
                            <MessageCircle size={20} />
                            Contact Infobench Solutions LLP
                        </Button>
                        <small className="text-muted mt-2">
                            Upgrade your license to unlock this feature instantly.
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default FeatureLocked;
