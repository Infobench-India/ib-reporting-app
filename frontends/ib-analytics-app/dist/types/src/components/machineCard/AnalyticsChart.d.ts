import React from 'react';
interface AnalyticsProps {
    labels: string[];
    outputData: number[];
    efficiencyData: number[];
}
declare const AnalyticsChart: React.FC<AnalyticsProps>;
export default AnalyticsChart;
