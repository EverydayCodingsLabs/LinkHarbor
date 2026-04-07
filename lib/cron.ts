import cron from 'node-cron';
import { storage } from './storage';

export function initCron() {
  // Run cleanup every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Cleanup] Starting hourly cleanup of expired jobs...');
    const count = await storage.cleanupExpired();
    console.log(`[Cleanup] Successfully removed ${count} expired jobs.`);
  });
}
