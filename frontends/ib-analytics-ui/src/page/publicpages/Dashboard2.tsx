import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  BarChartFill,
  LightningCharge,
  Speedometer2,
  Tools,
} from "react-bootstrap-icons";
import { useSearchParams } from "react-router-dom";
import Tile from "../../components/cards/Tile";
import OeePieChart from "../../components/cards/OeePieChart";
import ProductivityLineChart from "../../components/cards/ProductivityLineChart";
import UtilizationBar from "../../components/cards/UtilizationBar";
import DowntimeBar from "../../components/cards/DowntimeBar";

import ApiService from "../../redux/features/apis/DashboardAPI";
import { useAppDispatch, useAppSelector, type RootState } from "../../store";
import { useSocket } from "../../hooks/useSocket";

import { dashboardData as mockDashboardData } from "../../lib/data";

// const USE_MOCK_DATA = true;

export default function Dashboard2() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const machineIdquery = searchParams.get("machineId");
  const mode = searchParams.get("mode");

  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(
    (s: RootState) => s.dashboardReducer.data?.doc ?? []
  );
  // const [selectedMachine] = useState(dashboardData?.machines[0]);
  const [activeShiftData, setActiveShiftData] = useState<any>();
  const [lastShiftData, setLastShiftData] = useState<any>();
  const totalDowntime = activeShiftData?.downtime?.totalMinutes;
  const downtimeCauses = activeShiftData?.downtime?.causes;
  useSocket({
    listenAllMachines: true,
    onMachineEvent: (machineId, event) => {
      if (machineIdquery && machineIdquery !== machineId) {
        return;
      }
      console.log(`Event for machine ${machineId}:`, event);
      dispatch(ApiService.getAll({
        machineID: machineId ? machineId : "MC001",
        isLive: true
      }));
    }
  });
  useEffect(() => {
    localStorage.setItem("selectedCompany", JSON.stringify({ "label": "cm1", "name": "cm1", "subdomain": "cm1", "userId": "7d1a74b8-25dc-48fc-ab75-343bf3b17952", "userEmail": "system@infobench.in", "roleId": "6829909a809efb6a40347cf1", "role": "Site_Owner", "updatedAt": "2025-05-18T07:47:38.159Z", "createdAt": "2025-05-18T07:47:38.159Z", "id": id ? id : "00000000000000000000000" }));

    dispatch(ApiService.getAll({
      machineID: machineIdquery ? machineIdquery : "MC001",
      isLive: true
    }));
  }, [id]);
  useEffect(() => {
   if (dashboardData?.currentShiftData) {
      setActiveShiftData(dashboardData.currentShiftData?.data?.data);

    }
     if (!dashboardData?.currentShiftData && dashboardData?.lastShiftData) {
      setActiveShiftData(dashboardData.lastShiftData?.data?.data);

    }
    if (dashboardData?.currentShiftData && dashboardData?.lastShiftData) {
      setLastShiftData(dashboardData.lastShiftData?.data?.data);
    }
  }, [dashboardData]);

  // Early return while loading
  if (!activeShiftData) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        No Data available in this shift, Once shift production starts data will be available
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <Container
        fluid
        className="h-100"
        style={{ padding: "6px", boxSizing: "border-box" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: "6px",
          }}
        >
          {/* ================= KPI ROW ================= */}
          <div style={{ flex: "0 0 18%" }}>
            <Row className="gx-2 gy-0" style={{ height: "180px" }}>
              <Col xs={12} md={6} lg={3} className="h-100">
                <Tile
                  title="OEE"
                  value={`N/A`}
                  lastValue={`Last Shift: N/A`}
                  sub="Overall Equipment Effectiveness"
                  icon={<BarChartFill size={34} />}
                />
              </Col>

              <Col xs={12} md={6} lg={3} className="h-100">
                <Tile
                  title="Productivity"
                  value={`${activeShiftData?.productivity ?? "--"}%`}
                  lastValue={`Last Shift: ${lastShiftData?.productivity ?? "--"
                    }%`}
                  sub="Actual vs Target"
                  icon={<LightningCharge size={34} />}
                />
              </Col>

              <Col xs={12} md={6} lg={3} className="h-100">
                <Tile
                  title="UPH"
                  value={activeShiftData?.uph ?? "--"}
                  lastValue={`Last Shift: ${lastShiftData?.uph ?? "--"}`}
                  sub={`Target ${activeShiftData?.targetUph ?? "--"}`}
                  icon={<Speedometer2 size={34} />}
                // unit="Nos"s
                />
              </Col>

              <Col xs={12} md={6} lg={3} className="h-100">
                <Tile
                  title="Utilization"
                  value={`${activeShiftData?.utilization ?? "--"}%`}
                  lastValue={`Last Shift: ${lastShiftData?.utilization ?? "--"
                    }%`}
                  sub={`Downtime ${totalDowntime ?? "--"} min`}
                  icon={<Tools size={34} />}
                />
              </Col>
            </Row>
          </div>

          {/* ================= MIDDLE ROW ================= */}
          <div style={{ flex: "0 0 42%" }}>
            <Row className="h-100 gx-2 gy-0">
              <Col xs={12} lg={4} className="h-100">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-3 h-100 d-flex flex-column">
                    <h6 className="text-muted fw-bold mb-2">
                      OEE Breakdown
                    </h6>
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                      N/A
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} lg={8} className="h-100">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-3 h-100 d-flex flex-column">
                    <h6 className="text-muted fw-bold mb-2">
                      Productivity
                    </h6>
                    <div className="flex-grow-1">
                      {activeShiftData?.productivityData && (
                        <ProductivityLineChart
                          data={activeShiftData.productivityData}
                        />
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {/* ================= BOTTOM ROW ================= */}
          <div style={{ flex: "1 1 auto" }}>
            <Row className="h-100 gx-2 gy-0" style={{ height: "150px" }}>
              <Col xs={12} lg={6} className="h-100">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-3 h-100 d-flex flex-column">
                    <h6 className="text-muted fw-bold mb-2">
                      Utilization
                    </h6>
                    <div className="flex-grow-1">
                      <UtilizationBar
                        data={{
                          quality: activeShiftData?.utilization,
                          shiftTime: activeShiftData?.totalShiftTime,
                          breakdownTime: totalDowntime,
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} lg={6} className="h-100">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-3 h-100 d-flex flex-column position-relative">
                    <div className="flex-grow-1">
                      <DowntimeBar
                        totalMinutes={totalDowntime}
                        causes={downtimeCauses}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </Container>
    </div>

  );
}
