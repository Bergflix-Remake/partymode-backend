// Setup a winston logger
import winston from 'winston';
export default winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level} ${info.service}: ${info.message}`,
        ),
      ),
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    }),
  ],
});