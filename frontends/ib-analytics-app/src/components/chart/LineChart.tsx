import React from 'react';


const LineChart: React.FC<{ data: { x: string; y: number }[] }> = ({ data }) => {
// placeholder — use recharts or chart.js in production
return (
<div className="border rounded p-2">
<small className="text-muted">Line chart placeholder</small>
</div>
);
};


export default LineChart;