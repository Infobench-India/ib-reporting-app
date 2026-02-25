const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');
const moment = require('moment');

/**
 * SCHEDULE OPERATIONS
 */
exports.createSchedule = async (req, res) => {
    try {
        const p = await getPool();
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
            const [hour, minute] = (data.scheduleTime || '00:00').split(':').map(Number);
            nextExecution = moment().hour(hour).minute(minute).second(0);

            // If the time has already passed today, schedule for tomorrow
            if (nextExecution.isBefore(moment())) {
                nextExecution.add(1, 'days');
            }
        }

        const params = {
            reportId: data.reportId,
            name: data.name,
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            scheduleTime: data.scheduleTime,
            recipients: data.recipients,
            status: data.status || 'Active',
            nextExecution: nextExecution.toDate()
        };

        const result = await p.executeInsert(
            'ReportSchedules',
            'reportId, name, startDateTime, endDateTime, scheduleTime, recipients, status, nextExecution',
            '@reportId, @name, @startDateTime, @endDateTime, @scheduleTime, @recipients, @status, @nextExecution',
            params
        );

        return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error creating schedule:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.listSchedules = async (req, res) => {
    try {
        const p = await getPool();
        const result = await p.query(`
            SELECT s.*, r.name as reportName 
            FROM ReportSchedules s
            JOIN ReportConfigs r ON s.reportId = r.id
        `);
        return res.json({ success: true, data: result.rows });
    } catch (error) {
        logger.error('Error listing schedules:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.getScheduleById = async (req, res) => {
    try {
        const p = await getPool();
        const result = await p.query('SELECT * FROM ReportSchedules WHERE id = @id', { id: req.params.id });

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, errors: ['Schedule not found'] });
        }
        return res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        logger.error('Error getting schedule:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const p = await getPool();
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
        const currentRes = await p.query('SELECT scheduleTime, nextExecution FROM ReportSchedules WHERE id = @id', { id: req.params.id });
        if (currentRes.rows.length === 0) {
            return res.status(404).json({ success: false, errors: ['Schedule not found'] });
        }

        let nextExecution = currentRes.rows[0].nextExecution;

        if (data.nextExecution && data.nextExecution !== "") {
            nextExecution = moment(data.nextExecution).toDate();
        } else if (currentRes.rows[0].scheduleTime !== data.scheduleTime) {
            const [hour, minute] = (data.scheduleTime || '00:00').split(':').map(Number);
            nextExecution = moment().hour(hour).minute(minute).second(0);
            if (nextExecution.isBefore(moment())) {
                nextExecution.add(1, 'days');
            }
            nextExecution = nextExecution.toDate();
        }

        const params = {
            id: req.params.id,
            reportId: data.reportId,
            name: data.name,
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            scheduleTime: data.scheduleTime,
            recipients: data.recipients,
            status: data.status,
            nextExecution: nextExecution
        };

        await p.query(`
            UPDATE ReportSchedules SET 
                reportId = @reportId, name = @name, startDateTime = @startDateTime, 
                endDateTime = @endDateTime, scheduleTime = @scheduleTime, 
                recipients = @recipients, status = @status, nextExecution = @nextExecution, 
                updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'}
            WHERE id = @id
        `, params);
        return res.json({ success: true, message: 'Schedule updated successfully' });
    } catch (error) {
        logger.error('Error updating schedule:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const p = await getPool();
        await p.query('DELETE FROM ReportSchedules WHERE id = @id', { id: req.params.id });
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
        const p = await getPool();
        const { scheduleId, page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = '';
        const params = {};

        if (scheduleId) {
            whereClause = ' WHERE h.scheduleId = @scheduleId';
            params.scheduleId = scheduleId;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM ReportScheduleHistory h JOIN ReportSchedules s ON h.scheduleId = s.id ${whereClause}`;
        const countResult = await p.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Get paginated data
        const dataQuery = `
            SELECT h.*, s.name as scheduleName 
            FROM ReportScheduleHistory h 
            JOIN ReportSchedules s ON h.scheduleId = s.id 
            ${whereClause} 
            ORDER BY h.executionTime DESC
            ${p.getPaginationSnippet(offset, parseInt(limit))}
        `;

        const result = await p.query(dataQuery, params);

        return res.json({
            success: true,
            data: result.rows,
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
        const p = await getPool();
        const result = await p.query('SELECT attachment, fileName FROM ReportScheduleHistory WHERE id = @id', { id: req.params.id });

        if (result.rows.length === 0 || !result.rows[0].attachment) {
            return res.status(404).json({ success: false, errors: ['Attachment not found'] });
        }

        const { attachment, fileName } = result.rows[0];
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
        const p = await getPool();
        const historyId = req.params.id;

        const historyRes = await p.query(`
                SELECT h.*, s.recipients, s.name as scheduleName 
                FROM ReportScheduleHistory h 
                JOIN ReportSchedules s ON h.scheduleId = s.id 
                WHERE h.id = @id
            `, { id: historyId });

        if (historyRes.rows.length === 0) {
            return res.status(404).json({ success: false, errors: ['History record not found'] });
        }

        const history = historyRes.rows[0];
        const { attachment, fileName, recipients, scheduleName } = history;

        // Trigger email (re-using notification logic)
        const { sendEmail } = require('../services/emailService');
        await sendEmail({
            to: recipients,
            subject: `Resend: Report for ${scheduleName}`,
            text: `Please find the attached report for ${scheduleName} executed on ${new Date(history.executionTime).toLocaleString()}.`,
            attachments: [{ filename: fileName, content: attachment }]
        });

        return res.json({ success: true, message: 'Report resent successfully' });
    } catch (error) {
        logger.error('Error resending report:', error);
        return res.status(500).json({ success: false, errors: [error.message] });
    }
};
