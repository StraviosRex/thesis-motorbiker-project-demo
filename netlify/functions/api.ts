import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Build a ready promise so the handler waits for routes to be registered
// before processing any request (avoids top-level await which CJS doesn't support)
const ready = registerRoutes(app);

const serverlessHandler = serverless(app);

export const handler: serverless.Handler = async (event, context) => {
  await ready;
  return serverlessHandler(event, context);
};
