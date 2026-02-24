import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Container, Card, Row, Col, Spinner, Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector, type RootState } from "../../store";
import SQLReportService from "../../redux/features/apis/SQLReportAPI";
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
import { Download, ArrowClockwise } from "react-bootstrap-icons";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const DashboardChartItem: React.FC<{ reportConfig: any, fromDate: string, toDate: string }> = ({ reportConfig, fromDate, toDate }) => {
    const dispatch = useAppDispatch();
    const reportKey = `${reportConfig.category}-${reportConfig.name}`;
    const reportState = useAppSelector((state: RootState) => state.sqlReportReducer.dashboardData[reportKey]);

    const fetchData = useCallback(() => {
        dispatch(
            SQLReportService.executeReport({
                category: reportConfig.category,
                reportName: reportConfig.name,
                fromDate,
                toDate,
                page: 1,
                limit: 100, // Dashboard usually shows more data or specific subsets
                reportKey
            })
        );
    }, [dispatch, reportConfig, fromDate, toDate, reportKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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

    const renderCharts = () => {
        if (!reportState?.charts || reportState.charts.length === 0) {
            return <div className="text-center p-3 text-muted">No charts configured for this report.</div>;
        }

        return reportState.charts.map((chartConfig: any, index: number) => {
            const { chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel } = chartConfig;
            const yCols = yAxisColumns ? yAxisColumns.split(",").map((c: string) => c.trim()) : [];
            const chartId = `chart-${reportKey}-${index}`;

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
                <div key={index} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">{chartTitle || "Chart"}</h6>
                        <Button variant="outline-secondary" size="sm" onClick={() => handleDownloadChart(chartId, chartTitle)}>
                            <Download size={14} />
                        </Button>
                    </div>
                    <div id={chartId} style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                            <ChartComponent data={reportState.reportData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={xAxisColumn} label={{ value: xAxisLabel, position: "insideBottomRight", offset: -5 }} />
                                <YAxis label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }} />
                                <Tooltip />
                                <Legend />
                                {chartType?.toLowerCase() === "pie" ? (
                                    <Pie
                                        data={reportState.reportData}
                                        dataKey={yCols[0]}
                                        nameKey={xAxisColumn}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label
                                    >
                                        {reportState.reportData.map((entry: any, idx: number) => (
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
                </div>
            );
        });
    };

    return (
        <Card className="h-100 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-bold">{reportConfig.name}</span>
                {reportState?.loading && <Spinner animation="border" size="sm" variant="primary" />}
                {!reportState?.loading && <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={fetchData}><ArrowClockwise /></Button>}
            </Card.Header>
            <Card.Body>
                {reportState?.error && <div className="text-danger small mb-2">{reportState.error}</div>}
                {renderCharts()}
                {!reportState?.loading && (!reportState?.reportData || reportState.reportData.length === 0) && (
                    <div className="text-center py-4 text-muted">No data found</div>
                )}
            </Card.Body>
        </Card>
    );
};

const SQLReportDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { configs, loading: configsLoading } = useAppSelector((state: RootState) => state.sqlReportReducer);

    // Initialize dates: fromDate = last 24 hours, toDate = now
    const [fromDate, setFromDate] = useState<string>(moment().subtract(1, 'days').format("YYYY-MM-DD HH:mm:ss"));
    const [toDate, setToDate] = useState<string>(moment().format("YYYY-MM-DD HH:mm:ss"));

    useEffect(() => {
        dispatch(SQLReportService.getConfigs());
    }, [dispatch]);

    // Auto refresh logic every 5 minutes
    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = moment().format("YYYY-MM-DD HH:mm:ss");
            setToDate(now);
            // Updating toDate will trigger re-fetch in DashboardChartItem because it passes toDate as prop
        }, 5 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    if (configsLoading && configs.length === 0) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container className="mt-4" fluid>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="mb-0">SQL Reports Dashboard</h3>
                    <small className="text-muted">
                        Auto-refreshing every 5 minutes | Range: {fromDate} to {toDate}
                    </small>
                </div>
                <Button variant="outline-primary" onClick={() => {
                    setToDate(moment().format("YYYY-MM-DD HH:mm:ss"));
                }}>
                    <ArrowClockwise className="me-2" /> Refresh All
                </Button>
            </div>

            <Row>
                {configs.map((config: any, index: number) => (
                    <Col key={`${config.category}-${config.name}-${index}`} lg={6} xl={4} className="mb-4">
                        <DashboardChartItem
                            reportConfig={config}
                            fromDate={fromDate}
                            toDate={toDate}
                        />
                    </Col>
                ))}
                {configs.length === 0 && !configsLoading && (
                    <Col xs={12} className="text-center mt-5">
                        <h5 className="text-muted">No SQL reports configured.</h5>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default SQLReportDashboard;
