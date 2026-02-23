import React from 'react';
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ChartProps {
  oeeData: {
    machine: string;
    availability: number;
    performance: number;
    quality: number;
    oee: number;
  }[];
}

const OeeChart: React.FC<ChartProps> = ({ oeeData }) => {
  const labels = oeeData.map((d) => d.machine);

  const data = {
    labels,
    datasets: [
      {
        label: "Availability (%)",
        data: oeeData.map(d => d.availability),
        backgroundColor: "#3498db"
      },
      {
        label: "Performance (%)",
        data: oeeData.map(d => d.performance),
        backgroundColor: "#e67e22"
      },
      {
        label: "Quality (%)",
        data: oeeData.map(d => d.quality),
        backgroundColor: "#2ecc71"
      },
      {
        label: "OEE (%)",
        data: oeeData.map(d => d.oee),
        backgroundColor: "#9b59b6"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const }
    },
    scales: {
      y: {
        suggestedMax: 100,
        ticks: {
          callback: (value: any) => `${value}%`
        }
      }
    }
  };

  return (
    <div style={{ width: "800px", margin: "auto" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default OeeChart;
