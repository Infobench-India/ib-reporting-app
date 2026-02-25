const cron = require('node-cron');
const axios = require('axios');
const path = require('path');
const { getPool } = require('../../utils/db');
const { sendEmail } = require('./emailService');
const logger = require('../../main/common/logger');
const moment = require('moment-timezone');
const { checkActivation } = require('../../utils/activationCheck');

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

        try {
            // Dynamic Activation Check
            const status = await checkActivation();
            if (!status.activated) {
                logger.warn('Scheduler skipped cycle: Server not activated.');
                return;
            }

            isProcessing = true;
            logger.info('Cron heartbeat: Checking for due report schedules...');
            await processSchedules();
        } catch (error) {
            logger.error('Error in scheduler cron job:', error);
        } finally {
            isProcessing = false;
        }
    });
}

const cleanupRunningSchedules = async () => {
    try {
        const p = await getPool();
        const result = await p.query('UPDATE ReportScheduleHistory SET status = @newStatus, errorMessage = @errorMessage WHERE status = @status', {
            status: 'Running',
            newStatus: 'Interrupted',
            errorMessage: 'Service restarted during execution'
        });

        if (result.rowsAffected > 0) {
            logger.info(`Cleaned up ${result.rowsAffected} stuck 'Running' schedules.`);
        }
    } catch (error) {
        logger.error('Error in cleanupRunningSchedules:', error);
    }
};

const processSchedules = async () => {
    try {
        const p = await getPool();

        // Find active schedules where nextExecution is null or <= current time
        // AND there is no current 'Running' execution in history
        const schedulesRes = await p.query(`
            SELECT s.*, r.category, r.name as reportName, r.query as sqlQuery, r.connectionString as reportConn, r.tableName, r.templateName,
                   r.maxRowPerPage, r.maxAvailableRowPerPage, r.sumStartColumnNumber, r.maxSumStartColumnNumber,
                   r.reportHeaderBlankRowCount, r.reportHeaderStartRowNo, r.reportHeaderRowCount,
                   r.tableHeaderStartRowNo, r.tableHeaderRowCount, r.reportDateRow, r.reportDateColumn,
                   r.fromDateRow, r.fromDateColumn, r.toDateRow, r.toDateColumn, r.footerRowCount,
                   r.isGraphSupported, r.isTabularSupported
            FROM ReportSchedules s
            JOIN ReportConfigs r ON s.reportId = r.id
            WHERE s.status = 'Active' 
            AND (s.nextExecution IS NULL OR s.nextExecution <= ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'})
            AND NOT EXISTS (
                SELECT 1 FROM ReportScheduleHistory h 
                WHERE h.scheduleId = s.id AND h.status = 'Running'
            )
        `);

        logger.info(`Found ${schedulesRes.rows.length} schedules due for execution.`);
        if (schedulesRes.rows.length > 0) {
            logger.info(`Due schedules: ${schedulesRes.rows.map(s => s.name).join(', ')}`);
        }

        for (const schedule of schedulesRes.rows) {
            await executeSchedule(schedule);
        }
    } catch (error) {
        logger.error('Error in processSchedules:', error);
    }
};

const executeSchedule = async (schedule) => {
    const p = await getPool();
    let historyId;

    try {
        logger.info(`Executing schedule: ${schedule.name} for report: ${schedule.reportName}`);

        // 1. Create history record (Running)
        const histRes = await p.executeInsert(
            'ReportScheduleHistory',
            'scheduleId, status, executionTime',
            '@scheduleId, @status, @executionTime',
            {
                scheduleId: schedule.id,
                status: 'Running',
                executionTime: new Date()
            }
        );
        historyId = histRes.rows[0].id;

        // 2. Fetch Data from SQL
        const fromDateStr = moment(schedule.startDateTime).format('YYYY-MM-DD');
        const toDateStr = moment(schedule.endDateTime).format('YYYY-MM-DD');

        let query = schedule.sqlQuery;
        query = query.replace(/\$_FROM_DATE_\$/g, fromDateStr);
        query = query.replace(/\$_TO_DATE_\$/g, toDateStr);
        query = query.replace(/\$_TABLE_NAME_\$/g, schedule.tableName);

        const dataPool = await getPool(schedule.reportConn);
        const dataRes = await dataPool.query(query);
        const tableData = dataRes.rows;

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
        await p.query('UPDATE ReportScheduleHistory SET status = @status, attachment = @attachment, fileName = @fileName WHERE id = @id', {
            id: historyId,
            status: 'Success',
            attachment: attachmentBuffer,
            fileName: fileName
        });

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
        const [hour, minute] = (schedule.scheduleTime || '00:00').split(':').map(Number);
        let nextExecution = moment().add(1, 'days').hour(hour).minute(minute).second(0).toDate();

        await p.query(`
            UPDATE ReportSchedules 
            SET startDateTime = @startDateTime, endDateTime = @endDateTime, nextExecution = @nextExecution, 
                updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} 
            WHERE id = @id
        `, {
            id: schedule.id,
            startDateTime: nextStart,
            endDateTime: nextEnd,
            nextExecution: nextExecution
        });

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
            await p.query('UPDATE ReportScheduleHistory SET status = @status, errorMessage = @errorMessage WHERE id = @id', {
                id: historyId,
                status: 'Failure',
                errorMessage: errorMsg
            });
        }
    }
};

module.exports = {
    initScheduler
};

module.exports = {
    initScheduler
};
