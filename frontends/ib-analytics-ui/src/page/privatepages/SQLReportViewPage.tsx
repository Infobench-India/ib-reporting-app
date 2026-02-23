import React, { useEffect, useState, useMemo } from "react";
import { Container, Card, Form, Row, Col, Button, Spinner, Pagination } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch, useAppSelector, type RootState } from "../../store";
import SQLReportService from "../../redux/features/apis/SQLReportAPI";
import NestedTable, { TableColumn } from "../../common/customeTable/nestedTable";
import moment from "moment-timezone";
import {
    BarChart,
    Bar,
    LineChart as RechartsLineChart,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Download } from "react-bootstrap-icons";

const SQLReportViewPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { configs, reportData, charts, pagination, loading, error } = useAppSelector(
        (state: RootState) => state.sqlReportReducer
    );

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedReport, setSelectedReport] = useState("");
    const [fromDate, setFromDate] = useState<Date>(new Date(new Date().setHours(0, 0, 0, 0)));
    const [toDate, setToDate] = useState<Date>(new Date());
    const [page, setPage] = useState(1);
    const limit = 20;

    useEffect(() => {
        dispatch(SQLReportService.getConfigs());
    }, [dispatch]);

    const categories = useMemo(() => {
        const cats = configs.map((c: { category: any; }) => c.category);
        return Array.from(new Set(cats)) as string[];
    }, [configs]);

    const reportNames = useMemo(() => {
        return configs
            .filter((c: { category: string; }) => c.category === selectedCategory)
            .map((c: { name: any; }) => c.name) as string[];
    }, [configs, selectedCategory]);

    const handleFetchReport = () => {
        if (!selectedCategory || !selectedReport) return;
        dispatch(
            SQLReportService.executeReport({
                category: selectedCategory,
                reportName: selectedReport,
                fromDate: moment(fromDate).format("YYYY-MM-DD HH:mm:ss"),
                toDate: moment(toDate).format("YYYY-MM-DD HH:mm:ss"),
                page,
                limit,
            })
        );
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        // After setting page, we could trigger fetch if button wasn't needed, 
        // but usually user expects update on page change.
    };

    useEffect(() => {
        if (page > 1 || reportData.length > 0) {
            handleFetchReport();
        }
    }, [page]);

    // Dynamically generate columns based on the first row of data
    const columns = useMemo<TableColumn[]>(() => {
        if (reportData.length === 0) return [];
        return Object.keys(reportData[0]).map((key) => ({
            label: key.replace(/_/g, " "),
            key: key,
            dataType: "string",
            isEditable: false,
        }));
    }, [reportData]);

    const handleDownloadChart = async (chartId: string, chartTitle: string) => {
        const element = document.getElementById(chartId);
        if (!element) return;
        const canvas = await html2canvas(element);
        canvas.toBlob((blob) => {
            if (blob) {
                saveAs(blob, `${chartTitle || "chart"}.png`);
            }
        });
    };

    const renderChart = (chartConfig: any, index: number) => {
        const { chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel } = chartConfig;
        const yCols = yAxisColumns ? yAxisColumns.split(",").map((c: string) => c.trim()) : [];
        const chartId = `chart-${index}`;

        const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

        let ChartComponent: any;
        let DataComponent: any;

        switch (chartType?.toLowerCase()) {
            case "line":
                ChartComponent = RechartsLineChart;
                DataComponent = Line;
                break;
            case "pie":
                ChartComponent = RechartsPieChart;
                DataComponent = Pie;
                break;
            case "bar":
            default:
                ChartComponent = BarChart;
                DataComponent = Bar;
                break;
        }

        return (
            <Card key={index} className="mb-4 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{chartTitle || "Chart"}</h5>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleDownloadChart(chartId, chartTitle)}>
                        <Download className="me-1" /> Download
                    </Button>
                </Card.Header>
                <Card.Body id={chartId}>
                    <div style={{ width: "100%", height: 400 }}>
                        <ResponsiveContainer>
                            <ChartComponent data={reportData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={xAxisColumn} label={{ value: xAxisLabel, position: "insideBottomRight", offset: -5 }} />
                                <YAxis label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
                                <Tooltip />
                                <Legend />
                                {chartType?.toLowerCase() === "pie" ? (
                                    <Pie
                                        data={reportData}
                                        dataKey={yCols[0]}
                                        nameKey={xAxisColumn}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={150}
                                        label
                                    >
                                        {reportData.map((entry: any, idx: number) => (
                                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                ) : (
                                    yCols.map((col: string, idx: number) => (
                                        <DataComponent
                                            key={col}
                                            type="monotone"
                                            dataKey={col}
                                            fill={COLORS[idx % COLORS.length]}
                                            stroke={COLORS[idx % COLORS.length]}
                                        />
                                    ))
                                )}
                            </ChartComponent>
                        </ResponsiveContainer>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    return (
        <Container className="mt-4" fluid>
            <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">SQL Report View</h4>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <Row className="align-items-end">
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Select
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            setSelectedReport("");
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Report Name</Form.Label>
                                    <Form.Select
                                        value={selectedReport}
                                        onChange={(e) => setSelectedReport(e.target.value)}
                                        disabled={!selectedCategory}
                                    >
                                        <option value="">Select Report</option>
                                        {reportNames.map((name: string) => (
                                            <option key={name} value={name}>
                                                {name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="d-block">From</Form.Label>
                                    <DatePicker
                                        selected={fromDate}
                                        onChange={(date: Date | null) => date && setFromDate(date)}
                                        showTimeSelect
                                        dateFormat="yyyy-MM-dd HH:mm"
                                        className="form-control"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label className="d-block">To</Form.Label>
                                    <DatePicker
                                        selected={toDate}
                                        onChange={(date: Date | null) => date && setToDate(date)}
                                        showTimeSelect
                                        dateFormat="yyyy-MM-dd HH:mm"
                                        className="form-control"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Button
                                    className="w-100"
                                    variant="primary"
                                    onClick={() => { setPage(1); handleFetchReport(); }}
                                    disabled={loading || !selectedReport}
                                >
                                    {loading ? <Spinner size="sm" animation="border" /> : "View Report"}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {error && (
                <div className="alert alert-danger shadow-sm">{error}</div>
            )}

            {reportData.length > 0 ? (
                <Card className="shadow-sm">
                    <Card.Body className="p-0">
                        <NestedTable
                            data={reportData}
                            columns={columns}
                            fontSize="13px"
                        />
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between align-items-center bg-light">
                        <span>
                            Showing Page {pagination?.currentPage} of {pagination?.totalPages} ({pagination?.totalItems} total items)
                        </span>
                        <Pagination className="mb-0">
                            <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                            <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                            <Pagination.Item active>{page}</Pagination.Item>
                            <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === pagination?.totalPages} />
                            <Pagination.Last onClick={() => handlePageChange(pagination?.totalPages || 1)} disabled={page === pagination?.totalPages} />
                        </Pagination>
                    </Card.Footer>
                </Card>
            ) : (
                !loading && (
                    <div className="text-center mt-5 text-muted">
                        <h5>No data to display. Select a report and click "View Report".</h5>
                    </div>
                )
            )}

            {reportData.length > 0 && charts && charts.length > 0 && (
                <div className="mt-4">
                    <h3 className="mb-3">Report Charts</h3>
                    <Row>
                        {charts.map((chartConfig: any, index: number) => (
                            <Col md={charts.length === 1 ? 12 : 6} key={index}>
                                {renderChart(chartConfig, index)}
                            </Col>
                        ))}
                    </Row>
                </div>
            )}
        </Container>
    );
};

export default SQLReportViewPage;
