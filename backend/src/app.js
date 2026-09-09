import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import env from './config/env.js';
import routes from "./routes/index.js";

import {
  notFound,
  errorHandler,
} from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(
  helmet()
);

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(
  morgan("dev")
);

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use(
  cookieParser()
);

app.use(
  "/api/v1",
  routes
);
app.use(
  "/api/v1/auth",
  authRoutes
);


app.use(
  notFound
);

app.use(
  errorHandler
);

export default app;