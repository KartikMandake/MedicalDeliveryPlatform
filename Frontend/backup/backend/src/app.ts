import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes/index';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  
  // Security and utilities
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
  app.use(morgan('combined'));
  
  // Parsers
  app.use(express.json({ limit: '10mb' }));
  
  // Custom Middlewares (placeholders)
  // app.use(requestId);
  
  // Mount all API routes
  app.use('/api', router);
  
  // Global error handler
  app.use(errorHandler);
  
  return app;
}
