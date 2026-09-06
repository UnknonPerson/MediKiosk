import app from './app.js';
import env from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

let server;
let shuttingDown = false;

async function startServer() {
  await connectDatabase();

  server = app.listen(env.server.port, () => {
    console.info(JSON.stringify({
      level: 'info',
      event: 'server.started',
      port: env.server.port,
      environment: env.nodeEnv,
    }));
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.info(JSON.stringify({ level: 'info', event: 'server.shutting_down', signal }));

  if (server) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }

  await disconnectDatabase();
}

process.once('SIGINT', () => shutdown('SIGINT').then(() => process.exit(0)).catch(() => process.exit(1)));
process.once('SIGTERM', () => shutdown('SIGTERM').then(() => process.exit(0)).catch(() => process.exit(1)));

startServer().catch((error) => {
  console.error(JSON.stringify({
    level: 'error',
    event: 'server.start_failed',
    errorName: error.name,
  }));
  process.exit(1);
});
