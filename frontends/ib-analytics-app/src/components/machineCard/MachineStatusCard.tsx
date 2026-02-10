import React from 'react';

interface MachineProps {
  name: string;
  status: string;
  output: number;
  efficiency: number;
  downtime: number;
}

const MachineStatusCard: React.FC<MachineProps> = ({ name, status, output, efficiency, downtime }) => {
  return (
    <div className="card p-3 m-2 shadow-sm" style={{ minWidth: 200 }}>
      <h5>{name}</h5>
      <p>Status: <span className={`badge bg-${status === 'Running' ? 'success' : 'danger'}`}>{status}</span></p>
      <p>Output: {output}</p>
      <p>Efficiency: {efficiency}%</p>
      <p>Downtime: {downtime} hrs</p>
    </div>
  );
};

export default MachineStatusCard;