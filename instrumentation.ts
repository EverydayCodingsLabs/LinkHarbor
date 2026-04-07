export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initCron } = await import('./lib/cron');
    const { storage } = await import('./lib/storage');
    
    await storage.init();
    initCron();
    console.log('✅ LinkHarbor Services Initialized');
  }
}
