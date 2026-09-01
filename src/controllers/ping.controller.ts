import { Request, Response } from "express";

export const pingHandler = (req:Request, res:Response)=>{
    
    console.log("request body",req.body);
    console.log("request query params",req.query);
    console.log("request url params",req.params);
    res.send("pong");

}

