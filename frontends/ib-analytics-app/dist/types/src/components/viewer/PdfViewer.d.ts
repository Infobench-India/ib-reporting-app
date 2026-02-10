import React from 'react';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
interface PdfViewerProps {
    fileUrl: string;
}
declare const PdfViewer: React.FC<PdfViewerProps>;
export default PdfViewer;
