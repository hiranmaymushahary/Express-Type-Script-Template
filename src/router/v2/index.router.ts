import { pingHandler } from "../../controllers/ping.controller";
import express from "express";

const v2Router = express.Router();

v2Router.get("/ping", pingHandler);


export default v2Router

 