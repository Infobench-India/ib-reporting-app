// app/page.tsx - Complete, enhanced, TV-optimized dashboard with Bootstrap + Recharts
"use client";

import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Nav, Badge } from "react-bootstrap";
// import { BsBarChartFill, BsLightningChargeFill, BsRocketTakeoff, BsGear, BsCpu, BsBuilding, BsCalendar3, BsClock, BsFunnel, Bsserti } from 'react-icons/bs';
import {
  BarChartFill,
  LightningCharge,
  RocketTakeoff,
  Gear,
  Cpu,
  Building,
  Speedometer2,
  Calendar3,
  Clock,
  Tools,
  Funnel,
  Filter,
} from "react-bootstrap-icons";
// import { dashboardData } from "../../components/cards/data";
import Tile from "../../components/cards/Tile";
import OeePieChart from "../../components/cards/OeePieChart";
import ProductivityLineChart from "../../components/cards/ProductivityLineChart";
import UtilizationBar from "../../components/cards/UtilizationBar";
import DowntimeBar from "../../components/cards/DowntimeBar";
import { A4Page } from "../../components/A4Page";
import { useAppDispatch, useAppSelector, type RootState } from "../../store";
import ApiService from "../../redux/features/apis/DashboardAPI";
import { useSocket } from '../../hooks/useSocket';
export default function Dashboard() {
    const dispatch = useAppDispatch();
    const dashboardData = useAppSelector(
      (s: RootState) => s.dashboardReducer?.data?.doc ?? null
    );
  // const [selectedMachine] = useState(dashboardData?.machines[0]);
  const [activeShiftData, setActiveShiftData] = useState<any>();
  const [lastShiftData, setLastShiftData] = useState<any>();
  const totalDowntime = activeShiftData?.downtime?.totalMinutes;
  const downtimeCauses = activeShiftData?.downtime?.causes;
useSocket({
    listenAllMachines: true,
    onMachineEvent: (machineId, event) => {
      console.log(`Event for machine ${machineId}:`, event);
      dispatch(ApiService.getAll({
        machineID: machineId ? machineId : "MC001",
        isLive: true
      }));
    }
});
useEffect(() => {
  dispatch(ApiService.getAll({
    machineID: "MC001",
    isLive: true
  }));
}, []);
useEffect(() => {
  console.log("Dashboard Data:", dashboardData);
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
  return ( 
    <>
          {dashboardData &&    <div
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
                        value={`${activeShiftData?.oee ?? "--"}%`}
                        lastValue={`Last Shift: ${lastShiftData?.oee ?? "--"}%`}
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
                            {activeShiftData?.oeeBreakdown && (
                              <OeePieChart data={activeShiftData.oeeBreakdown} />
                            )}
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
              </div>}
          </>
  );
}
