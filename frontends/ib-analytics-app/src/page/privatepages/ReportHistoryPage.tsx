import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import ReportHistoryService from '../../redux/features/apis/ReportHistoryAPI';
import { Table, Button, Form, Row, Col, Card, Badge, Modal } from 'react-bootstrap';
import moment from 'moment';

const ReportHistoryPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { data: historyData, loading, error } = useAppSelector((state: any) => state.reportHistoryReducer);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [showResendModal, setShowResendModal] = useState(false);
    const [resendItem, setResendItem] = useState<any>(null);
    const [customRecipients, setCustomRecipients] = useState('');

    useEffect(() => {
        const company = localStorage.getItem('selectedCompany');
        if (company) {
            const parsed = JSON.parse(company);
            setSelectedCompany(parsed);
            dispatch(ReportHistoryService.getAll({
                companyId: parsed.id,
                page: 1,
                limit: 50
            }));
        }
    }, [dispatch]);

    const handleResend = (item: any) => {
        setResendItem(item);
        setCustomRecipients(item.recipients.join(', '));
        setShowResendModal(true);
    };

    const confirmResend = () => {
        if (resendItem && selectedCompany) {
            const recipients = customRecipients.split(',').map(r => r.trim()).filter(r => r !== '');
            dispatch(ReportHistoryService.resend({
                id: resendItem.id,
                recipients,
                companyId: selectedCompany.id
            })).then((res: any) => {
                if (res.payload?.success) {
                    alert('Report resent successfully');
                    setShowResendModal(false);
                } else {
                    alert('Failed to resend: ' + (res.payload?.message || 'Unknown error'));
                }
            });
        }
    };

    const handleDownload = (id: string) => {
        if (selectedCompany) {
            const url = `${import.meta.env.VITE_MES_API_URL || ''}/api/report-history/download/${id}?companyId=${selectedCompany.id}`;
            window.open(url, '_blank');
        }
    };

    return (
        <div className="p-4">
            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Report Send History</h5>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => selectedCompany && dispatch(ReportHistoryService.getAll({ companyId: selectedCompany.id }))}
                    >
                        Refresh
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <Table responsive hover className="align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Date/Time</th>
                                <th>Machine</th>
                                <th>Shift</th>
                                <th>Recipients</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan={6} className="text-center py-4">Loading history...</td></tr>}
                            {!loading && historyData?.docs?.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-4 text-muted">No report history found.</td></tr>
                            )}
                            {!loading && historyData?.docs?.map((item: any) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="fw-bold">{moment(item.sentAt).format('DD MMM YYYY')}</div>
                                        <small className="text-muted">{moment(item.sentAt).format('hh:mm A')}</small>
                                    </td>
                                    <td>{item.machineId || 'N/A'}</td>
                                    <td>{item.shift || 'N/A'}</td>
                                    <td>
                                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={item.recipients.join(', ')}>
                                            {item.recipients.join(', ')}
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={item.status === 'sent' ? 'success' : 'danger'}>
                                            {item.status.toUpperCase()}
                                        </Badge>
                                        {item.error && <div className="small text-danger mt-1">{item.error}</div>}
                                    </td>
                                    <td className="text-end">
                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleDownload(item.id)}
                                            disabled={item.status === 'failed'}
                                        >
                                            View PDF
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleResend(item)}
                                            disabled={item.status === 'failed'}
                                        >
                                            Resend
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showResendModal} onHide={() => setShowResendModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Resend Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Recipients (comma separated)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={customRecipients}
                            onChange={(e) => setCustomRecipients(e.target.value)}
                        />
                        <Form.Text className="text-muted">
                            Modify recipients if needed before resending.
                        </Form.Text>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowResendModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmResend}>
                        Confirm Resend
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReportHistoryPage;
