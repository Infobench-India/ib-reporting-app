import React, { useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

const PdfReportAdvanced: React.FC<PdfReportAdvancedProps> = ({
  fileName = "report",
  orientation = "portrait",
  header,
  footer,
  watermark,
  children
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const PAGE = {
    width: orientation === "portrait" ? 794 : 1122,
    height: orientation === "portrait" ? 1122 : 794,
    margin: 40
  };

  const createHiddenContainer = () => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = `${PAGE.width - 2 * PAGE.margin}px`;
    document.body.appendChild(container);
    return container;
  };

  const createPageHeader = (pdf: jsPDF, page: number) => {
    if (header?.title) {
      pdf.setFontSize(14);
      pdf.text(header.title, PAGE.margin, 30);
    }

    if (header?.logo) {
      pdf.addImage(header.logo, "PNG", PAGE.width - 120, 10, 100, 30);
    }

    if (footer?.showPageNumber) {
      pdf.setFontSize(10);
      pdf.text(`Page ${page}`, PAGE.width - 60, PAGE.height - 20);
    }
  };

  const createWatermark = (pdf: jsPDF) => {
    if (!watermark?.text) return;

    const gState = new (pdf as any).GState({
      opacity: watermark.opacity ?? 0.1
    });

    (pdf as any).setGState(gState);
    pdf.setFontSize(60);
    pdf.text(
      watermark.text,
      PAGE.width / 4,
      PAGE.height / 2,
      { angle: 30 }
    );
    (pdf as any).setGState(new (pdf as any).GState({ opacity: 1 }));
  };

const generatePDF = async () => {
  if (!pdfRef.current) return;

  const pages = pdfRef.current.querySelectorAll(
    ".a4-page"
  );

  if (!pages.length) return;

  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [PAGE.width, PAGE.height]
  });

  let pageNumber = 1;

  for (let i = 0; i < pages.length; i++) {
    const pageElement = pages[i] as HTMLElement;

    if (i > 0) {
      pdf.addPage();
      pageNumber++;
    }

    createPageHeader(pdf, pageNumber);
    createWatermark(pdf);

    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/png");

    const contentWidth = PAGE.width - PAGE.margin * 2;
    const contentHeight = PAGE.height - PAGE.margin * 2 - 40;

    pdf.addImage(
      imgData,
      "PNG",
      PAGE.margin,
      PAGE.margin + 40,
      contentWidth,
      contentHeight
    );

    if (footer?.showPageNumber) {
      pdf.setFontSize(10);
      pdf.text(
        `Page ${pageNumber}`,
        PAGE.width - 60,
        PAGE.height - 20
      );
    }
  }

  pdf.save(`${fileName}.pdf`);
};



  useEffect(() => {
    (window as any).exportReportPdf = async () => {
      await generatePDF();
      (window as any).__PDF_DONE__ = true;
    };
  }, []);

  return (
    <div style={{ maxWidth: "1100px", margin: "auto" }}>
      <button
        onClick={generatePDF}
        style={{
          float: "right",
          padding: "7px 14px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          marginBottom: "10px"
        }}
      >
        Export PDF
      </button>

      <div
        ref={pdfRef}
        style={{
          padding: "10px",
          border: "1px solid #ccc"
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PdfReportAdvanced;
