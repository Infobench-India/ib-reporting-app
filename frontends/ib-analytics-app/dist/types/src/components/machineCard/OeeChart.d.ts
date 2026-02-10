import React from 'react';
interface ChartProps {
    oeeData: {
        machine: string;
        availability: number;
        performance: number;
        quality: number;
        oee: number;
    }[];
}
declare const OeeChart: React.FC<ChartProps>;
export default OeeChart;
