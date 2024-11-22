// // logger.js
// import { createLogger, format, transports } from 'winston';
// const { combine, timestamp, printf } = format;

// // Custom log format
// const customFormat = printf(({ level, message, timestamp }) => {
//   return `${timestamp} [${level.toUpperCase()}]: ${message}`;
// });

// // Create the logger
// const logger = createLogger({
//   level: 'info', // You can set log levels (error, warn, info, http, verbose, debug, silly)
//   format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
//   transports: [
//     // Log to console
//     new transports.Console(),
//     // Log to a file
//     new transports.File({ filename: 'logs/app.log' }),
//   ],
// });

// export default logger;

// for deployment
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(), // Log to the console
  ],
});

export default logger;
