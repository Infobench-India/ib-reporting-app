import React, { useState, useEffect } from "react";
import { Table, Button, Badge, Modal, Alert } from "react-bootstrap";
import { useAppDispatch, useAppSelector, RootState } from "../../store";
import SQLSchedulerService from "../../redux/features/apis/SQLSchedulerAPI";
import { ReportSchedule } from "../../services/schedulerService";
import SchedulerForm from "./SchedulerForm";
import ExecutionHistory from "./ExecutionHistory";
import Loader from "../Loader";
import { setError, setSuccess } from "../../redux/errorSlice";

const SchedulerList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { data, loading } = useAppSelector((state: RootState) => state.sqlSchedulerReducer);
    const schedules = data?.docs || [];

    const [showForm, setShowForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<ReportSchedule | null>(null);
    const [error, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        loadSchedules();
    }, [dispatch]);

    const loadSchedules = async () => {
        try {
            await dispatch(SQLSchedulerService.getSchedules({}));
            setLocalError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load schedules';
            setLocalError(errorMessage);
            dispatch(setError({ message: errorMessage, type: 'error' }));
            console.error('Error loading schedules:', err);
        }
    };

    const handleAdd = () => {
        setSelectedSchedule(null);
        setShowForm(true);
    };

    const handleEdit = (schedule: ReportSchedule) => {
        setSelectedSchedule(schedule);
        setShowForm(true);
    };

    const handleHistory = (schedule: ReportSchedule) => {
        setSelectedSchedule(schedule);
        setShowHistory(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this schedule?")) {
            return;
        }

        try {
            const res: any = await dispatch(SQLSchedulerService.deleteSchedule(id));
            if (res.payload?.success) {
                await loadSchedules();
                dispatch(setSuccess({ message: 'Schedule deleted successfully', type: 'success' }));
            } else {
                throw new Error(res.payload?.message || 'Failed to delete schedule');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete schedule';
            dispatch(setError({ message: errorMessage, type: 'error' }));
            console.error('Error deleting schedule:', err);
        }
    };

    const handleSave = async (data: ReportSchedule) => {
        try {
            let res: any;
            if (data.id) {
                res = await dispatch(SQLSchedulerService.updateSchedule({ id: data.id, data }));
            } else {
                res = await dispatch(SQLSchedulerService.createSchedule(data));
            }

            if (res.payload?.success) {
                setShowForm(false);
                await loadSchedules();
                dispatch(setSuccess({
                    message: data.id ? 'Schedule updated successfully' : 'Schedule created successfully',
                    type: 'success'
                }));
            } else {
                throw new Error(res.payload?.message || 'Failed to save schedule');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save schedule';
            dispatch(setError({ message: errorMessage, type: 'error' }));
            console.error('Error saving schedule:', err);
        }
    };

    if (loading && schedules.length === 0) {
        return <Loader message="Loading schedules..." />;
    }

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Report Scheduler</h4>
                <Button variant="primary" onClick={handleAdd}>+ Add Schedule</Button>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setLocalError(null)}>
                    {error}
                </Alert>
            )}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Report</th>
                        <th>Next Execution</th>
                        <th>Recipients</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={6} className="text-center"><Loader size="sm" message="" /></td></tr>
                    ) : schedules.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center">
                                <div className="py-5">
                                    <p className="text-secondary mb-3">No schedules found</p>
                                    <Button variant="primary" size="sm" onClick={handleAdd}>
                                        Create Your First Schedule
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        schedules.map((s: any) => (
                            <tr key={s.id}>
                                <td>{s.name}</td>
                                <td>{s.reportName}</td>
                                <td>{s.nextExecution ? new Date(s.nextExecution).toLocaleString() : 'Pending'}</td>
                                <td>{s.recipients}</td>
                                <td>
                                    <Badge bg={s.status === 'Active' ? 'success' : 'secondary'}>
                                        {s.status}
                                    </Badge>
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button size="sm" variant="outline-primary" onClick={() => handleEdit(s)}>Edit</Button>
                                        <Button size="sm" variant="outline-info" onClick={() => handleHistory(s)}>History</Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(s.id!)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Schedule Form Modal */}
            <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedSchedule ? 'Edit Schedule' : 'Add New Schedule'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SchedulerForm
                        initialData={selectedSchedule}
                        onSave={handleSave}
                        onCancel={() => setShowForm(false)}
                    />
                </Modal.Body>
            </Modal>

            {/* History Modal */}
            <Modal show={showHistory} onHide={() => setShowHistory(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Execution History: {selectedSchedule?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ExecutionHistory scheduleId={selectedSchedule?.id} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default SchedulerList;
