import React from 'react';


const MiniTrendGraph: React.FC<{ points: number[] }> = ({ points }) => {
// simple sparkline using SVG — replace with recharts if needed
const w = 200, h = 40;
const max = Math.max(...points, 1);
const step = points.length > 1 ? w / (points.length - 1) : w;
const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i*step} ${h - (v/max)*h}`).join(' ');


return (
<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
<path d={path} fill="none" stroke="#0d6efd" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
</svg>
);
};


export default MiniTrendGraph;