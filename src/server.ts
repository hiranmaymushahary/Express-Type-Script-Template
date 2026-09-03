import express from "express";
import { serverConfig} from "./config";
import v1Router from "./router/v1/index.router";
import v2Router from "./router/v2/index.router";
import { genericErrorHandler } from './middleware/error.middleware';
import logger from "./config/logger.config";


 

const app = express();

//Registering all the routers and their corresponding routes with our app server object.

app.use(express.json());



app.use("/api/v1" , v1Router );
app.use("api/v2", v2Router);

/**
 * Add the error handler middleware
 */


app.use(genericErrorHandler);

app.listen(serverConfig.PORT, () => {
  logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
  logger.info("press ctrl + c to stop the server.");
});

 