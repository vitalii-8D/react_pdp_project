import winston from 'winston';

const prettyPrint = process.env.LOG_PRETTY_PRINT === 'true';
const logLevel = process.env.LOG_LEVEL ?? 'debug';

export const createLogger = (context = 'Logger') => {
  const transportFormat = prettyPrint ? winston.format.prettyPrint({ colorize: true }) : winston.format.json();

  return winston.createLogger({
    format: winston.format.combine(
      winston.format.errors({ stack: true }),
      winston.format.timestamp(),
      winston.format((info) => ({ ...info, context }))(),
    ),
    level: logLevel,
    transports: [
      new winston.transports.Console({
        format: transportFormat,
      }),
    ],
  });
};
