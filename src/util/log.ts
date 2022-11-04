import winston from "winston";
import { format } from "winston";

export const createLogger = (name: string) => {
  const logger = winston.createLogger({
    level: "info",
    format: format.json(),
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "log.log" }),
      new winston.transports.Console({
        format: format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.align(),
          winston.format.printf(
            (info) =>
              `${info.timestamp} [${name}/${info.level}]: ${info.message}`
          )
        ),
        level: process.env.NODE_ENV === "production" ? "error" : "debug",
      }),
    ],
  });
  return logger;
};
