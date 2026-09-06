import mongoose from 'mongoose';
import env from './env.js';

mongoose.set('strictQuery', true);

export async function connectDatabase() {
  mongoose.connection.on('error', (error) => {
    console.error(JSON.stringify({
      level: 'error',
      event: 'database.connection_error',
      errorName: error.name,
    }));
  });

  mongoose.connection.on('disconnected', () => {
    console.warn(JSON.stringify({ level: 'warn', event: 'database.disconnected' }));
  });

  await mongoose.connect(env.database.uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  console.info(JSON.stringify({
    level: 'info',
    event: 'database.connected',
    host: mongoose.connection.host,
    database: mongoose.connection.name,
  }));
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected) {
    await mongoose.disconnect();
  }
}
