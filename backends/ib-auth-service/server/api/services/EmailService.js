
const logger = require('../../main/common/logger');
const { sendEmail } = require('./sendEmailService');

class EmailService {
    static async sendPasswordResetEmail(email, token) {
        // In a real app, you'd use a real SMTP config
        // For now, we'll log it and use a mock/test account if possible
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${token}`;

        logger.info(`Sending password reset email to ${email}`);
        logger.info(`Reset URL: ${resetUrl}`);

        // Mocking email sending
        if (process.env.NODE_ENV === 'test') {
            return true;
        }

        try {
            await sendEmail({
                to: email,
                subject: "Password Reset Request",
                text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`,
                html: `<b>You requested a password reset</b><p>Please click the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`
            })

            return true;
        } catch (error) {
            logger.error('Failed to send email:', error);
            return false;
        }
    }
}

module.exports = EmailService;
