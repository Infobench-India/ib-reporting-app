import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // Import to register autoTable
import * as XLSX from 'xlsx';

interface ExportProps {
  data: any;
  chartRef: React.RefObject<HTMLCanvasElement>;
}

const ExportButtons: React.FC<ExportProps> = ({ data, chartRef }) => {
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'Manufacturing_Report.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Manufacturing Report', 14, 20);

    // Prepare table data
    const tableData = data.map((item: any) => [
      item.name,
      item.status,
      item.output,
      `${item.efficiency}%`,
      `${item.downtime} hrs`,
    ]);
    const headers = ['Machine', 'Status', 'Output', 'Efficiency', 'Downtime'];

    // Use autoTable
    // (doc as any).autoTable({
    //   head: [headers],
    //   body: tableData,
    //   startY: 30,
    // });

    // Add Chart Image
    if (chartRef.current) {
      const imgData = chartRef.current.toDataURL('image/png');
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Performance Chart', 14, 20);
      doc.addImage(imgData, 'PNG', 10, 30, 180, 80);
    }

    // Save PDF
    doc.save('Manufacturing_Report.pdf');
  };

  return (
    <div className="d-flex gap-2 my-3">
      <button className="btn btn-primary" onClick={handleExportExcel}>Export Excel</button>
      <button className="btn btn-secondary" onClick={handleExportPDF}>Export PDF</button>
    </div>
  );
};

export default ExportButtons;