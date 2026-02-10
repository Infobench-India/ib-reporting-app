const nodemailer = require('nodemailer');
const logger = require('../../main/common/logger');

async function sendEmail({ to, subject, text, attachments }) {
    try {
        const smtpUri = process.env.SMTP_CONNECTION_STRING || "";
        let transporterConfig;

        // Priority matching ib-analytics-server/server/services/smtpService.js pattern
        if (process.env.EMAIL_SERVICE === 'gmail') {
            logger.info('Using Gmail service');
            transporterConfig = {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            };
        } else if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
            logger.info(`Using SMTP host: ${process.env.EMAIL_HOST}`);
            transporterConfig = {
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            };
        } else if (smtpUri) {
            const redactedUri = smtpUri.replace(/:([^@]+)@/, ':****@');
            logger.info(`Using SMTP_CONNECTION_STRING: ${redactedUri}`);
            transporterConfig = smtpUri;
        } else {
            throw new Error("No Email configuration found. Provide EMAIL_HOST/USER/PASS or SMTP_CONNECTION_STRING.");
        }
        logger.info(`transporterConfig ${transporterConfig}`)
        const transporter = nodemailer.createTransport(transporterConfig);

        // Verify connection configuration
        try {
            await transporter.verify();
            logger.info('SMTP connection verified successfully');
        } catch (err) {
            logger.error('SMTP connection verification failed', {
                error: err.message,
                host: typeof transporterConfig === 'string' ? 'URI patterns' : (transporterConfig.host || transporterConfig.service)
            });
            throw err;
        }

        const mailOptions = {
            // Zoho is strict: from must match authenticated user
            from: process.env.EMAIL_SERVICE === 'gmail' ? process.env.EMAIL_USER : (process.env.EMAIL_FROM || 'no-reply@infobench.in'),
            to: Array.isArray(to) ? to.join(', ') : to,
            subject: subject,
            text: text,
            attachments: attachments
        };


        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error("Error in emailService.sendEmail:", {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        throw error;
    }
}

module.exports = {
    sendEmail
};
