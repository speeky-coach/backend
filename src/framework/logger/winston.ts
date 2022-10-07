import winston, { transports, format } from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  input: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  input: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const logger = winston.createLogger({
  levels,
  defaultMeta: { application: process.env.APP_NAME },
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.colorize({ all: true }),
        format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
    }),
  ],
});

export default logger;
