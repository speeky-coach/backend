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
        format.printf((info) => {
          let messageFormat = `${info.timestamp} ${info.level}: ${info.message}`;

          if (info.error) {
            messageFormat += '\n' + info.error.message;

            if (info.error.response) {
              // this is an error thrown by an axios client (HTTP client)
              messageFormat += '\naxios client error';
              messageFormat += '\nstatus code: ' + info.error.response.status;
              messageFormat += '\nmethod: ' + info.error.request.method;
              messageFormat += '\nhost: ' + info.error.request.host;
              messageFormat += '\nurl: ' + info.error.request.path;
              messageFormat += '\ndata: ' + info.error.response.config.data;
              messageFormat += '\nresponse: ' + JSON.stringify(info.error.response.data);
            }

            messageFormat += '\n' + info.error.stack;
          }

          return messageFormat;
        }),
      ),
    }),
  ],
});

export default logger;
