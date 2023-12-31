import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncErrorHandler = (handler: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (err) {
            next(err);
        }
    };
};
