import { NextFunction, Request, Response } from 'express';

// asyncHandler wraps controllers so you do not need try/catch blocks
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
