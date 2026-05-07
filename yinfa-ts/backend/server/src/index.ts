import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import routes from './routes';
import { initDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 8000;

// 允许的来源列表（用于生产环境）
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['*'];

app.use(compression({ level: 6 }));
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// 静态文件服务
const imageDir = path.join(__dirname, '../../../../yinfa-ts/image');
app.use('/image', express.static(imageDir));
console.log(`Serving static images from: ${imageDir}`);

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

async function startServer() {
  try {
    await initDatabase();
    console.log('Database initialized');

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();