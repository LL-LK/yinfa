import express from 'express';
import cors from 'cors';
import compression from 'compression';
import routes from './routes';
import { initDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(compression({ level: 6 }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Travel Mini Program API Server');
});

async function startServer() {
  try {
    await initDatabase();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();