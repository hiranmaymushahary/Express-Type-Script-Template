import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

type AnyZodObject = ZodObject<any>;

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
        res.status(400).json({
        message : "Invalid request body",
        success :  false,
        error : error
      });
    }
  };


