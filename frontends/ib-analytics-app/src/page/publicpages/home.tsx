import React, { useRef } from 'react';
import { getMockAnalyticsData, getMockMachineData,  mockOeeData,calculateOEE } from '../../mock/mockData';
import MachineGrid from '../../components/machineCard/MachineGrid';


const Home: React.FC = () => {
  const machineData = getMockMachineData();
  const analyticsData = getMockAnalyticsData();
 const oeeResults = calculateOEE(mockOeeData);
  // return (
  //   <PdfReport
  //     fileName="Manufacturing-Report"
  //     orientation="landscape"
  //     header={{ title: "Infobench Solutions — MACHINE PERFORMANCE REPORT" }}
  //     footer={{ showPageNumber: true }}
  //     watermark={{ text: "Infobench Solutions CONFIDENTIAL", opacity: 0.08 }}
  //   >
  //       {/* Machine Status Overview */}
  //       <div data-type="data-nosplit" className="d-flex flex-wrap justify-content-start">
  //         {machineData.map((m) => (
  //           <MachineStatusCard
  //             key={m.id}
  //             name={m.name}
  //             status={m.status}
  //             output={m.output}
  //             efficiency={m.efficiency}
  //             downtime={m.downtime}
  //           />
  //         ))}
  //       </div>
  //       {/* Analytics Chart */}
  //       <div data-type="chart" className="my-4">
  //         <h4>Performance Metrics</h4>
  //         <AnalyticsChart
  //           labels={analyticsData.labels}
  //           outputData={analyticsData.output}
  //           efficiencyData={analyticsData.efficiency}
  //         />
  //       </div>
  //        <div data-type="chart" className="my-4">
  //         <h4>Performance Metrics</h4>
  //         <AnalyticsChart
  //           labels={analyticsData.labels}
  //           outputData={analyticsData.output}
  //           efficiencyData={analyticsData.efficiency}
  //         />
  //       </div>
  //       <div data-type="data-nosplit">
  //       <h2>Data On Calculation - OEE</h2>
  //       <p>
  //         OEE = Availability × Performance × Quality <br/>
  //         <b>Availability =</b> Operating Time / Planned Production Time <br/>
  //         <b>Performance =</b> Actual Output / Theoretical Output <br/>
  //         <b>Quality =</b> Good Units / Total Unit Produced
  //       </p>
  //     </div>

  //     <div data-type="table">
  //       <table className="table table-bordered">
  //         <thead>
  //           <tr>
  //             <th>Machine</th><th>Availability %</th><th>Performance %</th><th>Quality %</th><th>OEE %</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {oeeResults.map((r) => (
  //             <tr key={r.machine}>
  //               <td>{r.machine}</td>
  //               <td>{r.availability}</td>
  //               <td>{r.performance}</td>
  //               <td>{r.quality}</td>
  //               <td><b>{r.oee}</b></td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </div>

  //     <div data-type="chart" data-nosplit="true">
  //       <OeeChart oeeData={oeeResults}/>
  //     </div>

  //   </PdfReport>
  // );
return (
<MachineGrid />);
};

export default Home;