import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import env from './config/env.js';
import requestContext from './middleware/requestContext.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import ApiError from './utils/ApiError.js';
import ApiResponse from './utils/ApiResponse.js';
import authRouter from './modules/auth/auth.routes.js';
import patientRouter from './modules/patients/patient.routes.js';
import doctorRouter from './modules/doctors/doctor.routes.js';
import identityRouter from './modules/identity/identity.routes.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.server.trustProxy);

app.use(requestContext);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.cors.origins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new ApiError(403, 'Origin is not allowed by CORS policy', {
      code: 'CORS_ORIGIN_FORBIDDEN',
    }));
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  maxAge: 86_400,
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

app.use('/api', rateLimit({
  windowMs: env.rateLimit.windowMs,
  limit: env.rateLimit.max,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      error: { code: 'RATE_LIMITED' },
      requestId: req.requestId,
    });
  },
}));

function healthCheck(req, res) {
  res.status(200).json(new ApiResponse({
    service: env.serviceName,
    status: 'ok',
    timestamp: new Date().toISOString(),
  }, 'Service is healthy'));
}

app.get('/health', healthCheck);
app.get('/api/v1/health', healthCheck);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/identity', identityRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
