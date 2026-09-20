import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes';
import { getDatabase } from './server/db';
import { deadlineReminderService } from './server/services/emailReminderService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database
  await getDatabase();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CareerBridge API Server',
      timestamp: new Date().toISOString(),
      database: 'SQLite (sql.js Wasm)',
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerBridge full-stack server running on http://0.0.0.0:${PORT}`);

    // Background Daemon: Initial 24h deadline reminder scan shortly after startup
    setTimeout(() => {
      deadlineReminderService.scanAndSendReminders().catch((err) => {
        console.error('Background deadline reminder scan error:', err);
      });
    }, 5000);

    // Periodic scanner: check every 15 minutes for opportunities entering the 24h window
    const REMINDER_SCAN_INTERVAL_MS = 15 * 60 * 1000;
    setInterval(() => {
      deadlineReminderService.scanAndSendReminders().catch((err) => {
        console.error('Periodic deadline reminder scan error:', err);
      });
    }, REMINDER_SCAN_INTERVAL_MS);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
