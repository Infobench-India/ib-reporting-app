// components/UtilizationBar.tsx - Smooth animated progress bar + synced percentage text
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { useState, useEffect } from "react";

interface UtilizationBarProps {
  data: { quality: number; breakdownTime: number; shiftTime: number };
}
const UtilizationBar: React.FC<UtilizationBarProps> = ({ data }) => {
  const targetValue = Math.round(data.quality);
  const [animatedValue, setAnimatedValue] = useState(0);

  let machineRunHour = data.shiftTime - data.breakdownTime || data.shiftTime;

  const runMinutes = Math.max(data.shiftTime - data.breakdownTime, 0);
  const lossMinutes = data.shiftTime - runMinutes;

  const utilizationPct = Math.round((runMinutes / data.shiftTime) * 100);

  const chartData1 = [
    {
      name: "Utilization",
      run: runMinutes,
      loss: lossMinutes,
    },
  ];

  useEffect(() => {
setAnimatedValue(Math.round(targetValue));;
  }, [targetValue]);

  useEffect(() => {
    console.log("UtilizationBar data:", data);
  }, [data]);
  const chartData = [{ name: "Utilization", value: animatedValue }];
  const fillColor =
    targetValue >= 90
      ? "#10b981"
      : targetValue >= 80
      ? "#22c55e"
      : targetValue >= 70
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="h-100 d-flex align-items-center">
      {/* Chart (Left) */}
      <div style={{ flex: 1, height: "100%" }}>
        <ResponsiveContainer width="100%" height="90%">
          <RechartsBarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
          >
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 16, fontWeight: 600 }}
            />
            <XAxis hide />
            <Bar
              dataKey="value"
              fill={fillColor}
              barSize={60}
              radius={[12, 12, 12, 12]}
              animationDuration={0}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Value (Right) */}
      <div
        className="text-center"
        style={{
          width: "140px",
          marginLeft: "16px",
          lineHeight: 2,
        }}
      >
        <div className="fw-bold" style={{ fontSize: "3.2rem", lineHeight: 1, color: fillColor }}>
          {animatedValue}%
        </div>
        <div className="text-muted fw-semibold" style={{ fontSize: "1.1rem" }}>
          Utilization
        </div>
       <div className="d-flex justify-content-between align-items-center mb-1">
  <span className="text-muted fw-semibold d-flex align-items-center">
    ⏱ Shift
  </span>
  <span className="badge bg-light text-dark fs-6">
    {data.shiftTime} min
  </span>
</div>

<div className="d-flex justify-content-between align-items-center">
  <span className="text-muted fw-semibold d-flex align-items-center">
    ▶ Run
  </span>
  <span className="badge bg-success fs-6">
    {machineRunHour} min
  </span>
</div>
      </div>
    </div>
  );
};

export default UtilizationBar;
