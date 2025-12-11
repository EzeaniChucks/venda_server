// middlewares/asyncHandler.ts
import { AuthRequest } from "@/types";
import { Request, Response, NextFunction } from "express";

export const asyncHandler =
  (fn: Function) => (req: AuthRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
