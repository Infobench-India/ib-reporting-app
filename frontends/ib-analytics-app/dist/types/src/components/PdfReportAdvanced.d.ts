import React from "react";
interface HeaderConfig {
    title?: string;
    logo?: string;
}
interface FooterConfig {
    showPageNumber?: boolean;
}
interface WatermarkConfig {
    text?: string;
    opacity?: number;
}
interface PdfReportAdvancedProps {
    fileName?: string;
    orientation?: "portrait" | "landscape";
    header?: HeaderConfig;
    footer?: FooterConfig;
    watermark?: WatermarkConfig;
    children: React.ReactNode;
}
declare const PdfReportAdvanced: React.FC<PdfReportAdvancedProps>;
export default PdfReportAdvanced;
