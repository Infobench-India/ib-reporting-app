import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register all necessary components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);

interface AnalyticsProps {
  labels: string[];
  outputData: number[];
  efficiencyData: number[];
}

const AnalyticsChart: React.FC<AnalyticsProps> = ({ labels, outputData, efficiencyData }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Output',
        data: outputData,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        yAxisID: 'y',
        pointBackgroundColor: 'blue',
      },
      {
        label: 'Efficiency (%)',
        data: efficiencyData,
        borderColor: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        yAxisID: 'y1',
        pointBackgroundColor: 'green',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default AnalyticsChart;