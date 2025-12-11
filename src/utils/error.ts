// utils/error.ts
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errors?: any[];
  
    constructor(
      message: string,
      statusCode: number = 500,
      isOperational: boolean = true,
      errors?: any[]
    ) {
      super(message);
      
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      this.errors = errors;
      
      // Ensure proper prototype chain for instanceof checks
      Object.setPrototypeOf(this, AppError.prototype);
      
      // Capture stack trace (optional, for better debugging)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AppError);
      }
    }
  
    // Factory methods for common errors
    static badRequest(message: string = 'Bad Request', errors?: any[]) {
      return new AppError(message, 400, true, errors);
    }
  
    static unauthorized(message: string = 'Unauthorized') {
      return new AppError(message, 401);
    }
  
    static forbidden(message: string = 'Forbidden') {
      return new AppError(message, 403);
    }
  
    static notFound(message: string = 'Resource not found') {
      return new AppError(message, 404);
    }
  
    static conflict(message: string = 'Conflict') {
      return new AppError(message, 409);
    }
  
    static validationFailed(errors: any[]) {
      return new AppError('Validation failed', 400, true, errors);
    }
  
    static internalServerError(message: string = 'Internal server error') {
      return new AppError(message, 500);
    }
  
    static serviceUnavailable(message: string = 'Service temporarily unavailable') {
      return new AppError(message, 503);
    }
  
    // Convenience method to serialize error for API response
    toJSON() {
      return {
        success: false,
        message: this.message,
        statusCode: this.statusCode,
        errors: this.errors,
        ...(process.env.NODE_ENV === 'development' && {
          stack: this.stack,
          isOperational: this.isOperational,
        }),
      };
    }
  }