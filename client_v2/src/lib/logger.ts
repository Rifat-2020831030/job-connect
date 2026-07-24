import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const isBrowser = typeof window !== "undefined";

export const logger = pino({
  level: isProduction ? "silent" : "debug",
  browser: {
    asObject: true,
  },
  transport:
    !isProduction && !isBrowser
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export default logger;
