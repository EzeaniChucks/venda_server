// middlewares/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Get the first error message
    const firstError = errors.array()[0];

    // Create a more specific message based on the error
    let errorMessage = "Validation error";

    if (firstError.msg) {
      errorMessage = firstError.msg;
    } else if (firstError.type === "field") {
      // Extract field name and add context
      const fieldName = firstError.path || (firstError as any).param;
      errorMessage = `Invalid value for ${fieldName}`;
    }

    return res.status(400).json({
      success: false,
      message: errorMessage,
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? err.path || (err as any).param : err.type,
        message: err.msg,
        location: (err as any).location,
      })),
    });
  }

  next();
};
