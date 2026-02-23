import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import moment from "moment";
import { useAppDispatch, useAppSelector, RootState } from "../../store";
import ReportConfigService from "../../redux/features/apis/ReportConfigAPI";
import { ReportSchedule } from "../../services/schedulerService";
import { setError } from "../../redux/errorSlice";

interface Props {
    initialData: ReportSchedule | null;
    onSave: (data: ReportSchedule) => void;
    onCancel: () => void;
}

const SchedulerForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    const dispatch = useAppDispatch();
    const { reports } = useAppSelector((state: RootState) => state.reportConfigReducer);

    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState<ReportSchedule>({
        reportId: 0,
        name: "",
        startDateTime: "",
        endDateTime: "",
        scheduleTime: "09:00",
        recipients: "",
        status: "Active",
        nextExecution: "",
    });

    useEffect(() => {
        loadReports();
    }, [dispatch]);

    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialData,
                startDateTime: initialData.startDateTime ? moment(initialData.startDateTime).format("YYYY-MM-DDTHH:mm") : "",
                endDateTime: initialData.endDateTime ? moment(initialData.endDateTime).format("YYYY-MM-DDTHH:mm") : "",
                nextExecution: initialData.nextExecution ? moment(initialData.nextExecution).format("YYYY-MM-DDTHH:mm") : "",
            });
        }
    }, [initialData]);

    // Set initial category when reports or initialData change
    useEffect(() => {
        if (initialData && reports.length > 0) {
            const report = reports.find((r: any) => r.id === initialData.reportId);
            if (report) {
                setSelectedCategory(report.category);
            }
        }
    }, [initialData, reports]);

    const loadReports = async () => {
        try {
            await dispatch(ReportConfigService.getAllReports({}));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
            dispatch(setError({ message: errorMessage, type: 'error' }));
            console.error('Error loading reports:', err);
        }
    };

    const categories = Array.from(new Set(reports.map((r: any) => r.category))) as string[];
    const filteredReports = reports.filter((r: any) => r.category === selectedCategory);

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: name === "reportId" ? Number(value) : value,
        });
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!form.name.trim()) {
            errors.name = 'Schedule name is required';
        }

        if (!form.reportId || form.reportId === 0) {
            errors.reportId = 'Please select a report';
        }

        if (!form.startDateTime) {
            errors.startDateTime = 'Start date/time is required';
        }

        if (!form.endDateTime) {
            errors.endDateTime = 'End date/time is required';
        }

        if (form.startDateTime && form.endDateTime) {
            const start = new Date(form.startDateTime);
            const end = new Date(form.endDateTime);
            if (end <= start) {
                errors.endDateTime = 'End date/time must be after start date/time';
            }
        }

        if (!form.recipients.trim()) {
            errors.recipients = 'At least one recipient is required';
        } else {
            // Basic email validation
            const emails = form.recipients.split(',').map(e => e.trim());
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emails.filter(email => !emailRegex.test(email));
            if (invalidEmails.length > 0) {
                errors.recipients = `Invalid email(s): ${invalidEmails.join(', ')}`;
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            dispatch(setError({ message: 'Please fix the validation errors', type: 'error' }));
            return;
        }

        setIsSubmitting(true);

        try {
            const dataToSave = {
                ...form,
                startDateTime: form.startDateTime ? moment(form.startDateTime).format("YYYY-MM-DD HH:mm:ss") : "",
                endDateTime: form.endDateTime ? moment(form.endDateTime).format("YYYY-MM-DD HH:mm:ss") : "",
                nextExecution: form.nextExecution ? moment(form.nextExecution).format("YYYY-MM-DD HH:mm:ss") : "",
            };
            await onSave(dataToSave);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save schedule';
            dispatch(setError({ message: errorMessage, type: 'error' }));
            console.error('Error saving schedule:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className="p-3">
            {Object.keys(validationErrors).length > 0 && (
                <Alert variant="danger" className="mb-3">
                    <strong>Please fix the following errors:</strong>
                    <ul className="mb-0 mt-2">
                        {Object.values(validationErrors).map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Alert>
            )}

            <Form.Group className="mb-3">
                <Form.Label>Schedule Name *</Form.Label>
                <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Daily Sales Report Schedule"
                    isInvalid={!!validationErrors.name}
                />
                {validationErrors.name && (
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.name}
                    </Form.Control.Feedback>
                )}
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Category *</Form.Label>
                        <Form.Select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setForm({ ...form, reportId: 0 });
                            }}
                            required
                        >
                            <option value="">-- Select Category --</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Report *</Form.Label>
                        <Form.Select
                            name="reportId"
                            value={form.reportId}
                            onChange={handleChange}
                            required
                            disabled={!selectedCategory}
                            isInvalid={!!validationErrors.reportId}
                        >
                            <option value="">-- Select Report --</option>
                            {filteredReports.map((r: any) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </Form.Select>
                        {validationErrors.reportId && (
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.reportId}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Start Date/Time *</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="startDateTime"
                            value={form.startDateTime}
                            onChange={handleChange}
                            required
                            isInvalid={!!validationErrors.startDateTime}
                        />
                        <Form.Text className="text-muted">Initial start date for the report</Form.Text>
                        {validationErrors.startDateTime && (
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.startDateTime}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>End Date/Time *</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="endDateTime"
                            value={form.endDateTime}
                            onChange={handleChange}
                            required
                            isInvalid={!!validationErrors.endDateTime}
                        />
                        <Form.Text className="text-muted">Initial end date for the report</Form.Text>
                        {validationErrors.endDateTime && (
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.endDateTime}
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Execution Time (Every Day) *</Form.Label>
                        <Form.Control type="time" name="scheduleTime" value={form.scheduleTime} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select name="status" value={form.status} onChange={handleChange}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Next Execution</Form.Label>
                        <Form.Control type="datetime-local" name="nextExecution" value={form.nextExecution} onChange={handleChange} />
                        <Form.Text className="text-muted">Override the automatic next execution time (Optional)</Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Recipients (Comma separated) *</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    name="recipients"
                    value={form.recipients}
                    onChange={handleChange}
                    required
                    placeholder="manager@example.com, admin@example.com"
                    isInvalid={!!validationErrors.recipients}
                />
                {validationErrors.recipients && (
                    <Form.Control.Feedback type="invalid">
                        {validationErrors.recipients}
                    </Form.Control.Feedback>
                )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" className="me-2" />
                            Saving...
                        </>
                    ) : (
                        'Save Schedule'
                    )}
                </Button>
            </div>
        </Form>
    );
};

export default SchedulerForm;
