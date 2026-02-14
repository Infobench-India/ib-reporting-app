using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using InfobenchReportingWorkerService.utils;
using log4net;
using static InfobenchReportingWorkerService.utils.ExportReportHelper;
using System.Collections.Generic;

namespace InfobenchReportingWorkerService
{
    public enum XlFixedFormatType
    {
        xlTypePDF = 0,
        xlTypeXPS = 1
    }

    [ApiController]
    [Route("api/report")]
    public class ReportController : ControllerBase
    {
        private static readonly SemaphoreSlim ExcelGate = new(3, 3);
        private static readonly ILog Log = LogManager.GetLogger(typeof(ExportReportHelper));

        public class ReportRequest
        {
            public string TemplatePath { get; set; }
            public string SheetName { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string[][] Data { get; set; }
            public int maxRowPerPage { get; set; }
            public int maxAvailableRowPerPage { get; set; }
            public int sumStartColumnNumber { get; set; }
            public int maxSumStartColumnNumber { get; set; }
            public int reportHeaderBlankRowCount { get; set; }
            public int reportHeaderStartRowNo { get; set; }
            public int reportHeaderRowCount { get; set; }
            public int tableHeaderStartRowNo { get; set; }
            public int tableHeaderRowCount { get; set; }
            public int reportDateRow { get; set; }
            public int reportDateColumn { get; set; }
            public int fromDateRow { get; set; }
            public int fromDateColumn { get; set; }
            public int toDateRow { get; set; }
            public int toDateColumn { get; set; }
            public int footerRowCount { get; set; }
            public bool isGraphSupported { get; set; }
            public bool isTabularSupported { get; set; }
            public List<ReportCellData> reportData { get; set; }
        }

        [HttpPost("excel")]
        public Task<IActionResult> Excel([FromBody] ReportRequest req)
        {
            Log.Info("Excel request received");
            return Generate(req, XlFixedFormatType.xlTypeXPS,
                "xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        }

        [HttpPost("pdf")]
        public Task<IActionResult> Pdf([FromBody] ReportRequest req)
        {
            Log.Info("PDF request received");
            return Generate(req, XlFixedFormatType.xlTypePDF,
                "pdf",
                "application/pdf");
        }

        private static System.Data.DataTable ToDataTable(string[][] data)
        {
            var dt = new System.Data.DataTable();
            for (int i = 0; i < data[0].Length; i++)
                dt.Columns.Add($"Col{i}");

            foreach (var row in data)
            {
                var dr = dt.NewRow();
                for (int i = 0; i < row.Length; i++)
                    dr[i] = row[i];
                dt.Rows.Add(dr);
            }
            return dt;
        }

        private async Task<IActionResult> Generate(
            ReportRequest req,
            XlFixedFormatType formatType,
            string extension,
            string contentType)
        {
            if (!System.IO.File.Exists(req.TemplatePath))
                return BadRequest("Template file not found.");

            if (req.Data == null || req.Data.Length == 0)
                return BadRequest("No data supplied.");

            const int MAX_ROWS = 500_000;
            if (req.Data.Length > MAX_ROWS)
                return StatusCode(413, $"Max {MAX_ROWS} rows allowed.");

            Log.Info($"Request waiting for Excel engine. Current queue: {ExcelGate.CurrentCount}");
            if (!await ExcelGate.WaitAsync(TimeSpan.FromSeconds(60)))
            {
                Log.Warn("Excel engine busy - timeout after 60s");
                return StatusCode(503, "Excel engine busy. Please try again later.");
            }

            Log.Info("Excel engine acquired. Processing request...");
            try
            {
                var dt = ToDataTable(req.Data);
                var output = new MemoryStream();

                await Task.Run(() =>
                {
                    var tmpXlsx = Path.GetTempFileName() + ".xlsx";

                    var tmpPdf = Path.GetTempFileName() + ".pdf";
                    try
                    {
                        ExportReportHelper.WriteReportInExcel(
                            dt,
                            req.TemplatePath,
                            tmpXlsx,
                            req.SheetName,
                            req.FromDate,
                            req.ToDate,
                            req.maxRowPerPage,
                            req.maxAvailableRowPerPage,
                            req.sumStartColumnNumber,
                            req.maxSumStartColumnNumber,
                            req.reportHeaderBlankRowCount,
                            req.reportHeaderStartRowNo,
                            req.reportHeaderRowCount,
                            req.tableHeaderStartRowNo,
                            req.tableHeaderRowCount,
                            req.reportDateRow,
                            req.reportDateColumn,
                            req.fromDateRow,
                            req.fromDateColumn,
                            req.toDateRow,
                            req.toDateColumn,
                            req.footerRowCount,
                            req.isGraphSupported,
                            req.isTabularSupported,
                            req.reportData
                        );

                        if (formatType == XlFixedFormatType.xlTypePDF)
                        {

                            ExportReportHelper.PrintExcelInPdf(tmpXlsx, tmpPdf);
                            using var fs = System.IO.File.OpenRead(tmpPdf);
                            fs.CopyTo(output);
                        }
                        else
                        {
                            using var fs = System.IO.File.OpenRead(tmpXlsx);
                            fs.CopyTo(output);
                        }
                        output.Position = 0;
                    }
                    finally
                    {
                        if (System.IO.File.Exists(tmpXlsx))
                        {
                            try { System.IO.File.Delete(tmpXlsx); } catch { }
                        }
                        if (System.IO.File.Exists(tmpPdf))
                        {
                            try { System.IO.File.Delete(tmpPdf); } catch { }
                        }

                    }
                });

                Log.Info($"Generated {extension} | Rows={dt.Rows.Count}");
                return File(output, contentType,
                    $"{req.SheetName}_{DateTime.Now:yyyyMMddHHmmss}.{extension}");
            }
            catch (Exception ex)
            {
                Log.Error("Failed to generate report", ex);
                return StatusCode(500, new { Error = ex.Message, StackTrace = ex.StackTrace });
            }
            finally
            {
                ExcelGate.Release();
            }
        }
    }
}
