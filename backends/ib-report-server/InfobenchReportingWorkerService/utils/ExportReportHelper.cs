using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using log4net;
using Newtonsoft.Json.Linq;

namespace InfobenchReportingWorkerService.utils
{
    public class ExportReportHelper
    {
        protected static readonly ILog Log = log4net.LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        // Constants for Excel Late Binding to avoid Interop dependency
        private const int xlPasteFormats = -4122;
        private const int xlPasteValues = -4163;
        
        public static void createPageSum(int sumStartColumnNumber, int maxSumStartColumnNumber, int localRowCount, object[,] data, object[] csum, object[] totalReportSum)
        {

            for (int k = sumStartColumnNumber; k < maxSumStartColumnNumber; k++)
            {
                TimeSpan timeSum = TimeSpan.Zero; // Initialize the sum to zero as TimeSpan
                double doubleSum = 0.0;
                for (int j = 0; j <= localRowCount; j++)
                {
                    string timeStr = data[j, k]?.ToString(); 
                    TimeSpan timeValue;

                    // Convert the time string to TimeSpan
                    if (timeStr != null && TimeSpan.TryParseExact(timeStr, @"hh\:mm\:ss\:ffffff", null, out timeValue))
                    {
                        timeSum += timeValue; // Add the TimeSpan to the sum
                        if (csum[k - sumStartColumnNumber] != null && csum[k - sumStartColumnNumber] is TimeSpan timeSpanValue)
                            csum[k - sumStartColumnNumber] = timeValue + timeSpanValue;
                        else csum[k - sumStartColumnNumber] = timeValue;
                    }
                    else if (timeStr != null && double.TryParse(timeStr, out double doubleValue))
                    {
                        doubleSum += doubleValue; // Add the double value to the sum

                        csum[k - sumStartColumnNumber] = doubleSum;
                    }
                    else
                        csum[k - sumStartColumnNumber] = 0.0;
                }

                if (csum[k - sumStartColumnNumber] is TimeSpan timeSpanValue2)
                    data[localRowCount + 1, k] = timeSpanValue2.ToString();
                else if (csum[k - sumStartColumnNumber] is double doubtValue2)
                    data[localRowCount + 1, k] = doubtValue2.ToString();
                else
                    data[localRowCount + 1, k] = 0.0;
                if (totalReportSum[k - sumStartColumnNumber] != null)
                {
                    if (csum[k - sumStartColumnNumber] is TimeSpan timeSpanValue)
                        totalReportSum[k - sumStartColumnNumber] = (TimeSpan)totalReportSum[k - sumStartColumnNumber] + timeSpanValue;
                    else if (csum[k - sumStartColumnNumber] is double doubtValue)
                        totalReportSum[k - sumStartColumnNumber] = (double)totalReportSum[k - sumStartColumnNumber] + doubtValue;
                    else
                        totalReportSum[k - sumStartColumnNumber] = 0.0;
                }
                else
                {
                    if (csum[k - sumStartColumnNumber] is TimeSpan timeSpanValue)
                        totalReportSum[k - sumStartColumnNumber] = timeSpanValue;
                    else if (csum[k - sumStartColumnNumber] is double doubtValue)
                        totalReportSum[k - sumStartColumnNumber] = doubtValue;
                    else
                        totalReportSum[k - sumStartColumnNumber] = 0.0;
                }

            }
            data[localRowCount + 1, 0] = "Page Total";
        }

        public static void CopyFormatFromRowToRange(dynamic xlsApp, dynamic xlsWorkbook, dynamic xlsht, int sourceRowNumber, int startTargetRowNumber, int endTargetRowNumber, int startTargetColumnNumber, int endTargetColumnNumber)
        {
            dynamic sourceRowRange = null;
            dynamic targetRowRange = null;
            dynamic startCell = null;
            dynamic endCell = null;
            try
            {
                // Define the range from which you want to copy the format (entire row)
                sourceRowRange = xlsht.Rows[sourceRowNumber];

                // Calculate the number of columns to copy
                int numColumnsToCopy = endTargetColumnNumber - startTargetColumnNumber + 1;

                // Calculate the number of rows to copy
                int numRowsToCopy = endTargetRowNumber - startTargetRowNumber + 1;

                // Get the target range to copy format (same number of columns as the source row)
                startCell = xlsht.Cells[startTargetRowNumber, startTargetColumnNumber];
                endCell = xlsht.Cells[startTargetRowNumber + numRowsToCopy - 1, startTargetColumnNumber + numColumnsToCopy - 1];
                targetRowRange = xlsht.Range[startCell, endCell];

                // Copy the format from the source row to the target range
                sourceRowRange.Copy();
                targetRowRange.PasteSpecial(xlPasteFormats);

                // Clear the clipboard after pasting the format
                xlsApp.CutCopyMode = 0;
            }
            finally
            {
                ReleaseObject(sourceRowRange);
                ReleaseObject(targetRowRange);
                ReleaseObject(startCell);
                ReleaseObject(endCell);
            }
        }
        

        public static void createTotalSum(int sumStartColumnNumber, int maxSumStartColumnNumber, int localRowCount, object[,] data, object[] csum, object[] totalReportSum)
        {
            for (int k = sumStartColumnNumber; k < maxSumStartColumnNumber; k++)
            {
                TimeSpan timeSum = TimeSpan.Zero; // Initialize the sum to zero as TimeSpan
                double doubleSum = 0.0;
                for (int j = 0; j <= localRowCount; j++)
                {
                    string timeStr = data[j, k]?.ToString(); 
                    TimeSpan timeValue;

                    // Convert the time string to TimeSpan
                    if (timeStr != null && TimeSpan.TryParseExact(timeStr, @"hh\:mm\:ss\:fff", null, out timeValue))
                    {
                        timeSum += timeValue; // Add the TimeSpan to the sum
                        if (csum[k - sumStartColumnNumber] != null && csum[k - sumStartColumnNumber] is TimeSpan timeSpanValue)
                            csum[k - sumStartColumnNumber] = timeValue + timeSpanValue;
                        else csum[k - sumStartColumnNumber] = timeValue;
                    }
                    else if (timeStr != null && double.TryParse(timeStr, out double doubleValue))
                    {
                        doubleSum += doubleValue; // Add the double value to the sum

                        csum[k - sumStartColumnNumber] = doubleSum;
                    }
                    else
                        csum[k - sumStartColumnNumber] = 0;
                }

                if (csum[k - sumStartColumnNumber] is TimeSpan timeSpanValue2)
                    data[localRowCount + 1, k] = timeSpanValue2.ToString();
                else if (csum[k - sumStartColumnNumber] is double doubtValue2)
                    data[localRowCount + 1, k] = doubtValue2.ToString();
                else
                    data[localRowCount + 1, k] = 0;
                if (totalReportSum[k - sumStartColumnNumber] != null)
                {
                    if (csum[k - sumStartColumnNumber] is TimeSpan timeSpanValue)
                        totalReportSum[k - sumStartColumnNumber] = (TimeSpan)totalReportSum[k - sumStartColumnNumber] + timeSpanValue;
                    else if (csum[k - sumStartColumnNumber] is double doubtValue)
                        totalReportSum[k - sumStartColumnNumber] = (double)totalReportSum[k - sumStartColumnNumber] + doubtValue;
                }
                else
                {
                    if (csum[k - sumStartColumnNumber] is TimeSpan timeSpanValue)
                        totalReportSum[k - sumStartColumnNumber] = timeSpanValue;
                    else if (csum[k - sumStartColumnNumber] is double doubtValue)
                        totalReportSum[k - sumStartColumnNumber] = doubtValue;
                }
                if (totalReportSum[k - sumStartColumnNumber] is TimeSpan timeSpanValue1)
                    data[localRowCount + 2, k] = timeSpanValue1.ToString();
                else if (totalReportSum[k - sumStartColumnNumber] is double doubtValue1)
                    data[localRowCount + 2, k] = doubtValue1.ToString();
                else
                    data[localRowCount + 2, k] = 0;

            }
            data[localRowCount + 1, 0] = "Page Total";
            data[localRowCount + 2, 0] = " Report Total";
        }

        public struct ReportCellData
        {
            public int DataRow;
            public int DataColumn;
            public object Value;
        }

        public static void PasteDataToRange(dynamic ws, object[,] data, int startRow)
        {
            int rows = data.GetLength(0);
            int cols = data.GetLength(1);
            if (rows == 0 || cols == 0) return;

            dynamic startCell = null;
            dynamic endCell = null;
            dynamic range = null;

            try
            {
                // Excel is 1-based.
                startCell = ws.Cells[startRow, 1];
                endCell = ws.Cells[startRow + rows - 1, cols];
                range = ws.Range(startCell, endCell);

                // Assign value directly for performance
                range.Value2 = data;
            }
            finally
            {
                ReleaseObject(startCell);
                ReleaseObject(endCell);
                ReleaseObject(range);
            }
        }
        public static void WriteDataTableToSheet2(System.Data.DataTable dataTableValue, dynamic workbook)
        {
            dynamic worksheet = null;

            try
            {
                // Ensure at least 2 sheets
                while (workbook.Sheets.Count < 2)
                {
                    workbook.Sheets.Add(After: workbook.Sheets[workbook.Sheets.Count]);
                }

                worksheet = (dynamic)workbook.Sheets[2];
                worksheet.Name = "Graph Data";

                int rows = dataTableValue.Rows.Count;
                int cols = dataTableValue.Columns.Count;

                // Create a 2D array including headers
                object[,] data = new object[rows + 1, cols];

                // Add column headers
                for (int col = 0; col < cols; col++)
                {
                    data[0, col] = dataTableValue.Columns[col].ColumnName;
                }

                // Add row data
                for (int row = 0; row < rows; row++)
                {
                    for (int col = 0; col < cols; col++)
                    {
                        data[row + 1, col] = dataTableValue.Rows[row][col]?.ToString();
                    }
                }

                // Define Excel range (starting from A1)
                dynamic startCell = (dynamic)worksheet.Cells[1, 1];
                dynamic endCell = (dynamic)worksheet.Cells[rows + 1, cols];
                dynamic writeRange = worksheet.Range[startCell, endCell];

                // Set the data to the range
                writeRange.Value2 = data;

                worksheet.Columns.AutoFit();
            }
            catch (Exception ex)
            {
                throw new Exception("Error writing DataTable to Excel: " + ex.Message, ex);
            }
            finally
            {
                if (worksheet != null) Marshal.ReleaseComObject(worksheet);
            }
        }
        private static void ReleaseObject(object obj)
        {
            try
            {
                if (obj != null && Marshal.IsComObject(obj))
                {
                    Marshal.ReleaseComObject(obj);
                }
            }
            catch (Exception ex)
            {
                Log.Info("Exception Occured while releasing object " + ex.ToString());
            }
            finally
            {
                obj = null;
            }
        }
        public static void PrintExcelInPdf(string sourceFilePath, string destinationFilePath)
        {
            Type excelType = Type.GetTypeFromProgID("Excel.Application");
            if (excelType == null)
            {
                Log.Error("Excel is not installed on the system.");
                throw new Exception("Excel is not installed.");
            }
            dynamic eapp = Activator.CreateInstance(excelType);
            dynamic ebook = null;
            dynamic sheet = null;

            try
            {
                eapp.Visible = false;
                eapp.DisplayAlerts = false;

                // Filepath is the Template Path
                if (!System.IO.File.Exists(sourceFilePath))
                {
                    Log.Error($"Source Excel file not found for PDF export at: {sourceFilePath}");
                    throw new System.IO.FileNotFoundException("Source Excel file not found", sourceFilePath);
                }

                ebook = eapp.Workbooks.Open(sourceFilePath);
                sheet = ebook.Sheets[1];
                
                // Configure PageSetup to match manual "Save As PDF" behavior
                dynamic pageSetup = null;
                try
                {
                    pageSetup = sheet.PageSetup;
                    pageSetup.Zoom = false;
                    pageSetup.FitToPagesWide = 1;
                    pageSetup.FitToPagesTall = false;
                    
                    // Force Excel to recalculate page breaks
                    dynamic hPageBreaks = sheet.HPageBreaks;
                    int breakCount = hPageBreaks.Count;
                    ReleaseObject(hPageBreaks);
                }
                catch (Exception ex)
                {
                    Log.Info("Error setting PageSetup: " + ex.Message);
                }
                finally
                {
                    ReleaseObject(pageSetup);
                }

                // Export only this sheet as PDF, respecting manual page breaks and print areas
                // Positional arguments: Type, Filename, Quality, IncludeDocProperties, IgnorePrintAreas, ...
                sheet.ExportAsFixedFormat(0, destinationFilePath, 0, true, false);
            }
            finally
            {
                // Cleanup
                if (ebook != null)
                {
                    try { ebook.Close(false); } catch { }
                    ReleaseObject(ebook);
                }
                
                if (sheet != null) ReleaseObject(sheet);

                if (eapp != null)
                {
                    try { eapp.Quit(); } catch { }
                    ReleaseObject(eapp);
                }
                
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }
        public static void WriteReportInExcel(
            System.Data.DataTable dataTablevalue,
            string Filepath,
            string SheetName,
            string viewReportPath,
            string fromDate,
            string toDate,
            int maxRowPerPage,
            int maxAvailableRowPerPage,
            int sumStartColumnNumber,
            int maxSumStartColumnNumber,
            int reportHeaderBlankRowCount,
            int reportHeaderStartRowNo,
            int reportHeaderRowCount,
            int tableHeaderStartRowNo,
            int tableHeaderRowCount,
            int reportDateRow,
            int reportDateColumn,
            int fromDateRow,
            int fromDateColumn,
            int toDateRow,
            int toDateColumn,
            int footerRowCount,
            bool isGraphSupported,
            bool isTabularSupported,
            List<ReportCellData> reportData
            )
        {
            Type excelType = Type.GetTypeFromProgID("Excel.Application");
            if (excelType == null)
            {
                Log.Error("Excel is not installed on the system.");
                throw new Exception("Excel is not installed.");
            }

            dynamic excelApp = Activator.CreateInstance(excelType);
            dynamic wb = null;
            dynamic xlsht = null;

            try
            {
                excelApp.Visible = false;
                excelApp.DisplayAlerts = false;

                // Filepath is the Template Path
                if (!System.IO.File.Exists(Filepath))
                {
                    Log.Error($"Template file not found at: {Filepath}");
                    throw new System.IO.FileNotFoundException("Template file not found", Filepath);
                }

                wb = excelApp.Workbooks.Open(Filepath);
                xlsht = wb.Sheets[1];
            
                int ReportHeaderAndTableHeader = reportHeaderBlankRowCount + reportHeaderRowCount + tableHeaderRowCount;
                // Range address strings e.g. "1:3"
                string reportHeaderRowsPrefix = (reportHeaderStartRowNo).ToString();
                string reportHeaderRowsSuffix = (reportHeaderStartRowNo + reportHeaderRowCount - 1).ToString();
                
                string tableHeaderRowsPrefix = (tableHeaderStartRowNo).ToString();
                string tableHeaderRowsSuffix = (tableHeaderStartRowNo + tableHeaderRowCount - 1).ToString();

                int headerAndFooterRowCount = ReportHeaderAndTableHeader + footerRowCount;
                
                var data = new object[maxRowPerPage, 10];
                int localRowCount = 0;
                int startCellRowCount = tableHeaderStartRowNo + tableHeaderRowCount;
                int endCellRowCount = 0;
                int pageCount = 1;

                if (reportData != null)
                {
                    foreach (var item in reportData)
                    {
                        dynamic cell = null;
                        try
                        {
                            cell = xlsht.Cells[item.DataRow, item.DataColumn];
                            cell.Value2 = item.Value;
                        }
                        catch (Exception ex)
                        {
                            Log.Info($"Error setting cell [{item.DataRow},{item.DataColumn}]: {ex.Message}");
                        }
                        finally
                        {
                            ReleaseObject(cell);
                        }
                    }

                }
                
                // Set Header Dates
                if (reportDateRow > 0 && reportDateColumn > 0)
                {
                     dynamic cell = xlsht.Cells[reportDateRow, reportDateColumn];
                     cell.Value2 = DateTime.Now.ToString();
                     ReleaseObject(cell);
                }
                if (fromDateRow > 0 && fromDateColumn > 0)
                {
                     dynamic cell = xlsht.Cells[fromDateRow, fromDateColumn];
                     cell.Value2 = fromDate?.ToString();
                     ReleaseObject(cell);
                }
                if (toDateRow > 0 && toDateColumn > 0)
                {
                     dynamic cell = xlsht.Cells[toDateRow, toDateColumn];
                     cell.Value2 = toDate?.ToString();
                     ReleaseObject(cell);
                }

                if (isTabularSupported)
                {
                     object[] totalReportSum = new object[dataTablevalue.Columns.Count - 1];
                     
                     for (int i = 0; i < dataTablevalue.Rows.Count; i++)
                     {
                        if (localRowCount == 0)
                        {
                            data = new object[maxRowPerPage + 2, dataTablevalue.Columns.Count];
                        }
                        
                        // Fill Data Array
                        for (int j = 0; j < dataTablevalue.Columns.Count; j++)
                        {
                            try
                            {
                                object value = dataTablevalue.Rows[i][j];
                                data[localRowCount, j] = value?.ToString(); // Ensure safe type for COM array
                            }
                            catch (Exception ex)
                            {
                                string exc = ex.ToString();
                            }
                        }

                        // Determine if we need to write a page
                        bool isPageBreak = (i > 0 && ((i + 1) % maxRowPerPage == 0 || (i + 1) == (maxAvailableRowPerPage - tableHeaderStartRowNo - tableHeaderRowCount)) && pageCount == 1 && i != dataTablevalue.Rows.Count - 1);
                        bool isSubsequentPageBreak = (i > 0 && ((i + 1) % maxRowPerPage) == 0 && pageCount != 1 && i != dataTablevalue.Rows.Count - 1);
                        bool isLastRow = (i == dataTablevalue.Rows.Count - 1);

                        if (isPageBreak || isSubsequentPageBreak)
                        {
                             if (maxSumStartColumnNumber != 0)
                                endCellRowCount = startCellRowCount + localRowCount + 2;
                            else
                                endCellRowCount = startCellRowCount + localRowCount + 1;
                            
                            object[] csum = new object[dataTablevalue.Columns.Count - 1];
                            int sourceRowNumber = tableHeaderStartRowNo + tableHeaderRowCount; 
                            // Adjust source row logic if needed. In original code it was variable.
                            // Original: int sourceRowNumber = tableHeaderStartRowNo + tableHeaderRowCount;
                            
                            int startTargetRowNumber = startCellRowCount; 
                            int endTargetRowNumber = endCellRowCount - 1; 
                            int startTargetColumnNumber = 1; 
                            int endTargetColumnNumber = dataTablevalue.Columns.Count; 

                            if (maxSumStartColumnNumber != 0)
                                createPageSum(sumStartColumnNumber, maxSumStartColumnNumber, localRowCount, data, csum, totalReportSum);
                            
                            PasteDataToRange(xlsht, data, startCellRowCount);
                            CopyFormatFromRowToRange(excelApp,wb, xlsht, sourceRowNumber, startTargetRowNumber, endTargetRowNumber, startTargetColumnNumber, endTargetColumnNumber);
                            
                            if (maxSumStartColumnNumber != 0)
                            {
                                dynamic st = null;
                                dynamic en = null;
                                dynamic lastRowRange = null;
                                try
                                {
                                    st = xlsht.Cells[endCellRowCount - 1, 1];
                                    en = xlsht.Cells[endCellRowCount - 1, endTargetColumnNumber];
                                    lastRowRange = xlsht.Range(st, en);
                                    lastRowRange.Font.Bold = true;
                                }
                                finally
                                {
                                    ReleaseObject(st);
                                    ReleaseObject(en);
                                    ReleaseObject(lastRowRange);
                                }
                            }
                            
                            endCellRowCount = maxAvailableRowPerPage * pageCount;

                            // Add physical page break to excel sheet
                            dynamic hPageBreaks = null;
                            dynamic breakCell = null;
                            try
                            {
                                hPageBreaks = xlsht.HPageBreaks;
                                breakCell = xlsht.Cells[endCellRowCount + 1, 1];
                                hPageBreaks.Add(breakCell);
                            }
                            catch (Exception ex)
                            {
                                Log.Info("Error adding HPageBreak: " + ex.Message);
                            }
                            finally
                            {
                                ReleaseObject(hPageBreaks);
                                ReleaseObject(breakCell);
                            }
                            
                            // Copy Headers for Next Page
                            if (i < dataTablevalue.Rows.Count - 1)
                            {
                                dynamic rowsCollection = null;
                                dynamic fromRange = null;
                                dynamic toCell = null;
                                try
                                {
                                    rowsCollection = xlsht.Rows;
                                    // Copy Report Header
                                    fromRange = rowsCollection[reportHeaderRowsPrefix + ":" + reportHeaderRowsSuffix];
                                    int startRow = endCellRowCount + reportHeaderBlankRowCount;
                                    // In COM we can specify destination top-left cell
                                    toCell = xlsht.Cells[startRow, 1];
                                    fromRange.Copy(toCell); // Destination
                                    
                                    ReleaseObject(fromRange);
                                    ReleaseObject(toCell);

                                    // Copy Table Header
                                    fromRange = rowsCollection[tableHeaderRowsPrefix + ":" + tableHeaderRowsSuffix];
                                    startRow = endCellRowCount + reportHeaderBlankRowCount + reportHeaderRowCount;
                                    toCell = xlsht.Cells[startRow, 1];
                                    fromRange.Copy(toCell);
                                }
                                finally
                                {
                                    ReleaseObject(fromRange);
                                    ReleaseObject(toCell);
                                    ReleaseObject(rowsCollection);
                                }
                            }
                            
                            startCellRowCount = endCellRowCount + ReportHeaderAndTableHeader;
                            data = new object[maxRowPerPage + 2, dataTablevalue.Columns.Count];
                            localRowCount = 0;
                            pageCount++;
                            continue;
                        }

                        // Last Page Logic
                        if (isLastRow)
                        {
                            if (maxSumStartColumnNumber != 0)
                                endCellRowCount = startCellRowCount + localRowCount + 3;
                            else
                                endCellRowCount = startCellRowCount + localRowCount + 1;

                            object[] csum = new object[dataTablevalue.Columns.Count - 1];
                            int sourceRowNumber = tableHeaderStartRowNo + tableHeaderRowCount;
                            int startTargetRowNumber = startCellRowCount;
                            int endTargetRowNumber = endCellRowCount - 1;
                            int startTargetColumnNumber = 1;
                            int endTargetColumnNumber = dataTablevalue.Columns.Count;

                            if (maxSumStartColumnNumber != 0)
                                createTotalSum(sumStartColumnNumber, maxSumStartColumnNumber, localRowCount, data, csum, totalReportSum);
                            
                            PasteDataToRange(xlsht, data, startCellRowCount);
                            CopyFormatFromRowToRange(excelApp, wb, xlsht, sourceRowNumber, startTargetRowNumber, endTargetRowNumber, startTargetColumnNumber, endTargetColumnNumber);
                            
                            if (maxSumStartColumnNumber != 0)
                            {
                                dynamic st = null;
                                dynamic en = null;
                                dynamic lastRowRange = null;
                                try
                                {
                                    st = xlsht.Cells[endCellRowCount - 2, 1];
                                    en = xlsht.Cells[endCellRowCount - 2, endTargetColumnNumber];
                                    lastRowRange = xlsht.Range(st, en);
                                    lastRowRange.Font.Bold = true;
                                    ReleaseObject(lastRowRange);

                                    st = xlsht.Cells[endCellRowCount - 1, 1];
                                    en = xlsht.Cells[endCellRowCount - 1, endTargetColumnNumber];
                                    lastRowRange = xlsht.Range(st, en);
                                    lastRowRange.Font.Bold = true;
                                }
                                finally
                                {
                                    ReleaseObject(st);
                                    ReleaseObject(en);
                                    ReleaseObject(lastRowRange);
                                }
                            }
                        }
                        localRowCount++;
                     }
                }
                
                // Save and Close
                // SheetName variable here contains the *Output File Path* passed from ReportController
                wb.SaveAs(SheetName);
            }
            catch (Exception ex)
            {
                Log.Info("Error in WriteReportInExcel: " + ex.ToString());
                throw;
            }
            finally
            {
                if (xlsht != null) ReleaseObject(xlsht);
                if (wb != null)
                {
                    try { wb.Close(false); } catch { }
                    ReleaseObject(wb);
                }
                if (excelApp != null)
                {
                    try { excelApp.Quit(); } catch { }
                    ReleaseObject(excelApp);
                }
                
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }

        public static void writeSumInExcel(
            DataTable dataTablevalue,
            JArray sumArray,
            string SelectedReportCatagory,
            string SelectedReport,
            DateTime AvailableFrom,
            DateTime AvailableTo,
            string connectionString,
            string viewReportPath)
        {
            Type excelType = Type.GetTypeFromProgID("Excel.Application");
            if (excelType == null) return;
            
            dynamic excelApp = Activator.CreateInstance(excelType);
            dynamic workbook = null;
            dynamic worksheet = null;

            try
            {
                excelApp.Visible = false;
                excelApp.DisplayAlerts = false;
                
                // Open existing report to write sums
                workbook = excelApp.Workbooks.Open(viewReportPath);
                worksheet = workbook.Sheets[1];

                if (sumArray == null)
                {
                    Log.Info("Sum array not found.");
                    return;
                }

                foreach (var item in sumArray)
                {
                    string query = item["query"]?.ToString();

                    if (!int.TryParse(item["dataRow"]?.ToString(), out int dataRow) ||
                        !int.TryParse(item["dataColumn"]?.ToString(), out int dataColumn))
                    {
                        Log.Info("Invalid row/column definition, skipping item.");
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(query)) continue;

                    if (dataTablevalue == null ||
                        dataTablevalue.Rows.Count == 0 ||
                        dataTablevalue.Columns.Count == 0)
                    {
                        continue;
                    }

                    try
                    {
                         worksheet.Cells[dataRow, dataColumn].Value2 = dataTablevalue.Rows[0][0]?.ToString();
                    }
                    catch (Exception ex)
                    {
                        Log.Info($"Error setting cell [{dataRow},{dataColumn}]: {ex.Message}");
                    }
                }

                workbook.Save();
            }
            catch (Exception ex)
            {
                Log.Info($"Unexpected error in writeSumInExcel: {ex}");
                throw;
            }
            finally
            {
                if (worksheet != null) ReleaseObject(worksheet);
                if (workbook != null)
                {
                    try { workbook.Close(true); } catch { } // Close and Save? Already saved.
                    ReleaseObject(workbook);
                }
                 if (excelApp != null)
                {
                    try { excelApp.Quit(); } catch { }
                    ReleaseObject(excelApp);
                }
                GC.Collect();
            }
        }
    }
}
