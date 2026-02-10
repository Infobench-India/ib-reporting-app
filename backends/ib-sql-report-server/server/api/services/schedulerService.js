const cron = require('node-cron');
const axios = require('axios');
const path = require('path');
const { getPool, sql, ensureTables } = require('../../utils/db');
const { sendEmail } = require('./emailService');
const logger = require('../../main/common/logger');
const moment = require('moment-timezone');

const REPORT_API_BASE = process.env.REPORT_WORKER_API || 'http://localhost:5005/api/report';

const initScheduler = async () => {
    // Clean up any stuck 'Running' schedules from previous instance
    await cleanupRunningSchedules();

    // Run every minute
    logger.info('Scheduler service initialized.');
    let isProcessing = false;

    cron.schedule('*/5 * * * *', async () => {
        if (isProcessing) {
            logger.info('Scheduler is already processing schedules. Skipping this cycle.');
            return;
        }

        isProcessing = true;
        try {
            logger.info('Cron heartbeat: Checking for due report schedules...');
            await processSchedules();
        } catch (error) {
            logger.error('Error in scheduler cron job:', error);
        } finally {
            isProcessing = false;
        }
    });
};

const cleanupRunningSchedules = async () => {
    try {
        await ensureTables();
        const pool = await getPool();
        const result = await pool.request()
            .input('status', sql.NVarChar, 'Running')
            .input('newStatus', sql.NVarChar, 'Interrupted')
            .input('errorMessage', sql.NVarChar, 'Service restarted during execution')
            .query('UPDATE ReportScheduleHistory SET status = @newStatus, errorMessage = @errorMessage WHERE status = @status');

        if (result.rowsAffected[0] > 0) {
            logger.info(`Cleaned up ${result.rowsAffected[0]} stuck 'Running' schedules.`);
        }
    } catch (error) {
        logger.error('Error in cleanupRunningSchedules:', error);
    }
};

const processSchedules = async () => {
    try {
        await ensureTables();
        const pool = await getPool();

        // Find active schedules where nextExecution is null or <= current time
        // AND there is no current 'Running' execution in history
        const schedulesRes = await pool.request().query(`
            SELECT s.*, r.category, r.name as reportName, r.query as sqlQuery, r.connectionString as reportConn, r.tableName, r.templateName,
                   r.maxRowPerPage, r.maxAvailableRowPerPage, r.sumStartColumnNumber, r.maxSumStartColumnNumber,
                   r.reportHeaderBlankRowCount, r.reportHeaderStartRowNo, r.reportHeaderRowCount,
                   r.tableHeaderStartRowNo, r.tableHeaderRowCount, r.reportDateRow, r.reportDateColumn,
                   r.fromDateRow, r.fromDateColumn, r.toDateRow, r.toDateColumn, r.footerRowCount,
                   r.isGraphSupported, r.isTabularSupported
            FROM ReportSchedules s
            JOIN ReportConfigs r ON s.reportId = r.id
            WHERE s.status = 'Active' 
            AND (s.nextExecution IS NULL OR s.nextExecution <= GETDATE())
            AND NOT EXISTS (
                SELECT 1 FROM ReportScheduleHistory h 
                WHERE h.scheduleId = s.id AND h.status = 'Running'
            )
        `);

        logger.info(`Found ${schedulesRes.recordset.length} schedules due for execution.`);
        if (schedulesRes.recordset.length > 0) {
            logger.info(`Due schedules: ${schedulesRes.recordset.map(s => s.name).join(', ')}`);
        }

        for (const schedule of schedulesRes.recordset) {
            await executeSchedule(schedule);
        }
    } catch (error) {
        logger.error('Error in processSchedules:', error);
    }
};

const executeSchedule = async (schedule) => {
    const pool = await getPool();
    let historyId;

    try {
        logger.info(`Executing schedule: ${schedule.name} for report: ${schedule.reportName}`);

        // 1. Create history record (Pending)
        const histRes = await pool.request()
            .input('scheduleId', sql.Int, schedule.id)
            .input('status', sql.NVarChar, 'Running')
            .input('executionTime', sql.DateTime, new Date())
            .query('INSERT INTO ReportScheduleHistory (scheduleId, status, executionTime) OUTPUT INSERTED.id VALUES (@scheduleId, @status, @executionTime)');
        historyId = histRes.recordset[0].id;

        // 2. Fetch Data from SQL
        const fromDateStr = moment(schedule.startDateTime).format('YYYY-MM-DD');
        const toDateStr = moment(schedule.endDateTime).format('YYYY-MM-DD');

        let query = schedule.sqlQuery;
        query = query.replace(/\$_FROM_DATE_\$/g, fromDateStr);
        query = query.replace(/\$_TO_DATE_\$/g, toDateStr);
        query = query.replace(/\$_TABLE_NAME_\$/g, schedule.tableName);

        const dataPool = await getPool(schedule.reportConn);
        const dataRes = await dataPool.request().query(query);
        const tableData = dataRes.recordset;

        if (tableData.length === 0) {
            logger.warn(`No data found for schedule ${schedule.name}`);
        }

        // Convert to array of arrays for reporting API
        const rows = [];
        if (tableData && tableData.length > 0) {
            const columns = Object.keys(tableData[0]);
            rows.push(columns);
            tableData.forEach(row => {
                rows.push(columns.map(col => (row[col] === null || row[col] === undefined) ? '' : String(row[col])));
            });
        } else {
            // If no data, send at least headers if possible or a message
            logger.warn(`No data found for schedule ${schedule.name}, sending empty report structure.`);
            rows.push(['No Data Found']);
            rows.push(['No records match the specified criteria.']);
        }

        // 3. Prepare Payload
        // Normalize template path (handle possible over-escaping in DB)
        const templatePath = (schedule.templateName || '').split('\\\\').join('\\');

        const payload = {
            TemplatePath: templatePath,
            SheetName: 'Report',
            FromDate: fromDateStr,
            ToDate: toDateStr,
            maxRowPerPage: String(schedule.maxRowPerPage || 0),
            maxAvailableRowPerPage: String(schedule.maxAvailableRowPerPage || 0),
            sumStartColumnNumber: Number(schedule.sumStartColumnNumber || 0),
            maxSumStartColumnNumber: Number(schedule.maxSumStartColumnNumber || 0),
            reportHeaderBlankRowCount: Number(schedule.reportHeaderBlankRowCount || 0),
            reportHeaderStartRowNo: Number(schedule.reportHeaderStartRowNo || 0),
            reportHeaderRowCount: Number(schedule.reportHeaderRowCount || 0),
            tableHeaderStartRowNo: Number(schedule.tableHeaderStartRowNo || 0),
            tableHeaderRowCount: Number(schedule.tableHeaderRowCount || 0),
            reportDateRow: Number(schedule.reportDateRow || 0),
            reportDateColumn: Number(schedule.reportDateColumn || 0),
            fromDateRow: Number(schedule.fromDateRow || 0),
            fromDateColumn: Number(schedule.fromDateColumn || 0),
            toDateRow: Number(schedule.toDateRow || 0),
            toDateColumn: Number(schedule.toDateColumn || 0),
            footerRowCount: Number(schedule.footerRowCount || 0),
            isGraphSupported: Boolean(schedule.isGraphSupported),
            isTabularSupported: Boolean(schedule.isTabularSupported),
            data: rows
        };

        // Log payload structure (excluding data for brevity)
        const { data: _, ...payloadMeta } = payload;
        logger.info(`Calling reporting API with metadata: ${JSON.stringify(payloadMeta)}`);

        // 4. Call Reporting API
        const response = await axios({
            method: 'POST',
            url: `${REPORT_API_BASE}/pdf`,
            headers: { 'Content-Type': 'application/json' },
            data: payload,
            responseType: 'stream',
            timeout: 1800000 // 30 minutes timeout
        });

        const chunks = [];
        for await (const chunk of response.data) {
            chunks.push(chunk);
        }
        const attachmentBuffer = Buffer.concat(chunks);
        const fileName = `${schedule.reportName}_${moment().format('YYYYMMDD_HHmmss')}.pdf`;

        // 5. Update History with Attachment
        await pool.request()
            .input('id', sql.Int, historyId)
            .input('status', sql.NVarChar, 'Success')
            .input('attachment', sql.VarBinary(sql.MAX), attachmentBuffer)
            .input('fileName', sql.NVarChar, fileName)
            .query('UPDATE ReportScheduleHistory SET status = @status, attachment = @attachment, fileName = @fileName WHERE id = @id');

        // 6. Send Email
        await sendEmail({
            to: schedule.recipients,
            subject: `Automated Report: ${schedule.name}`,
            text: `Please find the attached report for ${schedule.reportName} for the period ${fromDateStr} to ${toDateStr}.`,
            attachments: [{ filename: fileName, content: attachmentBuffer }]
        });

        // 7. Shift Dates to Next Day
        const nextStart = moment(schedule.startDateTime).add(1, 'days').toDate();
        const nextEnd = moment(schedule.endDateTime).add(1, 'days').toDate();

        // Calculate next execution date
        const [hour, minute] = schedule.scheduleTime.split(':').map(Number);
        let nextExecution = moment().add(1, 'days').hour(hour).minute(minute).second(0).toDate();

        await pool.request()
            .input('id', sql.Int, schedule.id)
            .input('startDateTime', sql.DateTime, nextStart)
            .input('endDateTime', sql.DateTime, nextEnd)
            .input('nextExecution', sql.DateTime, nextExecution)
            .query('UPDATE ReportSchedules SET startDateTime = @startDateTime, endDateTime = @endDateTime, nextExecution = @nextExecution, updatedAt = GETDATE() WHERE id = @id');

        logger.info(`Successfully completed schedule: ${schedule.name}`);

    } catch (error) {
        if (error.response && error.response.data && error.response.status >= 400) {
            try {
                // If responseType is stream, error.response.data is a stream
                const chunks = [];
                for await (const chunk of error.response.data) {
                    chunks.push(chunk);
                }
                const errorBody = Buffer.concat(chunks).toString();
                logger.error(`Reporting API Error (Status ${error.response.status}): ${errorBody}`);
            } catch (streamError) {
                logger.error('Failed to read error response stream:', streamError);
            }
        }

        const errorMsg = error.response ? `${error.message} (Status: ${error.response.status})` : error.message;
        logger.error(`Error executing schedule ${schedule.name}: ${errorMsg}`);

        if (historyId) {
            await pool.request()
                .input('id', sql.Int, historyId)
                .input('status', sql.NVarChar, 'Failure')
                .input('errorMessage', sql.NVarChar, errorMsg)
                .query('UPDATE ReportScheduleHistory SET status = @status, errorMessage = @errorMessage WHERE id = @id');
        }
    }
};

module.exports = {
    initScheduler
};
