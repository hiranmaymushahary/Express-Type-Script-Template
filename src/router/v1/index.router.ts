import { pingHandler } from "../../controllers/ping.controller";
import express from "express";

const v1Router = express.Router();

v1Router.get("/ping", pingHandler);


export default v1Router