import express from 'express';
import cors from 'cors';
import { layoutsRouter } from './routes/layouts.js';
import { exportRouter } from './routes/export.js';
import { galleryRouter } from './routes/gallery.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/layouts', layoutsRouter);
app.use('/api/export', exportRouter);
app.use('/api/gallery', galleryRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
