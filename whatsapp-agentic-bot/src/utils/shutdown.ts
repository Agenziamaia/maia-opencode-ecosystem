// OPS: Graceful Shutdown - Handle SIGTERM/SIGINT
// Role: Clean shutdown of all services without data loss

export function setupGracefulShutdown(services: any) {
  const shutdownTimeout = 10000; // 10 seconds max

  const handleShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);

    try {
      // 1. Stop accepting new webhooks (Gateway)
      if (services.gateway) {
        console.log('🔌 Stopping Gateway...');
        await services.gateway.close();
      }

      // 2. Stop processing new jobs (Workers)
      if (services.workers) {
        console.log('⚙️ Stopping Workers...');
        await services.workers.close();
      }

      // 3. Stop scheduler (Scheduler)
      if (services.scheduler) {
        console.log('⏰ Stopping Scheduler...');
        await services.scheduler.close();
      }

      // 4. Close database (Database)
      if (services.db) {
        console.log('💾 Closing Database...');
        services.db.close();
      }

      // 5. Close Redis (Redis)
      if (services.redis) {
        console.log('📦 Closing Redis...');
        await services.redis.close();
      }

      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error: any) {
      console.error('❌ Error during shutdown:', error.message);
      process.exit(1);
    }
  };

  // Force shutdown after timeout
  const forceShutdown = () => {
    console.error('❌ Shutdown timeout reached, forcing exit');
    process.exit(1);
  };

  // Set up timeout for force shutdown
  let shutdownTimer: NodeJS.Timeout;

  const startShutdownTimer = () => {
    shutdownTimer = setTimeout(forceShutdown, shutdownTimeout);
  };

  const clearShutdownTimer = () => {
    if (shutdownTimer) {
      clearTimeout(shutdownTimer);
    }
  };

  // Handle signals
  process.on('SIGTERM', () => {
    startShutdownTimer();
    handleShutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    startShutdownTimer();
    handleShutdown('SIGINT');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    clearShutdownTimer();
    startShutdownTimer();
    handleShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    console.error('❌ Unhandled Rejection:', reason);
    clearShutdownTimer();
    startShutdownTimer();
    handleShutdown('unhandledRejection');
  });

  console.log('✅ Graceful shutdown handlers registered');
}
