import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

interface DowntimeCause {
  name: string;
  minutes: number;
  color: string;
}

interface DowntimeAnalysisProps {
  totalMinutes: number;
  causes?: DowntimeCause[];
}

/* ✅ Explicit type for label rendering */
const renderBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;

  if (!value) return null;

  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="#111827"
      fontSize={14}
      fontWeight={700}
      dominantBaseline="middle"
    >
      {Number(value).toFixed(2)} min
    </text>
  );
};

const DowntimeBar: React.FC<DowntimeAnalysisProps> = ({
  totalMinutes,
  causes,
}) => {
  const colorMap: Record<string, string> = {           
    Quality: "#10b981",    
    Breakdown: "#f59e0b",            
    Planned: "#6b7280",          
    Material: "#8b5cf6",    
    Maintenance: "#3b82f6",     
  };

  const dataCauses = (causes || []).map(cause => ({
    name: cause.name,
    minutes: cause.minutes,
    color: cause.color || colorMap[cause.name] || "#6b7280",
  }));

  const total = Number(
  dataCauses.reduce((s, c) => s + c.minutes, 0).toFixed(2)
  );


    const fillColor =
    totalMinutes <= 90
      ? "#10b981"
      : totalMinutes <= 80
      ? "#22c55e"
      : totalMinutes <= 70
      ? "#f59e0b"
      : "#ef4444";

return (
  // <div className="h-100 d-flex align-items-center">
    <div className="h-100 d-flex align-items-center">
    {/* Chart (Left) */}
    <div style={{ flex: 1, height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={dataCauses}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 50, bottom: 0 }}
        >
          <XAxis type="number" domain={[0, totalMinutes || total]} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 14, fontWeight: 400 }}
          />
          <Tooltip formatter={(v: number | undefined) => v !== undefined ? `${v} min` : ""} />

          <Bar dataKey="minutes" barSize={25}>
            {dataCauses.map((c, i) => (
              <Cell key={i} fill={c.color} />
            ))}
            <LabelList content={renderBarLabel} />
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>

    {/* Summary (Right) */}
    <div
      className="text-center"
      style={{
        width: '160px',
        marginLeft: '16px',
      }}
    >
      <div
        className="fw-bold"
        style={{ fontSize: '3rem', lineHeight: 1, color: fillColor }}
      >
        {total} <span className="fw-bold dark" style={{color:  "#716a6aff"}}>min</span>
      </div>
      <div
        className="text-muted fw-semibold"
        style={{ fontSize: '1.1rem' }}
      >
        Total Downtime
      </div>
    </div>
  </div>
);

};

export default DowntimeBar;
