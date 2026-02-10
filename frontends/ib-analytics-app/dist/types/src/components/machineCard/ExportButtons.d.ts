import React from 'react';
import 'jspdf-autotable';
interface ExportProps {
    data: any;
    chartRef: React.RefObject<HTMLCanvasElement>;
}
declare const ExportButtons: React.FC<ExportProps>;
export default ExportButtons;
