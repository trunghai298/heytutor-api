import winston from "winston";

export const LogClient = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
  exitOnError: false,
});

LogClient.stream = {
  write: (message: string) => LogClient.info(message.trim()),
} as any;
