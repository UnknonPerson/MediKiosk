import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import env from './config/env.js';
import routes from "./routes/index.js";
import {notFound, errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import patientRoutes from "./modules/patient/patient.routes.js";
import consultationRoutes from "./modules/consultation/consultation.routes.js";
import intakeRoutes from "./modules/intake/intake.routes.js";
import documentRoutes from "./modules/document/document.routes.js";
import timelineRoutes from "./modules/timeline/timeline.routes.js";
import summaryRoutes from "./modules/summary/summary.routes.js";

const app = express();

app.use(
  helmet()
);

app.use(
  cors({
    origin: env.frontendUrls,
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
  "/api/v1/patients",
  patientRoutes
);
app.use(
  "/api/v1/consultations",
  consultationRoutes
);
app.use(
  "/api/v1/intakes",
  intakeRoutes
);
app.use(
  "/api/v1/documents",
  documentRoutes
);
app.use(
  "/api/v1/timeline",
  timelineRoutes
);
app.use(
  "/api/v1/summary",
  summaryRoutes
);


app.use(
  notFound
);

app.use(
  errorHandler
);

export default app;
