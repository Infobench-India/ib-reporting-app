// lib/data.ts - Unchanged (Dummy data)
export interface OeeBreakdown {
  availability: number;
  performance: number;
  quality: number;
}

export interface ProductivityDataPoint {
  time: string;
  planned: number;
  hourlyPlannedQty: number;
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
// [
//  {
//     "shift": {
//             "shift": 4,
//             "name": "night",
//             "startTime": "2025-12-20T15:38:00.000Z",
//             "endTime": "2025-12-20T15:38:00.000Z",
//             "breakTimes": [
//                 {
//                     "name": "tes5",
//                     "startTime": "2025-12-20T17:40:00.000Z",
//                     "endTime": "2025-12-20T16:40:00.000Z"
//                 }
//             ],
//             "uuid": "9c656699-8772-41cf-bd01-3e52fb0443fd",
//             "updatedAt": "2025-12-20T14:38:05.482Z",
//             "createdAt": "2025-12-20T14:38:05.482Z",
//             "id": "6946b4cda658606c5bcb07ce"
//         },
//     "lineID": "L0001",
//     "machineID": "MC001",
//     "machineName": "Tubbing Machine",
//     "shiftPlanQty": 100,
//     "shiftActualQty": 60,
//     "machineRunTime": 250,
//     "plannedProductionTime": 480,
//     "idealCycleTime": 60,
//     "badPartProduced": 5,
//  "createdAt": "2025-12-20T14:35:05.482Z",
// },
// {
//     "shift": {
//             "shift": 4,
//             "name": "night",
//             "startTime": "2025-12-20T15:38:00.000Z",
//             "endTime": "2025-12-20T15:38:00.000Z",
//             "breakTimes": [
//                 {
//                     "name": "tes5",
//                     "startTime": "2025-12-20T17:40:00.000Z",
//                     "endTime": "2025-12-20T16:40:00.000Z"
//                 }
//             ],
//             "uuid": "9c656699-8772-41cf-bd01-3e52fb0443fd",
//             "updatedAt": "2025-12-20T14:38:05.482Z",
//             "createdAt": "2025-12-20T14:38:05.482Z",
//             "id": "6946b4cda658606c5bcb07ce"
//         },
//     "lineID": "L0001",
//     "machineID": "MC001",
//     "machineName": "Tubbing Machine",
//     "shiftPlanQty": 100,
//     "shiftActualQty": 61,
//     "machineRunTime": 390,
//     "plannedProductionTime": 480,
//     "idealCycleTime": 60,
//     "badPartProduced": 5,
//  "createdAt": "2025-12-20T14:38:05.482Z",
// },
// {
//     "shift": {
//             "shift": 4,
//             "name": "night",
//             "startTime": "2025-12-20T15:38:00.000Z",
//             "endTime": "2025-12-20T15:38:00.000Z",
//             "breakTimes": [
//                 {
//                     "name": "tes5",
//                     "startTime": "2025-12-20T17:40:00.000Z",
//                     "endTime": "2025-12-20T16:40:00.000Z"
//                 }
//             ],
//             "uuid": "9c656699-8772-41cf-bd01-3e52fb0443fd",
//             "updatedAt": "2025-12-20T14:38:05.482Z",
//             "createdAt": "2025-12-20T14:38:05.482Z",
//             "id": "6946b4cda658606c5bcb07ce"
//         },
//     "lineID": "L0001",
//     "machineID": "MC001",
//     "machineName": "Tubbing Machine",
//     "shiftPlanQty": 100,
//     "shiftActualQty": 61,
//     "machineRunTime": 390,
//     "plannedProductionTime": 480,
//     "idealCycleTime": 60,
//     "badPartProduced": 6,
//  "createdAt": "2025-12-20T14:40:05.482Z",
// }
// ]
export const dashboardData = {
  oee: 99,
  lastOee : 50.5,
  productivity: 85,
  lastProductivity : 75,
  lastUph : 210,
  utilization : 50,
  lastUtilization : 71,
  uph: 250,
  targetUph: 300,
  totalShiftTime : 420,
  machines: ['MC-01', 'MC-02', 'MC-03', 'MC-04'] as const,
  oeeBreakdown: {
    availability: 40,
    performance: 30,
    quality: 30,
  } satisfies OeeBreakdown,

  
  productivityData: [
    { time: '08:00', planned: 500, hourlyPlannedQty: 0, actual: 0 },
    { time: '09:00', planned: 500, hourlyPlannedQty: 100, actual: 60 },
    { time: '10:00', planned: 500, hourlyPlannedQty: 150, actual: 110 },
    { time: '11:00', planned: 500, hourlyPlannedQty: 200, actual: 160 },
    { time: '12:00', planned: 500, hourlyPlannedQty: 250, actual: 220 },
  ] satisfies ProductivityDataPoint[],
  downtime: {
  totalMinutes: 120,
  causes: [
    { name: 'Planned', minutes: 45, color: '#6b7280' },
    { name: 'Quality', minutes: 25, color: '#3b82f6' },
    { name: 'Breakdown', minutes: 35, color: '#ef4444' },
    { name: 'Material', minutes: 15, color: '#f59e0b' },
  ],
} satisfies Downtime,
  

} as const;