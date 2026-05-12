import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import routes from './routes';
import paymentRoutes from './routes/payment';
import { initDatabase, stopBackupTimer } from './database';
import logger from './logger';
import { requestLogger } from './middleware/requestLogger';

const app = express();
const PORT = process.env.PORT || 8000;

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['*'];

app.use(helmet());
app.use(compression({ level: 6 }));
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
// 保存原始body用于微信支付回调验签（必须在express.json之后）
app.use('/api/pay/callback', express.json({
  verify: (req: import('http').IncomingMessage, _res, buf: Buffer) => {
    (req as any).rawBody = buf.toString();
  }
}));
app.use(requestLogger);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 1, error: '请求过于频繁，请稍后再试' }
});
app.use('/api', limiter);

// 静态文件服务
const imageBaseUrl = process.env.IMAGE_BASE_URL || '';
if (imageBaseUrl) {
  logger.info(`Images served from CDN: ${imageBaseUrl}`);
} else {
  const imageDir = path.join(__dirname, '../../../../yinfa-ts/image');
  app.use('/image', express.static(imageDir, {
    maxAge: '7d',
    immutable: true
  }));
  logger.info(`Serving static images from: ${imageDir}`);
}

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Travel Mini Program API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.use('/api', routes);
app.use('/api/pay', paymentRoutes);

async function startServer() {
  try {
    await initDatabase();
    logger.info('Database initialized');

    app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  stopBackupTimer();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  stopBackupTimer();
  process.exit(0);
});

startServer();