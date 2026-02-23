// services/mockData.ts
export const getMockMachineData = () => {
  return [
    { id: 1, name: 'Machine A', status: 'Running', output: 1200, efficiency: 95, downtime: 2 },
    { id: 2, name: 'Machine B', status: 'Stopped', output: 800, efficiency: 70, downtime: 5 },
    { id: 3, name: 'Machine C', status: 'Running', output: 1500, efficiency: 98, downtime: 1 },
    // Add more mock machines
  ];
};

export const getMockAnalyticsData = () => {
  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    output: [5000, 6000, 5500, 6200, 5800, 6100],
    efficiency: [85, 88, 83, 90, 87, 92],
  };
};

interface MachineMetrics {
  machine: string;
  plannedProductionTime: number;   // minutes
  operatingTime: number;           // minutes
  actualOutput: number;
  theoreticalOutput: number;
  goodUnits: number;
  totalUnitsProduced: number;
}

export const mockOeeData: MachineMetrics[] = [
  {
    machine: "Press Machine A",
    plannedProductionTime: 480,
    operatingTime: 420,
    actualOutput: 900,
    theoreticalOutput: 1000,
    goodUnits: 870,
    totalUnitsProduced: 900
  },
  {
    machine: "Lathe Machine B",
    plannedProductionTime: 480,
    operatingTime: 350,
    actualOutput: 700,
    theoreticalOutput: 900,
    goodUnits: 690,
    totalUnitsProduced: 700
  },
  {
    machine: "CNC Machine C",
    plannedProductionTime: 480,
    operatingTime: 300,
    actualOutput: 640,
    theoreticalOutput: 800,
    goodUnits: 600,
    totalUnitsProduced: 640
  }
];

export const calculateOEE = (data: MachineMetrics[]) => {
  return data.map((d) => {
    const availability = d.operatingTime / d.plannedProductionTime;
    const performance = d.actualOutput / d.theoreticalOutput;
    const quality = d.goodUnits / d.totalUnitsProduced;
    const oee = availability * performance * quality;

    return {
      machine: d.machine,
      availability: +(availability * 100).toFixed(2),
      performance: +(performance * 100).toFixed(2),
      quality: +(quality * 100).toFixed(2),
      oee: +(oee * 100).toFixed(2)
    };
  });
};