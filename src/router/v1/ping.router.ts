import express from "express";
import { validate } from "../../validators";

import { pingHandler } from "../../controllers/ping.controller";
import { pingSchema } from "../../validators/ping.validator";

const pingRouter = express.Router();

pingRouter.get("/", validate(pingSchema),pingHandler);

pingRouter.get("/health",(req,res)=>{
    res.status(200).send("ok");
})

export default pingRouter;