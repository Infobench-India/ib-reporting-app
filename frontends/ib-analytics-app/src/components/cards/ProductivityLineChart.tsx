// components/ProductivityLineChart.tsx - Attractive, broad, TV-optimized version (data guaranteed visible)
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList
} from 'recharts';
import { ProductivityDataPoint } from './data';

interface ProductivityLineChartProps {
  data: ProductivityDataPoint[];
}

const ProductivityLineChart: React.FC<ProductivityLineChartProps> = ({ data }) => {
  const totalPlanned = data.reduce((sum, p) => p.planned, 0);
  const totalActual = data.reduce((sum, p) => p.actual, 0);
  return (
    <ResponsiveContainer width="100%" height={230}>
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 24, left: 20, bottom: 12 }}
      >
        {/* Softer grid – less visual noise */}
        <CartesianGrid
          stroke="#e5e7eb"
          strokeDasharray="4 8"
          strokeWidth={1}
        />

        {/* X Axis – calm but readable */}
        <XAxis
          dataKey="time"
          tick={{ fontSize: 15, fontWeight: 700, fill: '#374151' }}
          tickMargin={8}
          axisLine={{ stroke: '#cbd5f5', strokeWidth: 3 }}
          tickLine={false}
        />

        {/* Y Axis – lighter, cleaner */}
        <YAxis
          domain={[0, 300]}
          tickCount={6}
          tick={{ fontSize: 14, fontWeight: 600, fill: '#374151' }}
          // axisLine={false}
          // tickLine={false}
          label={{
            value: 'Units',
            angle: -90,
            position: 'insideLeft',
            style: {
              fontSize: '1.2rem',
              fontWeight: 700,
              fill: '#475569',
            },
            dx: -20,
          }}
        />

        {/* Planned – subtle, secondary */}
        <Line
          type="monotone"
          dataKey="hourlyPlannedQty"
          stroke="#94a3b8"
          strokeWidth={3}
          strokeDasharray="10 6"
          dot={false}
          name="Planned"
        />

        {/* Actual – HERO line */}
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#16a34a"
          strokeWidth={4}
          dot={{ r: 4, fill: '#16a34a', stroke: '#fff', strokeWidth: 3 }}
          activeDot={{ r: 6 }}
          name="Actual"
          label={{
            content: ({ x, y, value }: any) =>
              value != null ? (
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fill="#166534"
                  fontSize={16}
                  fontWeight={700}
                >
                  {value}
                </text>
              ) : null,
          }}
        />

        {/* Tooltip – already good, just calmer */}
        <Tooltip
          cursor={{ stroke: '#94a3b8', strokeDasharray: '6 6' }}
          contentStyle={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: 'none',
          }}
          labelStyle={{ fontWeight: 700 }}
          formatter={(v: number | undefined) => v !== undefined ? `${v} units` : ""}
        />

        {/* Legend – clearer, calmer */}
        <Legend
          verticalAlign="top"
          align="center"
          height={28}
          formatter={(value: string, entry: any) => {
            const displayValue =
              entry.dataKey === 'actual'
                ? totalActual
                : totalPlanned;
            return (
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>
                {value} ({displayValue} units)
              </span>
            );
          }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default ProductivityLineChart;