import React from 'react';
import { Modal, Row, Col, Button } from 'react-bootstrap';
import { MachineSummary } from '../../types';
import MiniTrendGraph from '../chart/MiniTrendGraph';


interface Props {
    machine: MachineSummary;
    show: boolean;
    onHide: () => void;
}


const MachineDetailsModal: React.FC<Props> = ({ machine, show, onHide }) => {
    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{machine.name} — Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={6}>
                        <h6>Live Metrics</h6>
                        <div className="mb-3">
                            <MiniTrendGraph points={[10, 12, 11, 14, 13, 16]} />
                        </div>
                        <div className="small text-muted">Primary: {machine.value ?? '—'}</div>
                    </Col>
                    <Col md={6}>
                        <h6>Operations</h6>
                        <Button variant="danger" className="me-2">Trigger Alert</Button>
                        <Button variant="secondary">View Logs</Button>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};


export default MachineDetailsModal;