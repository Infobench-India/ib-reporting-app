import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, Table, Modal } from "react-bootstrap";
import ReportConfigService from "../../redux/features/apis/ReportConfigAPI";
import Swal from "sweetalert2";

interface SumItem {
    query: string;
    dataRow: number;
    dataColumn: number;
}

interface ChartItem {
    chartType: string;
    chartTitle: string;
    xAxisColumn: string;
    yAxisColumns: string;
    xAxisLabel: string;
    yAxisLabel: string;
}

interface ReportConfig {
    id?: string;
    category: string;
    name: string;
    tableName: string;
    templateName: string;
    columns: string;
    connectionString: string;
    query: string;
    maxRowPerPage: number;
    maxAvailableRowPerPage: number;
    sumStartColumnNumber: number;
    maxSumStartColumnNumber: number;
    reportHeaderBlankRowCount: number;
    reportHeaderStartRowNo: number;
    reportHeaderRowCount: number;
    tableHeaderStartRowNo: number;
    tableHeaderRowCount: number;
    reportDateRow: number;
    reportDateColumn: number;
    fromDateRow: number;
    fromDateColumn: number;
    toDateRow: number;
    toDateColumn: number;
    footerRowCount: number;
    isGraphSupported: boolean;
    isTabularSupported: boolean;
    sum: SumItem[];
    charts: ChartItem[];
}

interface Props {
    initialData: ReportConfig | null;
    onSave: (data: ReportConfig) => void;
    onCancel: () => void;
}

const ReportFormComponent: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
    const [isTestingConn, setIsTestingConn] = useState(false);
    const [isTestingQuery, setIsTestingQuery] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [testDates, setTestDates] = useState({
        fromDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
    });

    const [form, setForm] = useState<ReportConfig>({
        category: "",
        name: "",
        tableName: "",
        templateName: "",
        columns: "",
        connectionString: "",
        query: "",
        maxRowPerPage: 0,
        maxAvailableRowPerPage: 0,
        sumStartColumnNumber: 0,
        maxSumStartColumnNumber: 0,
        reportHeaderBlankRowCount: 0,
        reportHeaderStartRowNo: 0,
        reportHeaderRowCount: 0,
        tableHeaderStartRowNo: 0,
        tableHeaderRowCount: 0,
        reportDateRow: 0,
        reportDateColumn: 0,
        fromDateRow: 0,
        fromDateColumn: 0,
        toDateRow: 0,
        toDateColumn: 0,
        footerRowCount: 0,
        isGraphSupported: false,
        isTabularSupported: false,
        sum: [],
        charts: [],
    });

    const handleTestConnection = async () => {
        if (!form.connectionString) {
            Swal.fire("Error", "Please enter a connection string first", "error");
            return;
        }
        setIsTestingConn(true);
        try {
            const res = await ReportConfigService.testConnection(form.connectionString);
            Swal.fire("Success", res.message || "Connection successful!", "success");
        } catch (err: any) {
            const msg = err.errors?.[0] || err.message || "Unknown error";
            Swal.fire("Connection Failed", msg, "error");
        } finally {
            setIsTestingConn(false);
        }
    };

    const handleTestQuery = () => {
        if (!form.connectionString || !form.query) {
            Swal.fire("Error", "Please enter both connection string and query first", "error");
            return;
        }

        const hasDatePlaceholders = form.query.includes('$_FROM_DATE_$') || form.query.includes('$_TO_DATE_$');

        if (hasDatePlaceholders) {
            setShowDateModal(true);
        } else {
            executeTestQuery({});
        }
    };

    const executeTestQuery = async (dates: { fromDate?: string, toDate?: string }) => {
        setIsTestingQuery(true);
        try {
            let processedQuery = form.query;

            // 1. Replace Table Name
            processedQuery = processedQuery.replace(/\$_TABLE_NAME_\$/g, form.tableName || "");

            // 2. Replace Dates if provided
            if (dates.fromDate) {
                processedQuery = processedQuery.replace(/\$_FROM_DATE_\$/g, dates.fromDate);
            }
            if (dates.toDate) {
                processedQuery = processedQuery.replace(/\$_TO_DATE_\$/g, dates.toDate);
            }

            const res = await ReportConfigService.testQuery(form.connectionString, processedQuery);
            Swal.fire({
                title: "Query Valid!",
                text: `Successfully executed. Columns found: ${res.columns?.join(', ') || 'None'}`,
                icon: "success"
            });
        } catch (err: any) {
            const msg = err.errors?.[0] || err.message || "Unknown error";
            Swal.fire("Query Error", msg, "error");
        } finally {
            setIsTestingQuery(false);
            setShowDateModal(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            setForm({
                ...initialData,
                sum: initialData.sum || [],
                charts: initialData.charts || [],
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value),
        });
    };

    const addSumItem = () => {
        setForm({
            ...form,
            sum: [...form.sum, { query: "", dataRow: 0, dataColumn: 0 }],
        });
    };

    const updateSumItem = (index: number, field: string, value: any) => {
        const newSum = [...form.sum];
        newSum[index] = { ...newSum[index], [field]: field.includes('Row') || field.includes('Column') ? Number(value) : value };
        setForm({ ...form, sum: newSum });
    };

    const removeSumItem = (index: number) => {
        setForm({ ...form, sum: form.sum.filter((_, i) => i !== index) });
    };

    const addChartItem = () => {
        setForm({
            ...form,
            charts: [...form.charts, {
                chartType: "bar",
                chartTitle: "",
                xAxisColumn: "",
                yAxisColumns: "",
                xAxisLabel: "",
                yAxisLabel: ""
            }],
        });
    };

    const updateChartItem = (index: number, field: string, value: any) => {
        const newCharts = [...form.charts];
        newCharts[index] = { ...newCharts[index], [field]: value };
        setForm({ ...form, charts: newCharts });
    };

    const removeChartItem = (index: number) => {
        setForm({ ...form, charts: form.charts.filter((_, i) => i !== index) });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <Form onSubmit={handleSubmit} className="p-3">
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>Category *</Form.Label>
                        <Form.Control name="category" value={form.category} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>Report Name *</Form.Label>
                        <Form.Control name="name" value={form.name} onChange={handleChange} required />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>Table Name *</Form.Label>
                        <Form.Control name="tableName" value={form.tableName} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-2">
                        <Form.Label>Template Name *</Form.Label>
                        <Form.Control name="templateName" value={form.templateName} onChange={handleChange} required />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-2">
                <Form.Label className="d-flex justify-content-between align-items-center">
                    Connection String *
                    <Button
                        size="sm"
                        variant="outline-info"
                        onClick={handleTestConnection}
                        disabled={isTestingConn}
                    >
                        {isTestingConn ? "Testing..." : "Test Connection"}
                    </Button>
                </Form.Label>
                <Form.Control name="connectionString" value={form.connectionString} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-2">
                <Form.Label className="d-flex justify-content-between align-items-center">
                    Query *
                    <Button
                        size="sm"
                        variant="outline-info"
                        onClick={handleTestQuery}
                        disabled={isTestingQuery}
                    >
                        {isTestingQuery ? "Testing..." : "Test Query"}
                    </Button>
                </Form.Label>
                <Form.Control as="textarea" rows={3} name="query" value={form.query} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Columns (comma separated)</Form.Label>
                <Form.Control name="columns" value={form.columns} onChange={handleChange} />
            </Form.Group>

            <Card className="mb-3">
                <Card.Header>Pagination & Header Config</Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Max Row/Page</Form.Label><Form.Control type="number" name="maxRowPerPage" value={form.maxRowPerPage} onChange={handleChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Max Avail. Row/Page</Form.Label><Form.Control type="number" name="maxAvailableRowPerPage" value={form.maxAvailableRowPerPage} onChange={handleChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Sum Start Col</Form.Label><Form.Control type="number" name="sumStartColumnNumber" value={form.sumStartColumnNumber} onChange={handleChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Max Sum Start Col</Form.Label><Form.Control type="number" name="maxSumStartColumnNumber" value={form.maxSumStartColumnNumber} onChange={handleChange} /></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Header Blank Rows</Form.Label><Form.Control type="number" name="reportHeaderBlankRowCount" value={form.reportHeaderBlankRowCount} onChange={handleChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Header Start Row</Form.Label><Form.Control type="number" name="reportHeaderStartRowNo" value={form.reportHeaderStartRowNo} onChange={handleChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Header Rows</Form.Label><Form.Control type="number" name="reportHeaderRowCount" value={form.reportHeaderRowCount} onChange={handleChange} /></Form.Group></Col>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Table Header Start</Form.Label><Form.Control type="number" name="tableHeaderStartRowNo" value={form.tableHeaderStartRowNo} onChange={handleChange} /></Form.Group></Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mb-3">
                <Card.Header>Date & Footer Config</Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={2}><Form.Group className="mb-2"><Form.Label>Date Row</Form.Label><Form.Control type="number" name="reportDateRow" value={form.reportDateRow} onChange={handleChange} /></Form.Group></Col>
                        <Col md={2}><Form.Group className="mb-2"><Form.Label>Date Col</Form.Label><Form.Control type="number" name="reportDateColumn" value={form.reportDateColumn} onChange={handleChange} /></Form.Group></Col>
                        <Col md={2}><Form.Group className="mb-2"><Form.Label>From Row</Form.Label><Form.Control type="number" name="fromDateRow" value={form.fromDateRow} onChange={handleChange} /></Form.Group></Col>
                        <Col md={2}><Form.Group className="mb-2"><Form.Label>From Col</Form.Label><Form.Control type="number" name="fromDateColumn" value={form.fromDateColumn} onChange={handleChange} /></Form.Group></Col>
                        <Col md={2}><Form.Group className="mb-2"><Form.Label>To Row</Form.Label><Form.Control type="number" name="toDateRow" value={form.toDateRow} onChange={handleChange} /></Form.Group></Col>
                        <Col md={2}><Form.Group className="mb-2"><Form.Label>To Col</Form.Label><Form.Control type="number" name="toDateColumn" value={form.toDateColumn} onChange={handleChange} /></Form.Group></Col>
                    </Row>
                    <Row>
                        <Col md={3}><Form.Group className="mb-2"><Form.Label>Footer Rows</Form.Label><Form.Control type="number" name="footerRowCount" value={form.footerRowCount} onChange={handleChange} /></Form.Group></Col>
                        <Col md={3} className="d-flex align-items-center mt-3">
                            <Form.Check type="checkbox" label="Graph Supported" name="isGraphSupported" checked={form.isGraphSupported} onChange={handleChange} className="me-3" />
                        </Col>
                        <Col md={3} className="d-flex align-items-center mt-3">
                            <Form.Check type="checkbox" label="Tabular Supported" name="isTabularSupported" checked={form.isTabularSupported} onChange={handleChange} />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    Chart Configurations
                    <Button size="sm" onClick={addChartItem}>Add Chart</Button>
                </Card.Header>
                <Card.Body>
                    <Table size="sm" bordered responsive>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Title</th>
                                <th>X-Axis Col</th>
                                <th>Y-Axis Cols</th>
                                <th>X Label</th>
                                <th>Y Label</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.charts.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <Form.Select size="sm" value={item.chartType} onChange={(e) => updateChartItem(index, 'chartType', e.target.value)}>
                                            <option value="bar">Bar</option>
                                            <option value="line">Line</option>
                                            <option value="pie">Pie</option>
                                        </Form.Select>
                                    </td>
                                    <td><Form.Control size="sm" value={item.chartTitle} onChange={(e) => updateChartItem(index, 'chartTitle', e.target.value)} /></td>
                                    <td><Form.Control size="sm" value={item.xAxisColumn} onChange={(e) => updateChartItem(index, 'xAxisColumn', e.target.value)} /></td>
                                    <td><Form.Control size="sm" value={item.yAxisColumns} onChange={(e) => updateChartItem(index, 'yAxisColumns', e.target.value)} placeholder="Col1,Col2" /></td>
                                    <td><Form.Control size="sm" value={item.xAxisLabel} onChange={(e) => updateChartItem(index, 'xAxisLabel', e.target.value)} /></td>
                                    <td><Form.Control size="sm" value={item.yAxisLabel} onChange={(e) => updateChartItem(index, 'yAxisLabel', e.target.value)} /></td>
                                    <td><Button variant="danger" size="sm" onClick={() => removeChartItem(index)}>×</Button></td>
                                </tr>
                            ))}
                            {form.charts.length === 0 && (
                                <tr><td colSpan={7} className="text-center text-muted">No charts configured</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    Summary Queries (Sum)
                    <Button size="sm" onClick={addSumItem}>Add Sum Query</Button>
                </Card.Header>
                <Card.Body>
                    <Table size="sm" bordered responsive>
                        <thead>
                            <tr>
                                <th>Query</th>
                                <th>Row</th>
                                <th>Col</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.sum.map((item, index) => (
                                <tr key={index}>
                                    <td><Form.Control size="sm" value={item.query} onChange={(e) => updateSumItem(index, 'query', e.target.value)} /></td>
                                    <td style={{ width: '80px' }}><Form.Control size="sm" type="number" value={item.dataRow} onChange={(e) => updateSumItem(index, 'dataRow', e.target.value)} /></td>
                                    <td style={{ width: '80px' }}><Form.Control size="sm" type="number" value={item.dataColumn} onChange={(e) => updateSumItem(index, 'dataColumn', e.target.value)} /></td>
                                    <td><Button variant="danger" size="sm" onClick={() => removeSumItem(index)}>×</Button></td>
                                </tr>
                            ))}
                            {form.sum.length === 0 && (
                                <tr><td colSpan={4} className="text-center text-muted">No summary queries configured</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button variant="primary" type="submit">Save Report</Button>
            </div>

            {/* Date Selection Modal for Test Query */}
            <Modal show={showDateModal} onHide={() => setShowDateModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Select Dates for Testing</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>From Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={testDates.fromDate}
                            onChange={(e) => setTestDates({ ...testDates, fromDate: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>To Date</Form.Label>
                        <Form.Control
                            type="date"
                            value={testDates.toDate}
                            onChange={(e) => setTestDates({ ...testDates, toDate: e.target.value })}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDateModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => executeTestQuery(testDates)} disabled={isTestingQuery}>
                        {isTestingQuery ? "Testing..." : "Confirm & Test"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Form>
    );
};

export default ReportFormComponent;
