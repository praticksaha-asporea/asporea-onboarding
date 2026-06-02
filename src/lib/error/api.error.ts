export class ApiError<
  T extends object = Record<string, unknown>,
> extends Error {
  statusCode: number;
  data: T;

  constructor(message: string, statusCode: number = 500, data?: T) {
    super(message);
    this.statusCode = statusCode;
    this.data = (data ?? {}) as T; // Ensures default is {}
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}
