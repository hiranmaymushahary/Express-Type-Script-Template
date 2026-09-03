import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors/app.error";



export const genericErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.log(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}