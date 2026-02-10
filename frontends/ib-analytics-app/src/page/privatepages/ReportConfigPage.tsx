import React, { useEffect, useState } from "react";
import { Container, Tabs, Tab, Card, Button, Table, Modal, Form, Alert } from "react-bootstrap";
import { useAppDispatch, useAppSelector, type RootState } from "../../store";
import ReportConfigService from "../../redux/features/apis/ReportConfigAPI";
import ReportFormComponent from "../../components/ReportConfig/ReportFormComponent";
import Swal from "sweetalert2";

const ReportConfigPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { reports, settings, loading, error } = useAppSelector((state: RootState) => state.reportConfigReducer);

    const [activeTab, setActiveTab] = useState("reports");
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [editingReport, setEditingReport] = useState<any>(null);
    const [importJsonText, setImportJsonText] = useState("");

    // Settings State
    const [settingsForm, setSettingsForm] = useState({
        exportFolder: "",
        connections: {
            ConnectionString: "",
            ConnectionString1: "",
            ConnectionString2: "",
            AlarmReportConnectionString: ""
        }
    });

    useEffect(() => {
        dispatch(ReportConfigService.getAllReports({}));
        dispatch(ReportConfigService.getSettings());
    }, [dispatch]);

    useEffect(() => {
        if (settings) {
            setSettingsForm(settings);
        }
    }, [settings]);

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(ReportConfigService.updateSettings(settingsForm));
    };

    const handleSettingsChange = (e: any) => {
        const { name, value } = e.target;
        if (name.startsWith("conn_")) {
            const connKey = name.replace("conn_", "");
            setSettingsForm({
                ...settingsForm,
                connections: { ...settingsForm.connections, [connKey]: value }
            });
        } else {
            setSettingsForm({ ...settingsForm, [name]: value });
        }
    };

    const handleEditReport = (report: any) => {
        setEditingReport(report);
        setShowModal(true);
    };

    const handleAddReport = () => {
        setEditingReport(null);
        setShowModal(true);
    };

    const handleDeleteReport = (id: string) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            dispatch(ReportConfigService.deleteReport(id));
        }
    };

    const handleSaveReport = (data: any) => {
        if (editingReport) {
            dispatch(ReportConfigService.updateReport({ id: editingReport.id, data }));
        } else {
            dispatch(ReportConfigService.createReport(data));
        }
        setShowModal(false);
    };

    const handleImportJson = async () => {
        try {
            const parsed = JSON.parse(importJsonText);
            const resultAction = await dispatch(ReportConfigService.importJson(parsed));
            if (ReportConfigService.importJson.fulfilled.match(resultAction)) {
                Swal.fire("Success", "Configuration imported successfully", "success");
                setShowImportModal(false);
                setImportJsonText("");
            } else {
                Swal.fire("Error", "Failed to import configuration", "error");
            }
        } catch (e) {
            Swal.fire("Error", "Invalid JSON format", "error");
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Report Configuration</h2>

            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || "reports")} className="mb-4">
                <Tab eventKey="reports" title="Reports">
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <span>Configured Reports</span>
                            <div>
                                <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>Import JSON</Button>
                                <Button onClick={handleAddReport}>Add New Report</Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Name</th>
                                        <th>Table</th>
                                        <th>Template</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r:any) => (
                                        <tr key={r.id}>
                                            <td>{r.category}</td>
                                            <td>{r.name}</td>
                                            <td>{r.tableName}</td>
                                            <td>{r.templateName}</td>
                                            <td>
                                                <Button size="sm" variant="info" className="me-2" onClick={() => handleEditReport(r)}>Edit</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDeleteReport(r.id || "")}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {reports.length === 0 && (
                                        <tr><td colSpan={5} className="text-center">No reports configured</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>

                <Tab eventKey="settings" title="Global Settings">
                    <Card>
                        <Card.Body>
                            <Form onSubmit={handleSaveSettings}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Export Folder Path</Form.Label>
                                    <Form.Control
                                        name="exportFolder"
                                        value={settingsForm.exportFolder}
                                        onChange={handleSettingsChange}
                                        placeholder="D:\Reports"
                                    />
                                </Form.Group>

                                <h5 className="mt-4 mb-3">Database Connections</h5>
                                <Form.Group className="mb-2">
                                    <Form.Label>Default Connection String</Form.Label>
                                    <Form.Control
                                        name="conn_ConnectionString"
                                        value={settingsForm.connections.ConnectionString}
                                        onChange={handleSettingsChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>Connection String 1</Form.Label>
                                    <Form.Control
                                        name="conn_ConnectionString1"
                                        value={settingsForm.connections.ConnectionString1}
                                        onChange={handleSettingsChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>Connection String 2</Form.Label>
                                    <Form.Control
                                        name="conn_ConnectionString2"
                                        value={settingsForm.connections.ConnectionString2}
                                        onChange={handleSettingsChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label>Alarm Report Connection String</Form.Label>
                                    <Form.Control
                                        name="conn_AlarmReportConnectionString"
                                        value={settingsForm.connections.AlarmReportConnectionString}
                                        onChange={handleSettingsChange}
                                    />
                                </Form.Group>

                                <Button type="submit" variant="primary">Save Global Settings</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>{editingReport ? "Edit Report" : "Add New Report"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ReportFormComponent
                        initialData={editingReport}
                        onSave={handleSaveReport}
                        onCancel={() => setShowModal(false)}
                    />
                </Modal.Body>
            </Modal>

            {/* Import JSON Modal */}
            <Modal show={showImportModal} onHide={() => setShowImportModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Import Configuration JSON</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="info">
                        Paste your JSON configuration here. It should include "Connection", "ExportFolder", and "Reports" keys.
                    </Alert>
                    <Form.Group>
                        <Form.Control
                            as="textarea"
                            rows={15}
                            value={importJsonText}
                            onChange={(e) => setImportJsonText(e.target.value)}
                            placeholder='{ "Connection": { ... }, "Reports": { ... } }'
                            className="font-monospace"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowImportModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleImportJson} disabled={!importJsonText.trim()}>Import Now</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ReportConfigPage;
