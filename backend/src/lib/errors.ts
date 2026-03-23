export type AppError = Error & {
  statusCode: number;
  details?: unknown;
};

function buildError(statusCode: number, name: string, message: string, details?: unknown) {
  const error = new Error(message) as AppError;
  error.name = name;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

export function badRequest(message: string, details?: unknown) {
  return buildError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Anda harus login terlebih dahulu.") {
  return buildError(401, "UNAUTHORIZED", message);
}

export function forbidden(message: string) {
  return buildError(403, "FORBIDDEN", message);
}

export function notFound(message: string) {
  return buildError(404, "NOT_FOUND", message);
}

export function conflict(message: string) {
  return buildError(409, "CONFLICT", message);
}
