const { getPool, ensureTables, ensureReportTable } = require('../../utils/db');
const sql = require('mssql/msnodesqlv8');
const logger = require('../../main/common/logger');

exports.getConfigs = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const result = await pool.request().query('SELECT category, name FROM ReportConfigs');
        const configs = result.recordset;

        // Fetch charts for each config
        for (const config of configs) {
            const chartResult = await pool.request()
                .input('name', sql.NVarChar, config.name)
                .query(`SELECT rc.chartType, rc.chartTitle, rc.xAxisColumn, rc.yAxisColumns, rc.xAxisLabel, rc.yAxisLabel 
                        FROM ReportCharts rc 
                        JOIN ReportConfigs rcf ON rc.reportId = rcf.id 
                        WHERE rcf.name = @name`);
            config.charts = chartResult.recordset;
        }

        res.json({ success: true, data: configs });
    } catch (error) {
        logger.error('Error fetching configs:', error);
        res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.executeReport = async (req, res) => {
    const { category, reportName, fromDate, toDate, page = 1, limit = 20 } = req.body;

    try {
        const pool = await getPool();
        const configResult = await pool.request()
            .input('category', sql.NVarChar, category)
            .input('name', sql.NVarChar, reportName)
            .query('SELECT * FROM ReportConfigs WHERE category = @category AND name = @name');

        if (configResult.recordset.length === 0) {
            return res.status(404).json({ success: false, errors: ['Report configuration not found'] });
        }

        const config = configResult.recordset[0];

        let query = config.query;
        query = query.replace(/\$_FROM_DATE_\$/g, fromDate);
        query = query.replace(/\$_TO_DATE_\$/g, toDate);
        query = query.replace(/\$_TABLE_NAME_\$/g, config.tableName);

        const offset = (page - 1) * limit;
        let paginatedQuery = query;
        if (!query.toLowerCase().includes('offset')) {
            paginatedQuery = `${query} OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
        }

        const fromIndex = query.toLowerCase().indexOf('from');
        const orderByIndex = query.toLowerCase().lastIndexOf('order by');
        const countBase = query.substring(fromIndex, orderByIndex !== -1 ? orderByIndex : query.length);
        const countQuery = `SELECT COUNT(*) as total ${countBase}`;

        const dataPool = await getPool(config.connectionString);
        console.log("SQL Query and Connection", query, config.connectionString)
        const [result, countResult] = await Promise.all([
            dataPool.request().query(paginatedQuery),
            dataPool.request().query(countQuery)
        ]);

        const totalItems = countResult.recordset[0].total;

        // Fetch chart config for this report
        const chartsResult = await pool.request()
            .input('reportId', sql.Int, config.id)
            .query('SELECT chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel FROM ReportCharts WHERE reportId = @reportId');

        res.json({
            success: true,
            data: result.recordset,
            charts: chartsResult.recordset,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                itemsPerPage: limit
            }
        });

    } catch (error) {
        logger.error('SQL Execution Error:', error);
        res.status(500).json({ success: false, errors: [error.message] });
    }
};
