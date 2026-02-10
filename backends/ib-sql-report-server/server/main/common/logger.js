const winston = require('winston');
const moment = require('moment-timezone');
require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const transport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'sql-report-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
});

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => moment().format('YYYY-MM-DD HH:mm:ss.SSS')
        }),
        winston.format.json()
    ),
    transports: [
        transport,
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

module.exports = logger;
