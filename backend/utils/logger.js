const format = (level, message, meta = {}) => {
  return JSON.stringify({
    level,
    message,
    time: new Date().toISOString(),
    ...meta,
  });
};

const logger = {
  info: (msg, meta) => console.log(format("INFO", msg, meta)),
  error: (msg, meta) => console.error(format("ERROR", msg, meta)),
  warn: (msg, meta) => console.warn(format("WARN", msg, meta)),
};

export default logger;
