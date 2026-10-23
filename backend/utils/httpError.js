// Thrown by services for expected failures. `body` is sent to the client as-is.
class HttpError extends Error {
  constructor(status, body) {
    super(typeof body === "string" ? body : body?.error || body?.message);
    this.status = status;
    this.body = typeof body === "string" ? { error: body } : body;
  }
}

// Shared controller catch-block: expected errors keep their status/body,
// anything else is logged and answered with `fallbackBody` (500).
const sendError = (res, error, logLabel, fallbackBody) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json(error.body);
  }
  if (logLabel) console.error(logLabel, error);
  else console.error(error);
  return res.status(500).json(fallbackBody);
};

module.exports = { HttpError, sendError };
