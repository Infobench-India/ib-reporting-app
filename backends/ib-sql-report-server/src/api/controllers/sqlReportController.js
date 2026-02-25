const { getPool, ensureTables, ensureReportTable } = require('../../utils/db');
const logger = require('../../main/common/logger');

exports.getConfigs = async (req, res) => {
    try {
        await ensureTables();
        const p = await getPool();
        const result = await p.query('SELECT category, name FROM ReportConfigs');
        const configs = result.rows;

        // Fetch charts for each config
        for (const config of configs) {
            const chartResult = await p.query(
                `SELECT rc.chartType, rc.chartTitle, rc.xAxisColumn, rc.yAxisColumns, rc.xAxisLabel, rc.yAxisLabel 
                 FROM ReportCharts rc 
                 JOIN ReportConfigs rcf ON rc.reportId = rcf.id 
                 WHERE rcf.name = @name`,
                { name: config.name }
            );
            config.charts = chartResult.rows;
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
        const p = await getPool();
        const configResult = await p.query(
            'SELECT * FROM ReportConfigs WHERE category = @category AND name = @name',
            { category, name: reportName }
        );

        if (configResult.rows.length === 0) {
            return res.status(404).json({ success: false, errors: ['Report configuration not found'] });
        }

        const config = configResult.rows[0];

        let query = config.query;
        query = query.replace(/\$_FROM_DATE_\$/g, fromDate);
        query = query.replace(/\$_TO_DATE_\$/g, toDate);
        query = query.replace(/\$_TABLE_NAME_\$/g, config.tableName);

        const offset = (page - 1) * limit;
        let paginatedQuery = query;
        if (!query.toLowerCase().includes('offset') && !query.toLowerCase().includes('limit')) {
            paginatedQuery = `${query} ${p.getPaginationSnippet(offset, limit)}`;
        }

        const fromIndex = query.toLowerCase().indexOf('from');
        const orderByIndex = query.toLowerCase().lastIndexOf('order by');
        const countBase = query.substring(fromIndex, orderByIndex !== -1 ? orderByIndex : query.length);
        const countQuery = `SELECT COUNT(*) as total ${countBase}`;

        const dataProvider = await getPool(config.connectionString);
        console.log("SQL Query and Connection", query, config.connectionString)
        const [result, countResult] = await Promise.all([
            dataProvider.query(paginatedQuery),
            dataProvider.query(countQuery)
        ]);

        const totalItems = countResult.rows[0].total;

        // Fetch chart config for this report
        const chartsResult = await p.query(
            'SELECT chartType, chartTitle, xAxisColumn, yAxisColumns, xAxisLabel, yAxisLabel FROM ReportCharts WHERE reportId = @reportId',
            { reportId: config.id }
        );

        res.json({
            success: true,
            data: result.rows,
            charts: chartsResult.rows,
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
