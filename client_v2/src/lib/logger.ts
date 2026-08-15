import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "silent" : "debug",
  browser: {
    asObject: true,
  },
});

export default logger;
