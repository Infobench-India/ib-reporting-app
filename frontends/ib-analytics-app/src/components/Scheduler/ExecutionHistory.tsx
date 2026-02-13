import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Pagination, Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector, RootState } from "../../store";
import SQLSchedulerService from "../../redux/features/apis/SQLSchedulerAPI";
import schedulerService, { ExecutionHistory as IExecutionHistory } from "../../services/schedulerService";
import PdfViewer from "../viewer/PdfViewer";

interface Props {
    scheduleId?: number;
}

const ExecutionHistory: React.FC<Props> = ({ scheduleId }) => {
    const dispatch = useAppDispatch();
    const { history: historyState, loading } = useAppSelector((state: RootState) => state.sqlSchedulerReducer);
    const history = historyState.docs || [];
    const { page, totalPages } = historyState;

    const [currentPage, setCurrentPage] = useState(page);
    const [limit] = useState(10);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [previewFileName, setPreviewFileName] = useState<string>("");

    useEffect(() => {
        dispatch(SQLSchedulerService.getHistory({ scheduleId, page: currentPage, limit }));
    }, [dispatch, scheduleId, currentPage, limit]);

    const loadHistory = () => {
        dispatch(SQLSchedulerService.getHistory({ scheduleId, page: currentPage, limit }));
    };

    const handleDownload = (h: IExecutionHistory) => {
        if (h.id && h.fileName) {
            schedulerService.downloadAttachment(h.id, h.fileName);
        }
    };

    const handlePreview = async (h: IExecutionHistory) => {
        if (h.id && h.fileName) {
            try {
                const blob = await schedulerService.getExecutionHistoryFile(h.id);
                // Create object URL from blob
                const url = window.URL.createObjectURL(new Blob([blob]));
                setPreviewUrl(url);
                setPreviewFileName(h.fileName);
                setShowPreview(true);
            } catch (error) {
                console.error("Failed to load preview:", error);
                alert("Failed to load document preview");
            }
        }
    };

    // Clean up object URL when modal closes or unmounts
    useEffect(() => {
        if (!showPreview && previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl("");
        }
    }, [showPreview, previewUrl]);

    const handleResend = async (id: number) => {
        if (window.confirm("Are you sure you want to resend this report?")) {
            const res: any = await dispatch(SQLSchedulerService.resendReport(id));
            if (res.payload?.success) {
                alert("Report resent successfully");
            } else {
                alert("Failed to resend report");
            }
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <div>
            <div className="d-flex justify-content-end mb-2">
                <Button size="sm" variant="outline-secondary" onClick={loadHistory}>Refresh</Button>
            </div>
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Status</th>
                        <th>File</th>
                        <th>Error</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={5} className="text-center">Loading...</td></tr>
                    ) : history.length === 0 ? (
                        <tr><td colSpan={5} className="text-center">No history found</td></tr>
                    ) : (
                        history.map((h: any) => (
                            <tr key={h.id}>
                                <td>{new Date(h.executionTime).toLocaleString()}</td>
                                <td>
                                    <Badge bg={h.status === 'Success' ? 'success' : h.status === 'Failure' ? 'danger' : 'warning'}>
                                        {h.status}
                                    </Badge>
                                </td>
                                <td>{h.fileName || '-'}</td>
                                <td className="text-truncate" style={{ maxWidth: '200px' }}>{h.errorMessage || '-'}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        {h.status === 'Success' && (
                                            <>
                                                <Button size="sm" variant="link" onClick={() => handlePreview(h)}>Preview</Button>
                                                <Button size="sm" variant="link" onClick={() => handleDownload(h)}>Download</Button>
                                                <Button size="sm" variant="link" onClick={() => handleResend(h.id)}>Resend</Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <Pagination size="sm">
                        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                        {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={i + 1 === currentPage}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}

            <Modal show={showPreview} onHide={() => setShowPreview(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>PDF Preview - {previewFileName}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '80vh', overflow: 'auto' }}>
                    {previewUrl && <PdfViewer fileUrl={previewUrl} />}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ExecutionHistory;
