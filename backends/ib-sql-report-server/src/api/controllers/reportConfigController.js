const { getPool, ensureTables, ensureReportTable } = require('../../utils/db');
const logger = require('../../main/common/logger');

/**
 * REPORT CONFIG OPERATIONS
 */
exports.createReport = async (req, res) => {
    try {
        const data = req.body;


        const p = await getPool(data.connectionString);
        await ensureTables(data.connectionString);

        // --- License Limits Check ---
        const license = req.license || {};
        const features = license.features || {};

        // 1. Max Reports Check
        if (features.numberOfReports) {
            const countResult = await p.query('SELECT COUNT(*) as count FROM ReportConfigs');
            const currentCount = countResult.rows[0].count;
            if (currentCount >= features.numberOfReports) {
                return res.status(403).json({
                    success: false,
                    errors: [`License Limit Exceeded: You have reached the maximum allowed reports (${features.numberOfReports}). Please upgrade your license.`]
                });
            }
        }

        // 2. Max Charts Per Report Check
        if (features.numberOfChartsPerReport && data.charts && data.charts.length > features.numberOfChartsPerReport) {
            return res.status(403).json({
                success: false,
                errors: [`License Limit Exceeded: Maximum allowed charts per report is ${features.numberOfChartsPerReport}. Your configuration has ${data.charts.length}.`]
            });
        }
        // ----------------------------

        const result = await p.executeInsert(
            'ReportConfigs',
            `category, name, tableName, templateName, ${p.escapeIdentifier('columns')}, connectionString, ${p.escapeIdentifier('query')},
            maxRowPerPage, maxAvailableRowPerPage, sumStartColumnNumber, maxSumStartColumnNumber,
            reportHeaderBlankRowCount, reportHeaderStartRowNo, reportHeaderRowCount,
            tableHeaderStartRowNo, tableHeaderRowCount, reportDateRow, reportDateColumn,
            fromDateRow, fromDateColumn, toDateRow, toDateColumn, footerRowCount,
            isGraphSupported, isTabularSupported`,
            `@category, @name, @tableName, @templateName, @columns, @connectionString, @query,
            @maxRowPerPage, @maxAvailableRowPerPage, @sumStartColumnNumber, @maxSumStartColumnNumber,
            @reportHeaderBlankRowCount, @reportHeaderStartRowNo, @reportHeaderRowCount,
            @tableHeaderStartRowNo, @tableHeaderRowCount, @reportDateRow, @reportDateColumn,
            @fromDateRow, @fromDateColumn, @toDateRow, @toDateColumn, @footerRowCount,
            @isGraphSupported, @isTabularSupported`,
            {
                category: data.category,
                name: data.name,
                tableName: data.tableName,
                templateName: data.templateName,
                columns: data.columns,
                connectionString: data.connectionString,
                query: data.query,
                maxRowPerPage: data.maxRowPerPage,
                maxAvailableRowPerPage: data.maxAvailableRowPerPage,
                sumStartColumnNumber: data.sumStartColumnNumber,
                maxSumStartColumnNumber: data.maxSumStartColumnNumber,
                reportHeaderBlankRowCount: data.reportHeaderBlankRowCount,
                reportHeaderStartRowNo: data.reportHeaderStartRowNo,
                reportHeaderRowCount: data.reportHeaderRowCount,
                tableHeaderStartRowNo: data.tableHeaderStartRowNo,
                tableHeaderRowCount: data.tableHeaderRowCount,
                reportDateRow: data.reportDateRow,
                reportDateColumn: data.reportDateColumn,
                fromDateRow: data.fromDateRow,
                fromDateColumn: data.fromDateColumn,
                toDateRow: data.toDateRow,
                toDateColumn: data.toDateColumn,
                footerRowCount: data.footerRowCount,
                isGraphSupported: data.isGraphSupported,
                isTabularSupported: data.isTabularSupported
            }
        );

        const newReport = result.rows[0];

        // Process Sum Items
        if (data.sum && data.sum.length > 0) {
            for (const item of data.sum) {
                await p.query(
                    'INSERT INTO ReportSumItems (reportId, query, dataRow, dataColumn) VALUES (@reportId, @query, @dataRow, @dataColumn)',
                    {
                        reportId: newReport.id,
                        query: item.query,
                        dataRow: item.dataRow,
                        dataColumn: item.dataColumn
                    }
                );
            }
            newReport.sum = data.sum;
        }

        // Process Chart configurations
        if (data.charts && data.charts.length > 0) {
            for (const chart of data.charts) {
                await p.query(
                    `INSERT INTO ReportCharts (reportId, chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel) 
                     VALUES (@reportId, @chartType, @chartTitle, @xAxisColumn, @yAxisColumns, @xAxisLabel, @yAxisLabel)`,
                    {
                        reportId: newReport.id,
                        chartType: chart.chartType,
                        chartTitle: chart.chartTitle,
                        xAxisColumn: chart.xAxisColumn,
                        yAxisColumns: chart.yAxisColumns,
                        xAxisLabel: chart.xAxisLabel,
                        yAxisLabel: chart.yAxisLabel
                    }
                );
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
        const p = await getPool();
        const { category, search } = req.query;

        let query = 'SELECT * FROM ReportConfigs';
        const params = {};

        if (category || search) {
            query += ' WHERE 1=1';
            if (category) {
                query += ' AND category = @category';
                params.category = category;
            }
            if (search) {
                query += ' AND (name LIKE @search OR category LIKE @search OR tableName LIKE @search)';
                params.search = `%${search}%`;
            }
        }

        const result = await p.query(query, params);
        const reports = result.rows;

        // Fetch sum and chart items for each report
        for (const report of reports) {
            const sumResult = await p.query(
                'SELECT query, dataRow, dataColumn FROM ReportSumItems WHERE reportId = @reportId',
                { reportId: report.id }
            );
            report.sum = sumResult.rows;

            const chartResult = await p.query(
                'SELECT chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel FROM ReportCharts WHERE reportId = @reportId',
                { reportId: report.id }
            );
            report.charts = chartResult.rows;
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
        const p = await getPool();
        const result = await p.query(
            'SELECT * FROM ReportConfigs WHERE id = @id',
            { id: req.params.id }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, errors: ['Report not found'] });
        }

        const report = result.rows[0];
        const sumResult = await p.query(
            'SELECT query, dataRow, dataColumn FROM ReportSumItems WHERE reportId = @reportId',
            { reportId: report.id }
        );
        report.sum = sumResult.rows;

        const chartResult = await p.query(
            'SELECT chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel FROM ReportCharts WHERE reportId = @reportId',
            { reportId: report.id }
        );
        report.charts = chartResult.rows;

        return res.json({ success: true, data: report });
    } catch (error) {
        logger.error('Error getting report by id:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.updateReport = async (req, res) => {
    try {
        await ensureTables();
        const p = await getPool();
        const data = req.body;
        const id = req.params.id;

        // --- License Limits Check ---
        const license = req.license || {};
        const features = license.features || {};

        if (features.numberOfChartsPerReport && data.charts && data.charts.length > features.numberOfChartsPerReport) {
            return res.status(403).json({
                success: false,
                errors: [`License Limit Exceeded: Maximum allowed charts per report is ${features.numberOfChartsPerReport}. Your configuration has ${data.charts.length}.`]
            });
        }
        // ----------------------------

        await p.query(
            `UPDATE ReportConfigs SET 
                category = @category, name = @name, tableName = @tableName, templateName = @templateName, 
                ${p.escapeIdentifier('columns')} = @columns, connectionString = @connectionString, ${p.escapeIdentifier('query')} = @query,
                maxRowPerPage = @maxRowPerPage, maxAvailableRowPerPage = @maxAvailableRowPerPage, 
                sumStartColumnNumber = @sumStartColumnNumber, maxSumStartColumnNumber = @maxSumStartColumnNumber,
                reportHeaderBlankRowCount = @reportHeaderBlankRowCount, reportHeaderStartRowNo = @reportHeaderStartRowNo, 
                reportHeaderRowCount = @reportHeaderRowCount, tableHeaderStartRowNo = @tableHeaderStartRowNo, 
                tableHeaderRowCount = @tableHeaderRowCount, reportDateRow = @reportDateRow, 
                reportDateColumn = @reportDateColumn, fromDateRow = @fromDateRow, 
                fromDateColumn = @fromDateColumn, toDateRow = @toDateRow, toDateColumn = @toDateColumn, 
                footerRowCount = @footerRowCount, isGraphSupported = @isGraphSupported, 
                isTabularSupported = @isTabularSupported, updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'}
            WHERE id = @id`,
            {
                id,
                category: data.category,
                name: data.name,
                tableName: data.tableName,
                templateName: data.templateName,
                columns: data.columns,
                connectionString: data.connectionString,
                query: data.query,
                maxRowPerPage: data.maxRowPerPage,
                maxAvailableRowPerPage: data.maxAvailableRowPerPage,
                sumStartColumnNumber: data.sumStartColumnNumber,
                maxSumStartColumnNumber: data.maxSumStartColumnNumber,
                reportHeaderBlankRowCount: data.reportHeaderBlankRowCount,
                reportHeaderStartRowNo: data.reportHeaderStartRowNo,
                reportHeaderRowCount: data.reportHeaderRowCount,
                tableHeaderStartRowNo: data.tableHeaderStartRowNo,
                tableHeaderRowCount: data.tableHeaderRowCount,
                reportDateRow: data.reportDateRow,
                reportDateColumn: data.reportDateColumn,
                fromDateRow: data.fromDateRow,
                fromDateColumn: data.fromDateColumn,
                toDateRow: data.toDateRow,
                toDateColumn: data.toDateColumn,
                footerRowCount: data.footerRowCount,
                isGraphSupported: data.isGraphSupported,
                isTabularSupported: data.isTabularSupported
            }
        );

        // Update Sum Items - Clear and re-insert
        await p.query('DELETE FROM ReportSumItems WHERE reportId = @reportId', { reportId: id });
        if (data.sum && data.sum.length > 0) {
            for (const item of data.sum) {
                await p.query(
                    'INSERT INTO ReportSumItems (reportId, query, dataRow, dataColumn) VALUES (@reportId, @query, @dataRow, @dataColumn)',
                    {
                        reportId: id,
                        query: item.query,
                        dataRow: item.dataRow,
                        dataColumn: item.dataColumn
                    }
                );
            }
        }

        // Update Charts - Clear and re-insert
        await p.query('DELETE FROM ReportCharts WHERE reportId = @reportId', { reportId: id });
        if (data.charts && data.charts.length > 0) {
            for (const chart of data.charts) {
                await p.query(
                    `INSERT INTO ReportCharts (reportId, chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel) 
                     VALUES (@reportId, @chartType, @chartTitle, @xAxisColumn, @yAxisColumns, @xAxisLabel, @yAxisLabel)`,
                    {
                        reportId: id,
                        chartType: chart.chartType,
                        chartTitle: chart.chartTitle,
                        xAxisColumn: chart.xAxisColumn,
                        yAxisColumns: chart.yAxisColumns,
                        xAxisLabel: chart.xAxisLabel,
                        yAxisLabel: chart.yAxisLabel
                    }
                );
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
        const p = await getPool();
        await p.query('DELETE FROM ReportConfigs WHERE id = @id', { id: req.params.id });

        return res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        logger.error('Error deleting report:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.getSettings = async (req, res) => {
    try {
        await ensureTables();
        const p = await getPool();
        const topOne = p.type === 'mssql' ? 'SELECT TOP 1 *' : 'SELECT *';
        const limitOne = p.type === 'postgres' ? 'LIMIT 1' : '';
        let result = await p.query(`${topOne} FROM ReportSettings ${limitOne}`);

        if (result.rows.length === 0) {
            await p.query("INSERT INTO ReportSettings (exportFolder) VALUES ('')");
            result = await p.query(`${topOne} FROM ReportSettings ${limitOne}`);
        }

        const settings = result.rows[0];
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
        const p = await getPool(data.connections?.ConnectionString);
        const topOne = p.type === 'mssql' ? 'SELECT TOP 1 id' : 'SELECT id';
        const limitOne = p.type === 'postgres' ? 'LIMIT 1' : '';
        const result = await p.query(`${topOne} FROM ReportSettings ${limitOne}`);
        const id = result.rows.length > 0 ? result.rows[0].id : null;

        const params = {
            exportFolder: data.exportFolder || '',
            ConnectionString: data.connections?.ConnectionString || '',
            ConnectionString1: data.connections?.ConnectionString1 || '',
            ConnectionString2: data.connections?.ConnectionString2 || '',
            AlarmReportConnectionString: data.connections?.AlarmReportConnectionString || ''
        };

        if (id) {
            params.id = id;
            await p.query(`
                UPDATE ReportSettings SET 
                    exportFolder = @exportFolder, ConnectionString = @ConnectionString, 
                    ConnectionString1 = @ConnectionString1, ConnectionString2 = @ConnectionString2, 
                    AlarmReportConnectionString = @AlarmReportConnectionString
                WHERE id = @id
            `, params);
        } else {
            await p.query(`
                INSERT INTO ReportSettings (exportFolder, ConnectionString, ConnectionString1, ConnectionString2, AlarmReportConnectionString)
                VALUES (@exportFolder, @ConnectionString, @ConnectionString1, @ConnectionString2, @AlarmReportConnectionString)
            `, params);
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

        const p = await getPool(Connection.ConnectionString);
        await ensureTables(Connection.ConnectionString);

        const topOne = p.type === 'mssql' ? 'SELECT TOP 1 id' : 'SELECT id';
        const limitOne = p.type === 'postgres' ? 'LIMIT 1' : '';

        // 1. Update Settings
        if (Connection || ExportFolder) {
            const currentRes = await p.query(`${topOne} FROM ReportSettings ${limitOne}`);
            const settId = currentRes.rows.length > 0 ? currentRes.rows[0].id : null;

            const params = {
                exportFolder: ExportFolder || '',
                ConnectionString: Connection?.ConnectionString || '',
                ConnectionString1: Connection?.ConnectionString1 || '',
                ConnectionString2: Connection?.ConnectionString2 || '',
                AlarmReportConnectionString: Connection?.AlarmReportConnectionString || ''
            };

            if (settId) {
                params.id = settId;
                await p.query('UPDATE ReportSettings SET exportFolder = @exportFolder, ConnectionString = @ConnectionString, ConnectionString1 = @ConnectionString1, ConnectionString2 = @ConnectionString2, AlarmReportConnectionString = @AlarmReportConnectionString WHERE id = @id', params);
            } else {
                await p.query('INSERT INTO ReportSettings (exportFolder, ConnectionString, ConnectionString1, ConnectionString2, AlarmReportConnectionString) VALUES (@exportFolder, @ConnectionString, @ConnectionString1, @ConnectionString2, @AlarmReportConnectionString)', params);
            }
        }

        // 2. Process Reports
        if (Reports) {
            for (const cat in Reports) {
                for (const name in Reports[cat]) {
                    const r = Reports[cat][name];
                    // Upsert by name
                    const check = await p.query('SELECT id FROM ReportConfigs WHERE name = @name', { name });
                    const rid = check.rows.length > 0 ? check.rows[0].id : null;

                    const rParams = {
                        category: cat,
                        name: name,
                        tableName: r.tableName,
                        templateName: r.templateName,
                        columns: r.columns || '',
                        connectionString: r.connectionString,
                        query: r.query,
                        maxRowPerPage: r.maxRowPerPage || 0,
                        maxAvailableRowPerPage: r.maxAvailableRowPerPage || 0,
                        sumStartColumnNumber: r.sumStartColumnNumber || 0,
                        maxSumStartColumnNumber: r.maxSumStartColumnNumber || 0,
                        reportHeaderBlankRowCount: r.reportHeaderBlankRowCount || 0,
                        reportHeaderStartRowNo: r.reportHeaderStartRowNo || 0,
                        reportHeaderRowCount: r.reportHeaderRowCount || 0,
                        tableHeaderStartRowNo: r.tableHeaderStartRowNo || 0,
                        tableHeaderRowCount: r.tableHeaderRowCount || 0,
                        reportDateRow: r.reportDateRow || 0,
                        reportDateColumn: r.reportDateColumn || 0,
                        fromDateRow: r.fromDateRow || 0,
                        fromDateColumn: r.fromDateColumn || 0,
                        toDateRow: r.toDateRow || 0,
                        toDateColumn: r.toDateColumn || 0,
                        footerRowCount: r.footerRowCount || 0,
                        isGraphSupported: r.isGraphSupported ? 1 : 0,
                        isTabularSupported: r.isTabularSupported ? 1 : 0
                    };

                    let finalRid;
                    if (rid) {
                        rParams.id = rid;
                        await p.query(`
                            UPDATE ReportConfigs SET 
                                category = @category, tableName = @tableName, templateName = @templateName, 
                                ${p.escapeIdentifier('columns')} = @columns, connectionString = @connectionString, ${p.escapeIdentifier('query')} = @query,
                                maxRowPerPage = @maxRowPerPage, maxAvailableRowPerPage = @maxAvailableRowPerPage, 
                                sumStartColumnNumber = @sumStartColumnNumber, maxSumStartColumnNumber = @maxSumStartColumnNumber,
                                reportHeaderBlankRowCount = @reportHeaderBlankRowCount, reportHeaderStartRowNo = @reportHeaderStartRowNo, 
                                reportHeaderRowCount = @reportHeaderRowCount, tableHeaderStartRowNo = @tableHeaderStartRowNo, 
                                tableHeaderRowCount = @tableHeaderRowCount, reportDateRow = @reportDateRow, 
                                reportDateColumn = @reportDateColumn, fromDateRow = @fromDateRow, 
                                fromDateColumn = @fromDateColumn, toDateRow = @toDateRow, toDateColumn = @toDateColumn, 
                                footerRowCount = @footerRowCount, isGraphSupported = @isGraphSupported, 
                                isTabularSupported = @isTabularSupported, updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'}
                            WHERE id = @id
                        `, rParams);
                        finalRid = rid;
                    } else {
                        const insRes = await p.executeInsert(
                            'ReportConfigs',
                            `category, name, tableName, templateName, ${p.escapeIdentifier('columns')}, connectionString, ${p.escapeIdentifier('query')},
                            maxRowPerPage, maxAvailableRowPerPage, sumStartColumnNumber, maxSumStartColumnNumber,
                            reportHeaderBlankRowCount, reportHeaderStartRowNo, reportHeaderRowCount,
                            tableHeaderStartRowNo, tableHeaderRowCount, reportDateRow, reportDateColumn,
                            fromDateRow, fromDateColumn, toDateRow, toDateColumn, footerRowCount,
                            isGraphSupported, isTabularSupported`,
                            `@category, @name, @tableName, @templateName, @columns, @connectionString, @query,
                            @maxRowPerPage, @maxAvailableRowPerPage, @sumStartColumnNumber, @maxSumStartColumnNumber,
                            @reportHeaderBlankRowCount, @reportHeaderStartRowNo, @reportHeaderRowCount,
                            @tableHeaderStartRowNo, @tableHeaderRowCount, @reportDateRow, @reportDateColumn,
                            @fromDateRow, @fromDateColumn, @toDateRow, @toDateColumn, @footerRowCount,
                            @isGraphSupported, @isTabularSupported`,
                            rParams
                        );
                        finalRid = insRes.rows[0].id;
                    }

                    // 4. Process Sums and Charts for this report
                    await p.query('DELETE FROM ReportSumItems WHERE reportId = @reportId', { reportId: finalRid });
                    if (r.sum && r.sum.length > 0) {
                        for (const sItem of r.sum) {
                            await p.query(
                                'INSERT INTO ReportSumItems (reportId, query, dataRow, dataColumn) VALUES (@reportId, @query, @dataRow, @dataColumn)',
                                {
                                    reportId: finalRid,
                                    query: sItem.query,
                                    dataRow: sItem.dataRow,
                                    dataColumn: sItem.dataColumn
                                }
                            );
                        }
                    }

                    await p.query('DELETE FROM ReportCharts WHERE reportId = @reportId', { reportId: finalRid });
                    if (r.charts && r.charts.length > 0) {
                        for (const chart of r.charts) {
                            await p.query(
                                `INSERT INTO ReportCharts (reportId, chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel) 
                                 VALUES (@reportId, @chartType, @chartTitle, @xAxisColumn, @yAxisColumns, @xAxisLabel, @yAxisLabel)`,
                                {
                                    reportId: finalRid,
                                    chartType: chart.chartType,
                                    chartTitle: chart.chartTitle,
                                    xAxisColumn: chart.xAxisColumn,
                                    yAxisColumns: chart.yAxisColumns,
                                    xAxisLabel: chart.xAxisLabel,
                                    yAxisLabel: chart.yAxisLabel
                                }
                            );
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

/**
 * TEST CONNECTIVITY
 */
exports.testConnection = async (req, res) => {
    try {
        const { connectionString } = req.body;
        if (!connectionString) {
            return res.status(400).json({ success: false, errors: ['Connection string is required'] });
        }

        const p = await getPool(connectionString);
        // Try a simple query to verify permissions
        await p.query('SELECT 1 as connected');

        return res.json({ success: true, message: 'Connection successful!' });
    } catch (error) {
        logger.error('Test connection failed:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.testQuery = async (req, res) => {
    try {
        const { connectionString, query } = req.body;
        if (!connectionString || !query) {
            return res.status(400).json({ success: false, errors: ['Connection string and query are required'] });
        }

        const p = await getPool(connectionString);
        // Standardize test query wrapper
        const testSql = p.type === 'mssql'
            ? `${query}`
            : `${query}`;

        const result = await p.query(testSql);

        return res.json({
            success: true,
            message: 'Query is valid!',
            columns: result.rows.length > 0 ? Object.keys(result.rows[0]) : []
        });
    } catch (error) {
        logger.error('Test query failed:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};
