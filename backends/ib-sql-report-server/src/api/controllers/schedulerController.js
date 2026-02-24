const { getPool, sql, ensureTables } = require('../../utils/db');
const logger = require('../../main/common/logger');
const moment = require('moment');

/**
 * SCHEDULE OPERATIONS
 */
exports.createSchedule = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const data = req.body;

        // --- License Limits Check ---
        const license = req.license || {};
        const features = license.features || {};

        if (features.autoEmail && features.numberOfEmails && data.recipients) {
            const recipientCount = data.recipients.split(',').map(e => e.trim()).filter(e => e).length;
            if (recipientCount > features.numberOfEmails) {
                return res.status(403).json({
                    success: false,
                    errors: [`License Limit Exceeded: Your license allows a maximum of ${features.numberOfEmails} recipients per schedule. Current: ${recipientCount}.`]
                });
            }
        }
        // ----------------------------

        // Calculate initial next execution
        let nextExecution;
        if (data.nextExecution && data.nextExecution !== "") {
            nextExecution = moment(data.nextExecution);
        } else {
            const [hour, minute] = data.scheduleTime.split(':').map(Number);
            nextExecution = moment().hour(hour).minute(minute).second(0);

            // If the time has already passed today, schedule for tomorrow
            if (nextExecution.isBefore(moment())) {
                nextExecution.add(1, 'days');
            }
        }

        const result = await pool.request()
            .input('reportId', sql.Int, data.reportId)
            .input('name', sql.NVarChar, data.name)
            .input('startDateTime', sql.DateTime, data.startDateTime)
            .input('endDateTime', sql.DateTime, data.endDateTime)
            .input('scheduleTime', sql.NVarChar, data.scheduleTime)
            .input('recipients', sql.NVarChar, data.recipients)
            .input('status', sql.NVarChar, data.status || 'Active')
            .input('nextExecution', sql.DateTime, nextExecution.toDate())
            .query(`
                INSERT INTO ReportSchedules (reportId, name, startDateTime, endDateTime, scheduleTime, recipients, status, nextExecution)
                OUTPUT INSERTED.*
                VALUES (@reportId, @name, @startDateTime, @endDateTime, @scheduleTime, @recipients, @status, @nextExecution)
            `);

        return res.status(201).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        logger.error('Error creating schedule:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.listSchedules = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT s.*, r.name as reportName 
            FROM ReportSchedules s
            JOIN ReportConfigs r ON s.reportId = r.id
        `);
        return res.json({ success: true, data: result.recordset });
    } catch (error) {
        logger.error('Error listing schedules:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.getScheduleById = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM ReportSchedules WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, errors: ['Schedule not found'] });
        }
        return res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        logger.error('Error getting schedule:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const data = req.body;

        // --- License Limits Check ---
        const license = req.license || {};
        const features = license.features || {};

        if (features.autoEmail && features.numberOfEmails && data.recipients) {
            const recipientCount = data.recipients.split(',').map(e => e.trim()).filter(e => e).length;
            if (recipientCount > features.numberOfEmails) {
                return res.status(403).json({
                    success: false,
                    errors: [`License Limit Exceeded: Your license allows a maximum of ${features.numberOfEmails} recipients per schedule. Current: ${recipientCount}.`]
                });
            }
        }
        // ----------------------------

        // Fetch current schedule to check if time changed
        const currentRes = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT scheduleTime, nextExecution FROM ReportSchedules WHERE id = @id');

        let nextExecution = currentRes.recordset[0].nextExecution;

        if (data.nextExecution && data.nextExecution !== "") {
            nextExecution = moment(data.nextExecution).toDate();
        } else if (currentRes.recordset.length > 0 && currentRes.recordset[0].scheduleTime !== data.scheduleTime) {
            const [hour, minute] = data.scheduleTime.split(':').map(Number);
            nextExecution = moment().hour(hour).minute(minute).second(0);
            if (nextExecution.isBefore(moment())) {
                nextExecution.add(1, 'days');
            }
            nextExecution = nextExecution.toDate();
        }

        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('reportId', sql.Int, data.reportId)
            .input('name', sql.NVarChar, data.name)
            .input('startDateTime', sql.DateTime, data.startDateTime)
            .input('endDateTime', sql.DateTime, data.endDateTime)
            .input('scheduleTime', sql.NVarChar, data.scheduleTime)
            .input('recipients', sql.NVarChar, data.recipients)
            .input('status', sql.NVarChar, data.status)
            .input('nextExecution', sql.DateTime, nextExecution)
            .query(`
                UPDATE ReportSchedules SET 
                    reportId = @reportId, name = @name, startDateTime = @startDateTime, 
                    endDateTime = @endDateTime, scheduleTime = @scheduleTime, 
                    recipients = @recipients, status = @status, nextExecution = @nextExecution, 
                    updatedAt = GETDATE()
                WHERE id = @id
            `);
        return res.json({ success: true, message: 'Schedule updated successfully' });
    } catch (error) {
        logger.error('Error updating schedule:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM ReportSchedules WHERE id = @id');
        return res.json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        logger.error('Error deleting schedule:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

/**
 * HISTORY OPERATIONS
 */
exports.listHistory = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const { scheduleId, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'FROM ReportScheduleHistory h JOIN ReportSchedules s ON h.scheduleId = s.id';
        const request = pool.request();

        if (scheduleId) {
            query += ' WHERE h.scheduleId = @scheduleId';
            request.input('scheduleId', sql.Int, scheduleId);
        }

        // Get total count
        const countResult = await request.query(`SELECT COUNT(*) as total ${query}`);
        const total = countResult.recordset[0].total;

        // Get paginated data
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, parseInt(limit));

        const dataQuery = `
            SELECT h.*, s.name as scheduleName 
            ${query} 
            ORDER BY h.executionTime DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        const result = await request.query(dataQuery);

        return res.json({
            success: true,
            data: result.recordset,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        logger.error('Error listing history:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.downloadAttachment = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT attachment, fileName FROM ReportScheduleHistory WHERE id = @id');

        if (result.recordset.length === 0 || !result.recordset[0].attachment) {
            return res.status(404).json({ success: false, errors: ['Attachment not found'] });
        }

        const { attachment, fileName } = result.recordset[0];
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', fileName.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.send(attachment);
    } catch (error) {
        logger.error('Error downloading attachment:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.resendReport = async (req, res) => {
    try {
        await ensureTables();
        const pool = await getPool();
        const historyId = req.params.id;

        const historyRes = await pool.request()
            .input('id', sql.Int, historyId)
            .query(`
                SELECT h.*, s.recipients, s.name as scheduleName 
                FROM ReportScheduleHistory h 
                JOIN ReportSchedules s ON h.scheduleId = s.id 
                WHERE h.id = @id
            `);

        if (historyRes.recordset.length === 0) {
            return res.status(404).json({ success: false, errors: ['History record not found'] });
        }

        const history = historyRes.recordset[0];
        const { attachment, fileName, recipients, scheduleName } = history;

        // Trigger email (re-using notification logic)
        const { sendEmail } = require('../services/emailService');
        await sendEmail({
            to: recipients,
            subject: `Resend: Report for ${scheduleName}`,
            text: `Please find the attached report for ${scheduleName} executed on ${history.executionTime.toLocaleString()}.`,
            attachments: [{ filename: fileName, content: attachment }]
        });

        return res.json({ success: true, message: 'Report resent successfully' });
    } catch (error) {
        logger.error('Error resending report:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};
