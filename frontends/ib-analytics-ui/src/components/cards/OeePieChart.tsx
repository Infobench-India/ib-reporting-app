  // components/OeePieChart.tsx - Enhanced, attractive, TV-optimized donut chart
  import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';
  import { OeeBreakdown } from './data';

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6']; // Green (Availability), Amber (Performance), Blue (Quality)

  interface OeePieChartProps {
    data: OeeBreakdown;
  }

  const OeePieChart: React.FC<OeePieChartProps> = ({ data }) => {
    const total = Math.round(data.availability + data.performance + data.quality);

    const chartData = [
      { name: 'Availability', value: data.availability },
      { name: 'Performance', value: data.performance },
      { name: 'Quality', value: data.quality },
    ];

    return (
  <ResponsiveContainer width="100%" height={230}>
    <RechartsPieChart>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        innerRadius={58}
        outerRadius={95}
        dataKey="value"
        stroke="#fff"
        strokeWidth={2}
        cornerRadius={8}
        paddingAngle={2}
      >
        {chartData.map((_, index) => (
          <Cell key={index} fill={COLORS[index]} />
        ))}

        <Label
          value={`${total}%`}
          position="center"
          style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            fill: '#1f2937',
          }}
        />
        <Label
          value="OEE"
          position="center"
          dy={24}
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            fill: '#6b7280',
          }}
        />
      </Pie>

      <Legend
        verticalAlign="bottom"
        align="center"
        wrapperStyle={{ marginTop: 12 }}
        formatter={(value, entry: any) => (
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
            {value} {entry.payload.value}%
          </span>
        )}
      />
    </RechartsPieChart>
  </ResponsiveContainer>


    );
  };

  export default OeePieChart;