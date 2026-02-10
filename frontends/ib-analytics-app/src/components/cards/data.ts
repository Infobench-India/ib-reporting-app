// lib/data.ts - Unchanged (Dummy data)
export interface OeeBreakdown {
  availability: number;
  performance: number;
  quality: number;
}

export interface ProductivityDataPoint {
  time: string;
  planned: number;
  actual: number;
}

export interface DowntimeCause {
  name: string;
  minutes: number;
  color: string;
}

export interface Downtime {
  totalMinutes: number;
  causes: DowntimeCause[];
}

// export const dashboardData = {
//   oee: 99,
//   lastUph : 200,
//   lastOee : 50.5,
//   productivity: 85,
//   lastProductivity : 75,
//   lastUpph : 210,
//   utilization : 50,
//   lastUtilization : 71,
//   uph: 250,
//   targetUph: 300,
//   totalShiftTime : 420,
//   machines: ['MC-01', 'MC-02', 'MC-03', 'MC-04'] as const,
//   oeeBreakdown: {
//     availability: 40,
//     performance: 30,
//     quality: 30,
//   } satisfies OeeBreakdown,
//   productivityData: [
//     { time: '08:00', planned: 0, actual: 0 },
//     { time: '09:00', planned: 100, actual: 60 },
//     { time: '10:00', planned: 150, actual: 110 },
//     { time: '11:00', planned: 200, actual: 160 },
//     { time: '12:00', planned: 250, actual: 220 },
//   ] satisfies ProductivityDataPoint[],
//   downtime: {
//   totalMinutes: 120,
//   causes: [
//     { name: 'Planned', minutes: 45, color: '#6b7280' },
//     { name: 'Quality', minutes: 25, color: '#3b82f6' },
//     { name: 'Breakdown', minutes: 35, color: '#ef4444' },
//     { name: 'Material', minutes: 15, color: '#f59e0b' },
//   ],
// } satisfies Downtime,
  

// } as const;