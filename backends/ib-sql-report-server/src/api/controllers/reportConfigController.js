const { getPool, ensureTables, ensureReportTable, sql } = require('../../utils/db');
const logger = require('../../main/common/logger');

/**
 * REPORT CONFIG OPERATIONS
 */
exports.createReport = async (req, res) => {
    try {
        const data = req.body;


        const pool = await getPool(data.connectionString);
        await ensureTables(data.connectionString);
        const result = await pool.request()
            .input('category', sql.NVarChar, data.category)
            .input('name', sql.NVarChar, data.name)
            .input('tableName', sql.NVarChar, data.tableName)
            .input('templateName', sql.NVarChar, data.templateName)
            .input('columns', sql.NVarChar, data.columns)
            .input('connectionString', sql.NVarChar, data.connectionString)
            .input('query', sql.NVarChar, data.query)
            .input('maxRowPerPage', sql.Int, data.maxRowPerPage)
            .input('maxAvailableRowPerPage', sql.Int, data.maxAvailableRowPerPage)
            .input('sumStartColumnNumber', sql.Int, data.sumStartColumnNumber)
            .input('maxSumStartColumnNumber', sql.Int, data.maxSumStartColumnNumber)
            .input('reportHeaderBlankRowCount', sql.Int, data.reportHeaderBlankRowCount)
            .input('reportHeaderStartRowNo', sql.Int, data.reportHeaderStartRowNo)
            .input('reportHeaderRowCount', sql.Int, data.reportHeaderRowCount)
            .input('tableHeaderStartRowNo', sql.Int, data.tableHeaderStartRowNo)
            .input('tableHeaderRowCount', sql.Int, data.tableHeaderRowCount)
            .input('reportDateRow', sql.Int, data.reportDateRow)
            .input('reportDateColumn', sql.Int, data.reportDateColumn)
            .input('fromDateRow', sql.Int, data.fromDateRow)
            .input('fromDateColumn', sql.Int, data.fromDateColumn)
            .input('toDateRow', sql.Int, data.toDateRow)
            .input('toDateColumn', sql.Int, data.toDateColumn)
            .input('footerRowCount', sql.Int, data.footerRowCount)
            .input('isGraphSupported', sql.Bit, data.isGraphSupported)
            .input('isTabularSupported', sql.Bit, data.isTabularSupported)
            .query(`
                INSERT INTO ReportConfigs (
                    category, name, tableName, templateName, [columns], connectionString, [query],
                    maxRowPerPage, maxAvailableRowPerPage, sumStartColumnNumber, maxSumStartColumnNumber,
                    reportHeaderBlankRowCount, reportHeaderStartRowNo, reportHeaderRowCount,
                    tableHeaderStartRowNo, tableHeaderRowCount, reportDateRow, reportDateColumn,
                    fromDateRow, fromDateColumn, toDateRow, toDateColumn, footerRowCount,
                    isGraphSupported, isTabularSupported
                ) 
                OUTPUT INSERTED.*
                VALUES (
                    @category, @name, @tableName, @templateName, @columns, @connectionString, @query,
                    @maxRowPerPage, @maxAvailableRowPerPage, @sumStartColumnNumber, @maxSumStartColumnNumber,
                    @reportHeaderBlankRowCount, @reportHeaderStartRowNo, @reportHeaderRowCount,
                    @tableHeaderStartRowNo, @tableHeaderRowCount, @reportDateRow, @reportDateColumn,
                    @fromDateRow, @fromDateColumn, @toDateRow, @toDateColumn, @footerRowCount,
                    @isGraphSupported, @isTabularSupported
                )
            `);

        const newReport = result.recordset[0];

        // Process Sum Items
        if (data.sum && data.sum.length > 0) {
            for (const item of data.sum) {
                await pool.request()
                    .input('reportId', sql.Int, newReport.id)
                    .input('query', sql.NVarChar, item.query)
                    .input('dataRow', sql.Int, item.dataRow)
                    .input('dataColumn', sql.Int, item.dataColumn)
                    .query('INSERT INTO ReportSumItems (reportId, query, dataRow, dataColumn) VALUES (@reportId, @query, @dataRow, @dataColumn)');
            }
            newReport.sum = data.sum;
        }

        // Process Chart configurations
        if (data.charts && data.charts.length > 0) {
            for (const chart of data.charts) {
                await pool.request()
                    .input('reportId', sql.Int, newReport.id)
                    .input('chartType', sql.NVarChar, chart.chartType)
                    .input('chartTitle', sql.NVarChar, chart.chartTitle)
                    .input('xAxisColumn', sql.NVarChar, chart.xAxisColumn)
                    .input('yAxisColumns', sql.NVarChar, chart.yAxisColumns)
                    .input('xAxisLabel', sql.NVarChar, chart.xAxisLabel)
                    .input('yAxisLabel', sql.NVarChar, chart.yAxisLabel)
                    .query(`INSERT INTO ReportCharts (reportId, chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel) 
                            VALUES (@reportId, @chartType, @chartTitle, @xAxisColumn, @yAxisColumns, @xAxisLabel, @yAxisLabel)`);
            }
            newReport.charts = data.charts;
        }

        return res.status(201).json({ success: true, data: newReport, message: 'Report created successfully' });
    } catch (error) {
        logger.error('Error creating report:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.listReports = async (req, res) => {
    try {
        console.log('List reports with query:', req.activation);
        await ensureTables();
        const pool = await getPool();
        const { category, search } = req.query;

        let query = 'SELECT * FROM ReportConfigs';
        const request = pool.request();

        if (category || search) {
            query += ' WHERE 1=1';
            if (category) {
                query += ' AND category = @category';
                request.input('category', sql.NVarChar, category);
            }
            if (search) {
                query += ' AND (name LIKE @search OR category LIKE @search OR tableName LIKE @search)';
                request.input('search', sql.NVarChar, `%${search}%`);
            }
        }

        const result = await request.query(query);
        const reports = result.recordset;

        // Fetch sum and chart items for each report
        for (const report of reports) {
            const sumResult = await pool.request()
                .input('reportId', sql.Int, report.id)
                .query('SELECT query, dataRow, dataColumn FROM ReportSumItems WHERE reportId = @reportId');
            report.sum = sumResult.recordset;

            const chartResult = await pool.request()
                .input('reportId', sql.Int, report.id)
                .query('SELECT chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel FROM ReportCharts WHERE reportId = @reportId');
            report.charts = chartResult.recordset;
        }

        return res.json({ success: true, data: reports });
    } catch (error) {
        logger.error('Error listing reports:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.getReportById = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM ReportConfigs WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, errors: ['Report not found'] });
        }

        const report = result.recordset[0];
        const sumResult = await pool.request()
            .input('reportId', sql.Int, report.id)
            .query('SELECT query, dataRow, dataColumn FROM ReportSumItems WHERE reportId = @reportId');
        report.sum = sumResult.recordset;

        const chartResult = await pool.request()
            .input('reportId', sql.Int, report.id)
            .query('SELECT chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel FROM ReportCharts WHERE reportId = @reportId');
        report.charts = chartResult.recordset;

        return res.json({ success: true, data: report });
    } catch (error) {
        logger.error('Error getting report by id:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.updateReport = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const data = req.body;
        const id = req.params.id;

        await pool.request()
            .input('id', sql.Int, id)
            .input('category', sql.NVarChar, data.category)
            .input('name', sql.NVarChar, data.name)
            .input('tableName', sql.NVarChar, data.tableName)
            .input('templateName', sql.NVarChar, data.templateName)
            .input('columns', sql.NVarChar, data.columns)
            .input('connectionString', sql.NVarChar, data.connectionString)
            .input('query', sql.NVarChar, data.query)
            .input('maxRowPerPage', sql.Int, data.maxRowPerPage)
            .input('maxAvailableRowPerPage', sql.Int, data.maxAvailableRowPerPage)
            .input('sumStartColumnNumber', sql.Int, data.sumStartColumnNumber)
            .input('maxSumStartColumnNumber', sql.Int, data.maxSumStartColumnNumber)
            .input('reportHeaderBlankRowCount', sql.Int, data.reportHeaderBlankRowCount)
            .input('reportHeaderStartRowNo', sql.Int, data.reportHeaderStartRowNo)
            .input('reportHeaderRowCount', sql.Int, data.reportHeaderRowCount)
            .input('tableHeaderStartRowNo', sql.Int, data.tableHeaderStartRowNo)
            .input('tableHeaderRowCount', sql.Int, data.tableHeaderRowCount)
            .input('reportDateRow', sql.Int, data.reportDateRow)
            .input('reportDateColumn', sql.Int, data.reportDateColumn)
            .input('fromDateRow', sql.Int, data.fromDateRow)
            .input('fromDateColumn', sql.Int, data.fromDateColumn)
            .input('toDateRow', sql.Int, data.toDateRow)
            .input('toDateColumn', sql.Int, data.toDateColumn)
            .input('footerRowCount', sql.Int, data.footerRowCount)
            .input('isGraphSupported', sql.Bit, data.isGraphSupported)
            .input('isTabularSupported', sql.Bit, data.isTabularSupported)
            .query(`
                UPDATE ReportConfigs SET 
                    category = @category, name = @name, tableName = @tableName, templateName = @templateName, 
                    [columns] = @columns, connectionString = @connectionString, [query] = @query,
                    maxRowPerPage = @maxRowPerPage, maxAvailableRowPerPage = @maxAvailableRowPerPage, 
                    sumStartColumnNumber = @sumStartColumnNumber, maxSumStartColumnNumber = @maxSumStartColumnNumber,
                    reportHeaderBlankRowCount = @reportHeaderBlankRowCount, reportHeaderStartRowNo = @reportHeaderStartRowNo, 
                    reportHeaderRowCount = @reportHeaderRowCount, tableHeaderStartRowNo = @tableHeaderStartRowNo, 
                    tableHeaderRowCount = @tableHeaderRowCount, reportDateRow = @reportDateRow, 
                    reportDateColumn = @reportDateColumn, fromDateRow = @fromDateRow, 
                    fromDateColumn = @fromDateColumn, toDateRow = @toDateRow, toDateColumn = @toDateColumn, 
                    footerRowCount = @footerRowCount, isGraphSupported = @isGraphSupported, 
                    isTabularSupported = @isTabularSupported, updatedAt = GETDATE()
                WHERE id = @id
            `);

        // Update Sum Items - Clear and re-insert
        await pool.request().input('reportId', sql.Int, id).query('DELETE FROM ReportSumItems WHERE reportId = @reportId');
        if (data.sum && data.sum.length > 0) {
            for (const item of data.sum) {
                await pool.request()
                    .input('reportId', sql.Int, id)
                    .input('query', sql.NVarChar, item.query)
                    .input('dataRow', sql.Int, item.dataRow)
                    .input('dataColumn', sql.Int, item.dataColumn)
                    .query('INSERT INTO ReportSumItems (reportId, query, dataRow, dataColumn) VALUES (@reportId, @query, @dataRow, @dataColumn)');
            }
        }

        // Update Charts - Clear and re-insert
        await pool.request().input('reportId', sql.Int, id).query('DELETE FROM ReportCharts WHERE reportId = @reportId');
        if (data.charts && data.charts.length > 0) {
            for (const chart of data.charts) {
                await pool.request()
                    .input('reportId', sql.Int, id)
                    .input('chartType', sql.NVarChar, chart.chartType)
                    .input('chartTitle', sql.NVarChar, chart.chartTitle)
                    .input('xAxisColumn', sql.NVarChar, chart.xAxisColumn)
                    .input('yAxisColumns', sql.NVarChar, chart.yAxisColumns)
                    .input('xAxisLabel', sql.NVarChar, chart.xAxisLabel)
                    .input('yAxisLabel', sql.NVarChar, chart.yAxisLabel)
                    .query(`INSERT INTO ReportCharts (reportId, chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel) 
                            VALUES (@reportId, @chartType, @chartTitle, @xAxisColumn, @yAxisColumns, @xAxisLabel, @yAxisLabel)`);
            }
        }

        return res.json({ success: true, message: 'Report updated successfully' });
    } catch (error) {
        logger.error('Error updating report:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.deleteReport = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM ReportConfigs WHERE id = @id');

        return res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        logger.error('Error deleting report:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

/**
 * REPORT SETTINGS OPERATIONS
 */
exports.getSettings = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        let result = await pool.request().query('SELECT TOP 1 * FROM ReportSettings');

        if (result.recordset.length === 0) {
            await pool.request().query("INSERT INTO ReportSettings (exportFolder) VALUES ('')");
            result = await pool.request().query('SELECT TOP 1 * FROM ReportSettings');
        }

        const settings = result.recordset[0];
        // Format for frontend
        const responseData = {
            id: settings.id,
            exportFolder: settings.exportFolder,
            connections: {
                ConnectionString: settings.ConnectionString,
                ConnectionString1: settings.ConnectionString1,
                ConnectionString2: settings.ConnectionString2,
                AlarmReportConnectionString: settings.AlarmReportConnectionString
            }
        };

        return res.json({ success: true, data: responseData });
    } catch (error) {
        logger.error('Error getting settings:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const data = req.body;

        await ensureTables(data.connections?.ConnectionString);
        const pool = await getPool(data.connections?.ConnectionString);
        const result = await pool.request().query('SELECT TOP 1 id FROM ReportSettings');
        const id = result.recordset.length > 0 ? result.recordset[0].id : null;

        const request = pool.request()
            .input('exportFolder', sql.NVarChar, data.exportFolder)
            .input('ConnectionString', sql.NVarChar, data.connections?.ConnectionString || '')
            .input('ConnectionString1', sql.NVarChar, data.connections?.ConnectionString1 || '')
            .input('ConnectionString2', sql.NVarChar, data.connections?.ConnectionString2 || '')
            .input('AlarmReportConnectionString', sql.NVarChar, data.connections?.AlarmReportConnectionString || '');

        if (id) {
            await request.input('id', sql.Int, id).query(`
                UPDATE ReportSettings SET 
                    exportFolder = @exportFolder, ConnectionString = @ConnectionString, 
                    ConnectionString1 = @ConnectionString1, ConnectionString2 = @ConnectionString2, 
                    AlarmReportConnectionString = @AlarmReportConnectionString
                WHERE id = @id
            `);
        } else {
            await request.query(`
                INSERT INTO ReportSettings (exportFolder, ConnectionString, ConnectionString1, ConnectionString2, AlarmReportConnectionString)
                VALUES (@exportFolder, @ConnectionString, @ConnectionString1, @ConnectionString2, @AlarmReportConnectionString)
            `);
        }

        return res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        logger.error('Error updating settings:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

/**
 * BULK IMPORT
 */
exports.importJson = async (req, res) => {
    try {

        const { Connection, ExportFolder, Reports } = req.body;

        const pool = await getPool(Connection.ConnectionString);
        await ensureTables(Connection.ConnectionString);
        // 1. Update Settings
        if (Connection || ExportFolder) {
            const settingsData = { connections: Connection, exportFolder: ExportFolder };
            // Using internal updateSettings logic or calling it
            // Simple approach: direct SQL
            const currentRes = await pool.request().query('SELECT TOP 1 id FROM ReportSettings');
            const settId = currentRes.recordset.length > 0 ? currentRes.recordset[0].id : null;

            const settReq = pool.request()
                .input('exportFolder', sql.NVarChar, ExportFolder || '')
                .input('ConnectionString', sql.NVarChar, Connection?.ConnectionString || '')
                .input('ConnectionString1', sql.NVarChar, Connection?.ConnectionString1 || '')
                .input('ConnectionString2', sql.NVarChar, Connection?.ConnectionString2 || '')
                .input('AlarmReportConnectionString', sql.NVarChar, Connection?.AlarmReportConnectionString || '');

            if (settId) {
                await settReq.input('id', sql.Int, settId).query('UPDATE ReportSettings SET exportFolder = @exportFolder, ConnectionString = @ConnectionString, ConnectionString1 = @ConnectionString1, ConnectionString2 = @ConnectionString2, AlarmReportConnectionString = @AlarmReportConnectionString WHERE id = @id');
            } else {
                await settReq.query('INSERT INTO ReportSettings (exportFolder, ConnectionString, ConnectionString1, ConnectionString2, AlarmReportConnectionString) VALUES (@exportFolder, @ConnectionString, @ConnectionString1, @ConnectionString2, @AlarmReportConnectionString)');
            }
        }

        // 2. Process Reports
        if (Reports) {
            for (const cat in Reports) {
                for (const name in Reports[cat]) {
                    const r = Reports[cat][name];
                    // Upsert by name
                    const check = await pool.request().input('name', sql.NVarChar, name).query('SELECT id FROM ReportConfigs WHERE name = @name');
                    const rid = check.recordset.length > 0 ? check.recordset[0].id : null;

                    const rReq = pool.request()
                        .input('category', sql.NVarChar, cat)
                        .input('name', sql.NVarChar, name)
                        .input('tableName', sql.NVarChar, r.tableName)
                        .input('templateName', sql.NVarChar, r.templateName)
                        .input('columns', sql.NVarChar, r.columns || '')
                        .input('connectionString', sql.NVarChar, r.connectionString)
                        .input('query', sql.NVarChar, r.query)
                        .input('maxRowPerPage', sql.Int, r.maxRowPerPage || 0)
                        .input('maxAvailableRowPerPage', sql.Int, r.maxAvailableRowPerPage || 0)
                        .input('sumStartColumnNumber', sql.Int, r.sumStartColumnNumber || 0)
                        .input('maxSumStartColumnNumber', sql.Int, r.maxSumStartColumnNumber || 0)
                        .input('reportHeaderBlankRowCount', sql.Int, r.reportHeaderBlankRowCount || 0)
                        .input('reportHeaderStartRowNo', sql.Int, r.reportHeaderStartRowNo || 0)
                        .input('reportHeaderRowCount', sql.Int, r.reportHeaderRowCount || 0)
                        .input('tableHeaderStartRowNo', sql.Int, r.tableHeaderStartRowNo || 0)
                        .input('tableHeaderRowCount', sql.Int, r.tableHeaderRowCount || 0)
                        .input('reportDateRow', sql.Int, r.reportDateRow || 0)
                        .input('reportDateColumn', sql.Int, r.reportDateColumn || 0)
                        .input('fromDateRow', sql.Int, r.fromDateRow || 0)
                        .input('fromDateColumn', sql.Int, r.fromDateColumn || 0)
                        .input('toDateRow', sql.Int, r.toDateRow || 0)
                        .input('toDateColumn', sql.Int, r.toDateColumn || 0)
                        .input('footerRowCount', sql.Int, r.footerRowCount || 0)
                        .input('isGraphSupported', sql.Bit, r.isGraphSupported ? 1 : 0)
                        .input('isTabularSupported', sql.Bit, r.isTabularSupported ? 1 : 0);

                    let finalRid;
                    if (rid) {
                        await rReq.input('id', sql.Int, rid).query(`
                            UPDATE ReportConfigs SET 
                                category = @category, tableName = @tableName, templateName = @templateName, 
                                [columns] = @columns, connectionString = @connectionString, [query] = @query,
                                maxRowPerPage = @maxRowPerPage, maxAvailableRowPerPage = @maxAvailableRowPerPage, 
                                sumStartColumnNumber = @sumStartColumnNumber, maxSumStartColumnNumber = @maxSumStartColumnNumber,
                                reportHeaderBlankRowCount = @reportHeaderBlankRowCount, reportHeaderStartRowNo = @reportHeaderStartRowNo, 
                                reportHeaderRowCount = @reportHeaderRowCount, tableHeaderStartRowNo = @tableHeaderStartRowNo, 
                                tableHeaderRowCount = @tableHeaderRowCount, reportDateRow = @reportDateRow, 
                                reportDateColumn = @reportDateColumn, fromDateRow = @fromDateRow, 
                                fromDateColumn = @fromDateColumn, toDateRow = @toDateRow, toDateColumn = @toDateColumn, 
                                footerRowCount = @footerRowCount, isGraphSupported = @isGraphSupported, 
                                isTabularSupported = @isTabularSupported, updatedAt = GETDATE()
                            WHERE id = @id
                        `);
                        finalRid = rid;
                    } else {
                        const insRes = await rReq.query(`
                            INSERT INTO ReportConfigs (
                                category, name, tableName, templateName, [columns], connectionString, [query],
                                maxRowPerPage, maxAvailableRowPerPage, sumStartColumnNumber, maxSumStartColumnNumber,
                                reportHeaderBlankRowCount, reportHeaderStartRowNo, reportHeaderRowCount,
                                tableHeaderStartRowNo, tableHeaderRowCount, reportDateRow, reportDateColumn,
                                fromDateRow, fromDateColumn, toDateRow, toDateColumn, footerRowCount,
                                isGraphSupported, isTabularSupported
                            ) 
                            OUTPUT INSERTED.id
                            VALUES (
                                @category, @name, @tableName, @templateName, @columns, @connectionString, @query,
                                @maxRowPerPage, @maxAvailableRowPerPage, @sumStartColumnNumber, @maxSumStartColumnNumber,
                                @reportHeaderBlankRowCount, @reportHeaderStartRowNo, @reportHeaderRowCount,
                                @tableHeaderStartRowNo, @tableHeaderRowCount, @reportDateRow, @reportDateColumn,
                                @fromDateRow, @fromDateColumn, @toDateRow, @toDateColumn, @footerRowCount,
                                @isGraphSupported, @isTabularSupported
                            )
                        `);
                        finalRid = insRes.recordset[0].id;
                    }

                    // 3. Ensure Dynamic Data Table exists in target database
                    const reportPool = await getPool(r.connectionString);
                    // await ensureReportTable(reportPool, r.tableName, r.columns);

                    // 4. Process Sums and Charts for this report
                    await pool.request().input('reportId', sql.Int, finalRid).query('DELETE FROM ReportSumItems WHERE reportId = @reportId');
                    if (r.sum && r.sum.length > 0) {
                        for (const sItem of r.sum) {
                            await pool.request()
                                .input('reportId', sql.Int, finalRid)
                                .input('query', sql.NVarChar, sItem.query)
                                .input('dataRow', sql.Int, sItem.dataRow)
                                .input('dataColumn', sql.Int, sItem.dataColumn)
                                .query('INSERT INTO ReportSumItems (reportId, query, dataRow, dataColumn) VALUES (@reportId, @query, @dataRow, @dataColumn)');
                        }
                    }

                    await pool.request().input('reportId', sql.Int, finalRid).query('DELETE FROM ReportCharts WHERE reportId = @reportId');
                    if (r.charts && r.charts.length > 0) {
                        for (const chart of r.charts) {
                            await pool.request()
                                .input('reportId', sql.Int, finalRid)
                                .input('chartType', sql.NVarChar, chart.chartType)
                                .input('chartTitle', sql.NVarChar, chart.chartTitle)
                                .input('xAxisColumn', sql.NVarChar, chart.xAxisColumn)
                                .input('yAxisColumns', sql.NVarChar, chart.yAxisColumns)
                                .input('xAxisLabel', sql.NVarChar, chart.xAxisLabel)
                                .input('yAxisLabel', sql.NVarChar, chart.yAxisLabel)
                                .query(`INSERT INTO ReportCharts (reportId, chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel) 
                                        VALUES (@reportId, @chartType, @chartTitle, @xAxisColumn, @yAxisColumns, @xAxisLabel, @yAxisLabel)`);
                        }
                    }
                }
            }
        }
        logger.info('Bulk import successful');
        return res.json({ success: true, message: 'Configuration imported successfully' });
    } catch (error) {
        logger.error('Error in bulk import:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};
